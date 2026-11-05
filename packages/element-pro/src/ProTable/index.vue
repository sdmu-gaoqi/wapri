<script setup lang="ts" generic="T extends object, U extends Record<string, unknown>">
import { computed, isRef, isVNode, onBeforeUnmount, ref, useSlots, watch, type VNodeChild } from 'vue'
import {
  ElAlert,
  ElBadge,
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
} from 'element-plus'
import {
  ArrowDown,
  Menu as GridIcon,
  Loading as LoadingIcon,
  Operation as OperationIcon,
} from '@element-plus/icons-vue'
import type { Sort, TableInstance } from 'element-plus'
import ProTablePagination from './components/ProTablePagination.vue'
import ProTableSearchForm from './components/ProTableSearchForm.vue'
import ProTableSelectedFilters from './components/ProTableSelectedFilters.vue'
import ProTableSelectionActions from './components/ProTableSelectionActions.vue'
import ProTableToolbar from './components/ProTableToolbar.vue'
import { useProTableData } from './composables/useProTableData'
import { useProTableSelection } from './composables/useProTableSelection'
import { useStickyTable } from './composables/useStickyTable'
import { formatCellValue, getDataIndexKey, getDataIndexValue, getRecordKey } from './utils'
import type {
  ActionRef,
  Key,
  ProColumn,
  ProTableFormAction,
  ProTableMode,
  ProTableProps,
  ProTableRequestContext,
  SortOrder,
} from './types'
import { useConfig } from '../ConfigProvider/context'
import { isEmpty } from '@wapri/gutils'

const props = withDefaults(defineProps<ProTableProps<T, U>>(), {
  columnEmptyText: '-',
  sticky: true,
  showRequestError: false,
  search: () => ({}),
  pagination: () => ({}),
  options: () => ({}),
  columns: () => [],
  modes: () => ['table'],
  listProps: () => ({ columns: 3, gap: '12px' }),
})

defineOptions({ name: 'ProTable' })

const { prefix, size } = useConfig()

const sizeClass = computed(() => {
  return `${prefix.value}-pro-table__${size.value}`
})

const slots = useSlots()
const tableRef = ref<TableInstance>()
const tableWrapRef = ref<HTMLElement>()
const { tabActiveKey, defaultTabActiveKey, tabs, rowSelection, rowKey, showRequestError, tableProps } = props || {}

function normalizeModes(modes: ProTableMode[]): ProTableMode[] {
  const uniqueModes = modes.filter((mode, index) => modes.indexOf(mode) === index)
  return uniqueModes.length ? uniqueModes : ['table']
}

const availableModes = computed(() => normalizeModes(props.modes))
const innerMode = ref<ProTableMode>(availableModes.value[0])
const tabMoreOptions = computed(() => props.tabMore?.options ?? [])

/** Tab 激活态：受控优先，其次默认值，最后第一项。 */
const innerTabKey = ref<Key>(
  tabActiveKey ?? defaultTabActiveKey ?? tabs?.[0]?.key ?? tabMoreOptions.value[0]?.key ?? '',
)

const {
  dataSource,
  loading,
  error,
  searchValues,
  sort,
  filter,
  requestContext,
  pageInfo,
  load,
  getRequestParams,
  submitSearch: dataSubmitSearch,
  resetSearch: dataResetSearch,
  removeSearchField,
  reload,
  setPageInfo,
  getAction,
} = useProTableData(props, innerTabKey)

const {
  stickyEnabled,
  stickyWrapClass,
  stickyWrapStyle,
  stickyScrollRef,
  stickyScrollWidth,
  stickyScrollVisible,
  onStickyScroll,
} = useStickyTable(
  computed(() => props.sticky),
  tableWrapRef,
  computed(() => [dataSource.value, innerMode.value]),
  prefix,
)

type SearchFormExpose = Pick<ProTableFormAction, 'getFieldsValue' | 'setFieldsValue'> & {
  resetFields: (names?: string[]) => void
  getRequestContext: () => ProTableRequestContext
}

const searchFormRef = ref<SearchFormExpose>()
const searchCollapsed = ref(false)
const formRef: ProTableFormAction = {
  getFieldsValue: () => searchFormRef.value?.getFieldsValue() ?? { ...searchValues.value },
  getFieldValue: (field) => formRef.getFieldsValue()[field],
  setFieldsValue: (values) => {
    if (searchFormRef.value) {
      searchFormRef.value.setFieldsValue(values)
      return
    }
    searchValues.value = { ...searchValues.value, ...values }
  },
  setFieldValue: (field, value) => {
    formRef.setFieldsValue({ [field]: value })
  },
  submit: () => dataSubmitSearch(formRef.getFieldsValue(), searchFormRef.value?.getRequestContext()),
  resetFields: (names) => {
    searchFormRef.value?.resetFields(names)
  },
}

const { selectedRowKeys, selectedRows, setSelection, clearSelected } = useProTableSelection(
  dataSource,
  rowSelection,
  rowKey,
)

const action = getAction(formRef)

function handleClearSelected(): void {
  tableRef.value?.clearSelection()
  clearSelected()
}

action.clearSelected = handleClearSelected

const treeChildrenKey = computed(() => props.tableProps?.treeProps?.children ?? 'children')

function isTreeRow(value: unknown): value is T {
  return typeof value === 'object' && value !== null
}

function forEachTreeParent(rows: T[], callback: (row: T) => void): void {
  rows.forEach((row) => {
    const children = Reflect.get(row, treeChildrenKey.value)
    if (!Array.isArray(children) || !children.length) return
    callback(row)
    forEachTreeParent(children.filter(isTreeRow), callback)
  })
}

function toggleRowExpansion(row: T, expanded?: boolean): void {
  tableRef.value?.toggleRowExpansion(row, expanded)
}

function expandAll(): void {
  forEachTreeParent(dataSource.value, (row) => toggleRowExpansion(row, true))
}

function collapseAll(): void {
  forEachTreeParent(dataSource.value, (row) => toggleRowExpansion(row, false))
}

action.toggleRowExpansion = toggleRowExpansion
action.expandAll = expandAll
action.collapseAll = collapseAll

/**
 * 将 action 写入 actionRef 容器：
 * - 传入 Vue ref（JSX / JS 作用域直接传 ref 对象）→ 写 .value
 * - 传入 { current } 容器（模板 :action-ref 绑定）→ 写 .current
 * 注意：SFC 模板中 `:action-ref="ref"` 会把 ref 自动解包为 undefined，
 * 因此模板场景请使用 `ref="actionRef"`（配合下方 defineExpose）或 { current } 容器。
 */
function writeActionRef(target: ActionRef<T> | undefined): void {
  if (!target) return
  if (isRef(target)) target.value = action
  else target.current = action
}

/** 仅在容器仍指向当前 action 时清空，避免覆盖其他实例写入的引用。 */
function clearActionRef(target: ActionRef<T> | undefined): void {
  if (!target) return
  if (isRef(target)) {
    if (target.value === action) target.value = undefined
  } else if (target.current === action) {
    target.current = undefined
  }
}

watch(
  () => props.actionRef,
  (next, prev) => {
    clearActionRef(prev)
    writeActionRef(next)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearActionRef(props.actionRef)
})

/** 暴露命令式方法，支持 `<ProTable ref="actionRef" />` 模板引用。 */
defineExpose(action)

const hasSearchColumns = computed(() => props.columns.some((column) => !column.hideInForm && column.search !== false))
const searchEnabled = computed(() => props.search !== false && hasSearchColumns.value)
const selectionEnabled = computed(() => props.rowSelection !== false && props.rowSelection !== undefined)
const visibleColumns = computed(() => props.columns.filter((column) => !column.hideInTable))
const alwaysShowSelectionActions = computed(
  () =>
    selectionEnabled.value &&
    props.rowSelection !== false &&
    Boolean(props.rowSelection?.alwaysShowActions ?? props.rowSelection?.alwaysShowAlert),
)
const showReload = computed(() => props.options !== false && props.options?.reload !== false)
const hasPagination = computed(() => props.pagination !== false)
const externalLoading = computed(() => props.loading === true)
const hasTabMore = computed(() => tabMoreOptions.value.length > 0)
const hasTabs = computed(() => (props.tabs?.length ?? 0) > 0 || hasTabMore.value)
const activeTabMore = computed(() => tabMoreOptions.value.find((item) => item.key === innerTabKey.value))
const tabMoreText = computed(() => activeTabMore.value?.tab ?? props.tabMore?.text ?? '更多状态')
const showModeSelector = computed(() => availableModes.value.length > 1)
const showModeBar = computed(() => showModeSelector.value || Boolean(slots.selectModeBefore || slots.selectModeAfter))
function hasSearchFilterValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false
  return !Array.isArray(value) || value.length > 0
}

const hasSearchFilters = computed(() =>
  props.columns.some((column) => {
    if (column.hideInForm || column.search === false) return false
    return hasSearchFilterValue(searchValues.value[getDataIndexKey(column.dataIndex)])
  }),
)

const hasSearchActionSlots = computed(() => Boolean(slots.searchActionLeft || slots.searchActionRight))
const shouldRenderSearchForm = computed(
  () =>
    searchEnabled.value &&
    (!showModeSelector.value || !searchCollapsed.value || hasSearchFilters.value || hasSearchActionSlots.value),
)

const listStyle = computed(() => {
  const columns = props.listProps?.columns
  const gap = props.listProps?.gap
  const columnCount = typeof columns === 'number' && Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 3
  const gridGap = typeof gap === 'number' && Number.isFinite(gap) ? `${gap}px` : gap || '12px'
  return {
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    gap: gridGap,
  }
})

watch(
  availableModes,
  (modes) => {
    if (!modes.includes(innerMode.value)) innerMode.value = modes[0]
  },
  { deep: true },
)

const toolbarItems = computed<VNodeChild[]>(() => {
  if (!props.toolBarRender) return []
  const result = props.toolBarRender(action, {
    selectedRowKeys: selectedRowKeys.value,
    selectedRows: selectedRows.value,
  })
  return result === false ? [] : result
})

/** el-table 的 row-key：字符串直接透传，函数包装为 (row) => string。 */
const tableRowKey = computed<string | ((row: T) => string)>(() => {
  const rowKeyProp = props.rowKey
  if (typeof rowKeyProp === 'string') return rowKeyProp
  if (typeof rowKeyProp === 'function') return (row: T) => String(rowKeyProp(row, 0))
  return 'id'
})

watch(
  () => props.tabActiveKey,
  (key) => {
    if (key !== undefined && key !== innerTabKey.value) innerTabKey.value = key
  },
)

/** 数据变化后回放受控的 selectedRowKeys（el-table 换数据会清空内部选中）。 */
watch(
  () =>
    [
      dataSource.value,
      props.rowSelection !== false && props.rowSelection !== undefined ? props.rowSelection.selectedRowKeys : undefined,
      innerMode.value,
    ] as const,
  ([rows, keys, mode]) => {
    if (mode !== 'table') return
    if (!keys?.length || !tableRef.value) return
    const keySet = new Set(keys)
    rows.forEach((row) => {
      const rowKeyFn = tableRowKey.value
      const rowKey = typeof rowKeyFn === 'function' ? rowKeyFn(row) : getDataIndexValue(row, rowKeyFn)
      if (typeof rowKey === 'string' || typeof rowKey === 'number') {
        if (keySet.has(rowKey)) tableRef.value?.toggleRowSelection(row, true)
      }
    })
  },
  { flush: 'post' },
)

function handleTabChange(key: string | number): void {
  props.onTabChange?.(key)
}

function handleTabMoreChange(key: string | number): void {
  const item = tabMoreOptions.value.find((option) => option.key === key)
  if (!item || item.disabled || item.key === innerTabKey.value) return
  innerTabKey.value = item.key
  props.onTabChange?.(item.key)
}

function handleModeChange(mode: ProTableMode): void {
  if (mode === innerMode.value) return
  innerMode.value = mode
  props.onModeChange?.(mode)
}

function listItemKey(row: T, index: number): Key {
  return getRecordKey(row, index, props.rowKey)
}

function handleSearchSubmit(values: Record<string, unknown>, context: ProTableRequestContext): void {
  void dataSubmitSearch(values, context)
}

function handleSearchReset(): void {
  void dataResetSearch()
}

async function handleFieldChange(fieldKey: string, value: unknown, context: ProTableRequestContext): Promise<void> {
  await props.onFieldChange?.(fieldKey, value, context)
}

/** 已选条件条：单项 × 移除 */
function handleClearFilter(key: string): void {
  void removeSearchField(key)
}

/** 已选条件条：清除全部（复用搜索表单的重置逻辑） */
function handleClearAllFilters(): void {
  void dataResetSearch()
}

function handlePageChange(page: number): void {
  setPageInfo({ current: page })
  void load()
}

function handlePageSizeChange(pageSize: number): void {
  setPageInfo({ current: 1, pageSize })
  void load()
}

function onSelectionChange(rows: T[]): void {
  setSelection(rows)
}

/** el-table sort-change：映射为 pro-components 的 SortState 后重新请求。 */
function onSortChange(sortProps: Sort): void {
  const { prop, order } = sortProps
  if (!prop) return
  const next: SortOrder = order === 'ascending' ? 'ascend' : order === 'descending' ? 'descend' : null
  sort.value = { ...sort.value, [prop]: next }
  void load()
}

function cellKey(column: ProColumn<T>): string {
  return getDataIndexKey(column.dataIndex)
}

/** 单元格渲染优先级：具名插槽 > render > renderText > valueType 默认渲染 > 原始值。 */
function cellContent(column: ProColumn<T>, row: T, index: number): VNodeChild {
  const value = getDataIndexValue(row, column.dataIndex)
  if (column.render) return column.render(value, row, index)
  if (column.renderText)
    return formatCellValue(column.renderText(value, row, index), props.columnEmptyText, column.valueEnum)
  if (column.valueType === 'money') {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))
          ? Number(value)
          : null
    if (numeric !== null) return `¥${numeric.toFixed(2)}`
  }
  return formatCellValue(value, props.columnEmptyText, column.valueEnum)
}

function isVNodeChild(value: VNodeChild): boolean {
  return isVNode(value)
}

function handleDownload(): void | Promise<void> {
  if (!props.onDownload) return
  return props.onDownload(getRequestParams(), sort.value, filter.value, requestContext.value)
}
</script>

<template>
  <div>
    <ProTableToolbar
      :header-title="headerTitle"
      :header-subtitle="headerSubtitle"
      :toolbar-items="toolbarItems"
      :show-reload="showReload"
      :header-alert="props.headerAlert"
      :loading="loading"
      :download="props.download"
      @reload="reload()"
      @download="handleDownload"
    >
      <template #headerTitle>
        <slot name="headerTitle">{{ headerTitle || '' }}</slot>
      </template>
      <template #headerSubtitle>
        <slot name="headerSubtitle">{{ headerSubtitle || '' }}</slot>
      </template>
      <template
        v-if="slots.toolbar"
        #toolbar
      >
        <slot name="toolbar"></slot>
      </template>
    </ProTableToolbar>

    <slot
      v-if="slots.tableInfo"
      name="tableInfo"
    ></slot>

    <section
      :class="[`${prefix}-pro-table`, stickyEnabled && `${prefix}-pro-table--sticky`, `${sizeClass}`]"
      :style="stickyWrapStyle"
    >
      <div
        v-if="hasTabs"
        :class="`${prefix}-pro-table__tabs-row`"
      >
        <ElTabs
          v-if="tabs?.length"
          v-model="innerTabKey"
          :class="`${prefix}-pro-table__tabs`"
          @tab-change="handleTabChange"
        >
          <ElTabPane
            v-for="item in tabs"
            :key="String(item.key)"
            :name="item.key"
            :label="item.tab"
            :disabled="item.disabled"
            lazy
          >
            <template #label>
              <span :class="`${prefix}-pro-table__tab-label`">
                <span>{{ item.tab }}</span>
                <ElBadge
                  v-if="item.count !== undefined"
                  :value="item.count"
                  type="danger"
                />
              </span>
            </template>
          </ElTabPane>
        </ElTabs>

        <ElDropdown
          v-if="hasTabMore"
          :class="`${prefix}-pro-table__tabs-more`"
          trigger="click"
          @command="handleTabMoreChange"
        >
          <button
            type="button"
            :class="[
              `${prefix}-pro-table__tabs-more-trigger`,
              activeTabMore && `${prefix}-pro-table__tabs-more-trigger--active`,
            ]"
            :title="tabMoreText"
            :aria-label="tabMoreText"
          >
            <span :class="`${prefix}-pro-table__tabs-more-trigger-text`">{{ tabMoreText }}</span>
            <ElIcon><ArrowDown /></ElIcon>
          </button>

          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="item in tabMoreOptions"
                :key="String(item.key)"
                :command="item.key"
                :disabled="item.disabled"
                :class="item.key === innerTabKey && `${prefix}-pro-table__tab-more-option--active`"
              >
                <span :class="`${prefix}-pro-table__tab-more-option`">
                  <span>{{ item.tab }}</span>
                  <ElBadge
                    v-if="item.count !== undefined"
                    :value="item.count"
                    type="danger"
                  />
                </span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>

      <div
        v-if="slots.tabSub"
        :class="`${prefix}-pro-table__tabs-search`"
      >
        <slot name="tabSub"></slot>
      </div>

      <ProTableSearchForm
        v-if="shouldRenderSearchForm"
        ref="searchFormRef"
        :columns="columns"
        :model-value="searchValues"
        :search="search"
        :form="form"
        :collapsed="searchCollapsed"
        :collapse-action-in-mode-bar="showModeSelector"
        @submit="handleSearchSubmit"
        @reset="handleSearchReset"
        @field-change="handleFieldChange"
        @update:collapsed="searchCollapsed = $event"
      >
        <template #selectedFilters>
          <ProTableSelectedFilters
            :class="`${prefix}-pro-table__selected-filters--inline`"
            :columns="columns"
            :search-values="searchValues"
            :quick-date-selections="requestContext.quickDateSelections"
            :title="selectedFiltersTitle"
            @clear="handleClearFilter"
            @clear-all="handleClearAllFilters"
          />
        </template>
        <template
          v-if="slots.searchActionLeft || slots.searchActionRight"
          #searchActionLeft
        >
          <slot name="searchActionLeft"></slot>
        </template>
        <template
          v-if="slots.searchActionLeft || slots.searchActionRight"
          #searchActionRight
        >
          <slot name="searchActionRight"></slot>
        </template>
      </ProTableSearchForm>

      <ProTableSelectionActions
        v-if="alwaysShowSelectionActions || selectedRowKeys.length"
        :selected-row-keys="selectedRowKeys"
        :selected-rows="selectedRows"
        @clear="handleClearSelected"
      >
        <template
          v-if="slots.selectionActions"
          #default="{ selectedRowKeys: selectionKeys, selectedRows: selectionRows, clearSelected: clearSelection }"
        >
          <slot
            name="selectionActions"
            :selected-row-keys="selectionKeys"
            :selected-rows="selectionRows"
            :clear-selected="clearSelection"
          ></slot>
        </template>
      </ProTableSelectionActions>

      <ElAlert
        v-if="error && showRequestError"
        :class="`${prefix}-pro-table__error`"
        type="error"
        :title="error.message"
        :closable="false"
        show-icon
      />

      <div
        v-if="slots.tableTitle"
        :class="`${prefix}-pro-table__search-table`"
      >
        <slot name="tableTitle"></slot>
      </div>

      <div
        v-if="showModeBar"
        :class="`${prefix}-pro-table__mode-bar`"
      >
        <slot
          name="selectModeBefore"
          :mode="innerMode"
          :modes="availableModes"
          :data-source="dataSource"
          :action="action"
        ></slot>
        <div
          v-if="showModeSelector"
          :class="`${prefix}-pro-table__mode-selector`"
          role="group"
          aria-label="选择数据展示模式"
        >
          <ElButton
            v-for="mode in availableModes"
            :key="mode"
            :class="`${prefix}-pro-table__mode-button`"
            :type="innerMode === mode ? 'primary' : 'default'"
            :icon="mode === 'table' ? GridIcon : OperationIcon"
            plain
            circle
            :aria-label="mode === 'table' ? '表格模式' : '列表模式'"
            :aria-pressed="innerMode === mode"
            :title="mode === 'table' ? '表格模式' : '列表模式'"
            @click="handleModeChange(mode)"
          />
        </div>
        <ElButton
          v-if="showModeSelector && searchCollapsed && !hasSearchFilters"
          :class="`${prefix}-pro-table__search-toggle`"
          type="primary"
          :icon="ArrowDown"
          plain
          circle
          aria-label="展开搜索"
          title="展开搜索"
          @click="searchCollapsed = false"
        />
        <slot
          name="selectModeAfter"
          :mode="innerMode"
          :modes="availableModes"
          :data-source="dataSource"
          :action="action"
        ></slot>
      </div>

      <div
        ref="tableWrapRef"
        :class="[`${prefix}-pro-table__table-wrap`, stickyWrapClass]"
      >
        <ElTable
          v-if="innerMode === 'table'"
          ref="tableRef"
          v-bind="tableProps"
          :data="dataSource"
          :row-key="tableRowKey"
          @selection-change="onSelectionChange"
          @sort-change="onSortChange"
        >
          <ElTableColumn
            v-if="selectionEnabled"
            type="selection"
            width="48"
          />
          <ElTableColumn
            v-for="column in visibleColumns"
            :key="cellKey(column)"
            v-bind="column.columnProps"
            :prop="cellKey(column)"
            :label="column.title"
            :width="typeof column.width === 'number' ? column.width : column.width"
            :fixed="column.fixed"
            :show-overflow-tooltip="column.ellipsis === true"
            :sortable="column.sorter ? 'custom' : false"
          >
            <template #default="scope">
              <slot
                v-if="slots[cellKey(column)]"
                :name="cellKey(column)"
                :value="getDataIndexValue(scope.row as T, column.dataIndex)"
                :record="scope.row as T"
                :index="scope.$index"
              ></slot>
              <template v-else>
                <component
                  :is="cellContent(column, scope.row as T, scope.$index)"
                  v-if="isVNodeChild(cellContent(column, scope.row as T, scope.$index))"
                />
                <span v-else>{{ cellContent(column, scope.row as T, scope.$index) }}</span>
              </template>
            </template>
          </ElTableColumn>
          <template #empty>
            <slot name="empty">暂无数据</slot>
          </template>
        </ElTable>
        <div
          v-else
          :class="`${prefix}-pro-table__list`"
          :style="listStyle"
        >
          <div
            v-if="isEmpty(dataSource)"
            :class="`${prefix}-pro-table__list-empty`"
          >
            <slot name="empty">暂无数据</slot>
          </div>
          <template
            v-for="(item, index) in dataSource"
            v-else
            :key="listItemKey(item, index)"
          >
            <div :class="`${prefix}-pro-table__list-item`">
              <slot
                name="itemRender"
                :item="item"
                :record="item"
                :index="index"
                :data-source="dataSource"
                :mode="innerMode"
                :action="action"
              ></slot>
            </div>
          </template>
        </div>
        <div
          v-if="loading || externalLoading"
          :class="`${prefix}-pro-table__loading`"
          role="status"
        >
          <ElIcon class="is-loading"><LoadingIcon /></ElIcon>
          <span>加载中…</span>
        </div>
      </div>

      <div :class="`${prefix}-pro-table__sticky-footer`">
        <div
          v-show="stickyEnabled && stickyScrollVisible"
          ref="stickyScrollRef"
          :class="`${prefix}-pro-table__sticky-scroll`"
          @scroll="onStickyScroll"
        >
          <div
            :class="`${prefix}-pro-table__sticky-scroll-thumb`"
            :style="{ width: `${stickyScrollWidth}px` }"
          ></div>
        </div>
        <ProTablePagination
          v-if="hasPagination"
          :page="pageInfo.current"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.total"
          :pagination="pagination"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </section>
  </div>
</template>

<style lang="scss" src="./styles/index.scss" />
