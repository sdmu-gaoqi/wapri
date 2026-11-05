import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import type {
  ActionType,
  FilterState,
  Key,
  PageInfo,
  ProTableFormAction,
  ProTableProps,
  ProTableRequestContext,
  RequestParams,
  SortState,
} from '../types'

const DEFAULT_PAGE_SIZE = 10

function getInitialSearchValues<T extends object>(columns: ProTableProps<T>['columns']): Record<string, unknown> {
  return (columns || []).reduce<Record<string, unknown>>((values, column) => {
    if (!column.hideInForm && column.search !== false && column.initialValue !== undefined) {
      const key = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex
      values[key] = column.initialValue
    }
    return values
  }, {})
}

export function useProTableData<T extends object, U extends Record<string, unknown>>(
  props: Readonly<ProTableProps<T, U>>,
  tabActiveKey?: Ref<Key>,
) {
  const dataSource = shallowRef<T[]>(props.defaultData ?? props.dataSource ?? [])
  // 自动请求会在组件挂载后触发；首帧先保持加载态，避免在请求发起前短暂展示空状态。
  const loading = ref(Boolean(props.request) && !props.manualRequest)
  const error = ref<Error | null>(null)
  const searchValues = ref<Record<string, unknown>>(getInitialSearchValues(props.columns))
  const requestContext = ref<ProTableRequestContext>({ quickDateSelections: {} })
  const sort = ref<SortState>({})
  const filter = ref<FilterState>({})
  const pageInfo = ref<PageInfo>({
    current: props.pagination === false ? 1 : (props.pagination?.current ?? 1),
    pageSize: props.pagination === false ? Number.MAX_SAFE_INTEGER : (props.pagination?.pageSize ?? DEFAULT_PAGE_SIZE),
    total: props.dataSource?.length ?? props.defaultData?.length ?? 0,
  })
  let requestId = 0
  let disposed = false

  function getRequestParams(): RequestParams<U> {
    const params = Object.assign(
      {
        current: pageInfo.value.current,
        pageSize: pageInfo.value.pageSize,
      } as RequestParams<U>,
      { tabActiveKey: tabActiveKey?.value },
      props.params ?? {},
      searchValues.value,
    )
    return props.beforeSearchSubmit ? props.beforeSearchSubmit(params) : params
  }

  /** 请求失败时统一清空表格数据和分页总数，避免页面继续展示上一次请求结果。 */
  function resetData(): void {
    const emptyData: T[] = []
    dataSource.value = emptyData
    pageInfo.value.total = 0
    props.onDataSourceChange?.(emptyData)
  }

  async function load(): Promise<void> {
    if (!props.request) {
      const staticData = props.dataSource ?? props.defaultData ?? []
      dataSource.value = staticData
      pageInfo.value.total = staticData.length
      props.onDataSourceChange?.(staticData)
      return
    }

    const currentRequestId = ++requestId
    loading.value = true
    error.value = null

    try {
      const result = await props.request(getRequestParams(), sort.value, filter.value, requestContext.value)
      if (disposed || currentRequestId !== requestId) return
      const nextData = result.success === false ? [] : result.data
      dataSource.value = nextData
      pageInfo.value.total = result.total ?? nextData.length
      props.onLoad?.(nextData)
      props.onDataSourceChange?.(nextData)
    } catch (reason) {
      if (disposed || currentRequestId !== requestId) return
      const requestError = reason instanceof Error ? reason : new Error(String(reason))
      error.value = requestError
      resetData()
      props.onRequestError?.(requestError)
    } finally {
      if (!disposed && currentRequestId === requestId) loading.value = false
    }
  }

  // 查询提交允许并发请求；requestId 会保证只有最后一次请求结果更新表格，支持快速切换卡片筛选。
  async function submitSearch(values: Record<string, unknown>, context?: ProTableRequestContext): Promise<void> {
    searchValues.value = { ...values }
    requestContext.value = context ?? { quickDateSelections: {} }
    pageInfo.value.current = 1
    props.onSubmit?.(getRequestParams())
    await load()
  }

  async function resetSearch(): Promise<void> {
    searchValues.value = getInitialSearchValues(props.columns)
    requestContext.value = { quickDateSelections: {} }
    pageInfo.value.current = 1
    props.onReset?.()
    await load()
  }

  /**
   * 单项移除某个筛选项：更新 searchValues、回第一页、重新请求。
   * 已选条件条 / ProTableSearchForm 监听 searchValues 自动同步。
   */
  async function removeSearchField(key: string): Promise<void> {
    if (!key || !(key in searchValues.value)) return
    const next = { ...searchValues.value }
    delete next[key]
    searchValues.value = next
    const nextQuickDateSelections = { ...requestContext.value.quickDateSelections }
    delete nextQuickDateSelections[key]
    requestContext.value = { quickDateSelections: nextQuickDateSelections }
    pageInfo.value.current = 1
    await load()
  }

  async function reload(resetPageIndex = false): Promise<void> {
    if (resetPageIndex) pageInfo.value.current = 1
    await load()
  }

  async function reloadAndRest(): Promise<void> {
    await resetSearch()
  }

  function setPageInfo(nextPage: Partial<PageInfo>): void {
    if (nextPage.current !== undefined) {
      pageInfo.value.current = Math.max(1, nextPage.current)
    }
    if (nextPage.pageSize !== undefined && props.pagination !== false) {
      pageInfo.value.pageSize = Math.max(1, nextPage.pageSize)
    }
    if (nextPage.total !== undefined) pageInfo.value.total = Math.max(0, nextPage.total)
  }

  function getAction(formRef: ProTableFormAction): ActionType<T> {
    return {
      reload,
      reloadAndRest,
      reset: resetSearch,
      clearSelected: () => undefined,
      setPageInfo,
      toggleRowExpansion: () => undefined,
      expandAll: () => undefined,
      collapseAll: () => undefined,
      formRef,
    }
  }

  watch(
    () => props.params,
    () => {
      void reload(true)
    },
    { deep: true },
  )

  watch(
    () => props.dataSource,
    (nextData) => {
      if (!props.request && nextData) {
        dataSource.value = nextData
        pageInfo.value.total = nextData.length
      }
    },
    { deep: true },
  )

  if (tabActiveKey) {
    watch(tabActiveKey, () => {
      void reload(true)
    })
  }

  onMounted(() => {
    if (!props.manualRequest) void load()
  })

  onBeforeUnmount(() => {
    disposed = true
    requestId += 1
  })

  return {
    dataSource,
    loading,
    error,
    searchValues,
    sort,
    filter,
    requestContext,
    pageInfo,
    getRequestParams,
    load,
    submitSearch,
    resetSearch,
    removeSearchField,
    reload,
    reloadAndRest,
    setPageInfo,
    getAction,
  }
}
