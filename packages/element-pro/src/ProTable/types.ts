import type {
  AlertProps,
  CascaderProps,
  ColProps,
  DatePickerProps,
  FormItemProps,
  InputNumberProps,
  InputProps,
  SelectProps,
  SwitchProps,
  TableProps,
} from 'element-plus'
import type { Ref, VNode, VNodeChild } from 'vue'
import type { DataIndex, Key, ValueEnum, ValueType } from '../shared/field/types'
import type {
  DateQuickSelectConfig as DateQuickSelectConfigProps,
  DateQuickSelectSelection,
  DateQuickSelectValueType,
} from '../DateQuickSelect'

// 字段级类型已上移到 shared/field，这里保持原有导出名，业务 import 路径不变。
export type { DataIndex, Key, ValueEnum, ValueEnumItem, ValueType } from '../shared/field/types'

export type SortOrder = 'ascend' | 'descend' | null
export type ProTableMode = 'table' | 'list'

export type ProTableDateValueType = DateQuickSelectValueType

/** 标签选择器配置。 */
export interface TagSelectorProps {
  /** 是否允许多选，默认 false。 */
  multiple?: boolean
  /** 是否展示用于清空筛选条件的“全部”标签，默认 true。 */
  showAll?: boolean
  /** “全部”标签的文案，默认“全部”。 */
  allText?: string
}

export type DateQuickSelectConfig = DateQuickSelectConfigProps

export type DateQuickSelect = boolean | DateQuickSelectConfig

export type ProTableDateQuickSelection = DateQuickSelectSelection

export interface ProTableRequestContext {
  /** 当前请求中通过日期快捷项选中的字段；手动选择的字段不会出现在此对象中。 */
  quickDateSelections: Record<string, ProTableDateQuickSelection>
}

export type CellRenderer<T> = (value: unknown, record: T, index: number) => VNodeChild

/** 组件 props 允许补充 Vue 事件监听等 Element Plus 未声明在 props 类型中的属性。 */
export type ProComponentProps<T extends object = Record<string, unknown>> = Partial<T> & Record<string, unknown>

export type SearchFormItemRenderer<T> = (
  value: unknown,
  column: ProColumn<T>,
  setValue: (value: unknown) => void,
) => VNodeChild

export interface ProColumn<T = Record<string, unknown>> {
  title: string
  dataIndex: DataIndex
  valueType?: ValueType
  valueEnum?: ValueEnum
  render?: CellRenderer<T>
  renderText?: (value: unknown, record: T, index: number) => unknown
  renderFormItem?: SearchFormItemRenderer<T>
  search?: boolean
  hideInTable?: boolean
  hideInForm?: boolean
  width?: number | string
  fixed?: boolean | 'left' | 'right'
  ellipsis?: boolean
  sorter?: boolean | ((left: T, right: T) => number)
  filters?: boolean | Array<{ text: string; value: Key }>
  initialValue?: unknown
  fieldProps?: { col?: ColProps; labelWidth?: number; requestNow?: boolean } & Record<string, unknown>
  /** 搜索表单项的 props，透传给 ElFormItem。 */
  formItemProps?: ProComponentProps<FormItemProps>
  /** 搜索项栅格的 props，优先级高于 fieldProps.col。 */
  colProps?: ColProps
  /** 表格列的 props，透传给 ElTableColumn。 */
  columnProps?: ProComponentProps
  /** valueType=text/textarea/password/money 使用的 ElInput props。 */
  inputProps?: ProComponentProps<InputProps>
  /** valueType=digit 使用的 ElInputNumber props。 */
  inputNumberProps?: ProComponentProps<InputNumberProps>
  /** valueType=select 使用的 ElSelect props。 */
  selectProps?: ProComponentProps<SelectProps>
  /** valueType=tag 使用的标签选择器配置，选项由 valueEnum 提供，搜索项默认占满一行。 */
  tagProps?: TagSelectorProps
  /** valueType=treeSelect 使用的 ElTreeSelect props。 */
  treeSelectProps?: ProComponentProps<SelectProps>
  /** valueType=cascader 使用的 ElCascader props。 */
  cascaderProps?: ProComponentProps<CascaderProps>
  /** valueType=date/dateRange/time/timeRange 使用的 ElDatePicker props。 */
  datePickerProps?: ProComponentProps<DatePickerProps>
  /** date/dateRange/time/timeRange 的快捷选择配置，默认关闭。开启时搜索项默认占满一行，且与自定义日期选择互斥。 */
  dateQuickSelect?: DateQuickSelect
  /** valueType=switch 使用的 ElSwitch props。 */
  switchProps?: ProComponentProps<SwitchProps>
}

export type SortState = Record<string, SortOrder>
export type FilterState = Record<string, Key[] | null>

export type RequestParams<U extends Record<string, unknown> = Record<string, unknown>> = U & {
  current: number
  pageSize: number
}

export interface RequestResult<T> {
  data: T[]
  success?: boolean
  total?: number
}

export type RequestFn<T, U extends Record<string, unknown> = Record<string, unknown>> = (
  params: RequestParams<U>,
  sort: SortState,
  filter: FilterState,
  context: ProTableRequestContext,
) => Promise<RequestResult<T>>

export type DownloadFn<U extends Record<string, unknown> = Record<string, unknown>> = (
  params: RequestParams<U>,
  sort: SortState,
  filter: FilterState,
  context: ProTableRequestContext,
) => void | Promise<void>

export interface PaginationConfig {
  current?: number
  pageSize?: number
  pageSizeOptions?: number[]
  showQuickJumper?: boolean
  showTotal?: boolean
}

export interface RowSelectionConfig<T> {
  selectedRowKeys?: Key[]
  onChange?: (keys: Key[], rows: T[]) => void
  /** 没有选中行时是否仍显示选中操作行。 */
  alwaysShowActions?: boolean
  /** @deprecated 请使用 alwaysShowActions。 */
  alwaysShowAlert?: boolean
}

export interface SearchConfig {
  searchText?: string
  resetText?: string
  labelWidth?: number | 'auto'
}

export interface ProTableFormConfig extends SearchConfig {
  filterType?: 'query' | 'light'
}

export interface PageInfo {
  current: number
  pageSize: number
  total: number
}

export interface ProTableTabItem {
  key: Key
  tab: string
  /** Tab 右侧的数量徽标。 */
  count?: number | string
  disabled?: boolean
}

export interface ProTableTabMoreConfig {
  /** 更多状态下拉菜单的触发文案，默认“更多状态”。 */
  text?: string
  /** 下拉中的更多状态项。 */
  options: ProTableTabItem[]
}

export interface ProTableListProps {
  /** 列表网格列数，默认 3。 */
  columns?: number
  /** 列表网格间距，默认 12px。 */
  gap?: number | string
}

export interface ProTableFormAction {
  /** 获取当前查询表单的全部字段值。 */
  getFieldsValue: () => Record<string, unknown>
  /** 获取指定查询字段的值。 */
  getFieldValue: (field: string) => unknown
  /** 批量设置查询表单字段值，不会自动提交查询。 */
  setFieldsValue: (values: Record<string, unknown>) => void
  /** 设置指定查询字段的值，不会自动提交查询。 */
  setFieldValue: (field: string, value: unknown) => void
  /** 提交当前查询表单并刷新数据。 */
  submit: () => Promise<void>
  /** 重置查询表单。 */
  resetFields: (names?: string[] | undefined) => void
}

export interface ActionType<T extends object = object> {
  reload: (resetPageIndex?: boolean) => Promise<void>
  reloadAndRest: () => Promise<void>
  reset: () => Promise<void>
  clearSelected: () => void
  setPageInfo: (page: Partial<PageInfo>) => void
  /** 直接替换当前页数据，不重新请求、不改分页；拖拽排序等需要即时回写顺序的场景用。 */
  setDataSource: (data: T[]) => void
  /** 控制指定树形数据行的展开状态；不传 expanded 时切换当前状态。 */
  toggleRowExpansion: (row: T, expanded?: boolean) => void
  /** 展开当前已加载树形数据中的全部父级节点。 */
  expandAll: () => void
  /** 收起当前已加载树形数据中的全部父级节点。 */
  collapseAll: () => void
  formRef: ProTableFormAction
}

/**
 * actionRef 容器：可直接传 Vue ref（JSX / JS 作用域传参），
 * 也可传 `{ current }` 容器对象（模板 `:action-ref` 绑定不会被解包的形态）。
 */
export type ActionRef<T extends object = object> = Ref<ActionType<T> | undefined> | { current?: ActionType<T> }

export interface ProTableOptions {
  reload?: boolean
}

export type ProTableDownload = boolean | string | VNode

/**
 * 粘性布局配置，对齐 ant-design Table `sticky`：
 * 表格模式下页面滚动时表头吸顶，横向溢出时底部滚动条吸底；列表模式下分页 footer 仍吸底。
 */
export interface StickyConfig {
  /** 粘性表头距离滚动容器顶部的偏移，默认 0 */
  offsetHeader?: number
  /** 粘性滚动条距离滚动容器底部的偏移，默认 0 */
  offsetScroll?: number
  /** 滚动容器，默认 window */
  getContainer?: () => HTMLElement | Window
}

export interface ProTableProps<
  T extends object = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>,
> {
  columns: ProColumn<T>[]
  dataSource?: T[]
  defaultData?: T[]
  request?: RequestFn<T, U>
  params?: U
  pagination?: false | PaginationConfig
  rowKey?: string | ((record: T, index: number) => Key)
  rowSelection?: false | RowSelectionConfig<T>
  search?: false | SearchConfig
  form?: ProTableFormConfig
  tabs?: ProTableTabItem[]
  /** 更多状态下拉配置。 */
  tabMore?: ProTableTabMoreConfig
  /** 可用的数据展示模式，默认仅展示表格。 */
  modes?: ProTableMode[]
  /** 受控的展示模式，配合 `v-model:mode` 使用；不传时由组件内部维护。 */
  mode?: ProTableMode
  /** 列表模式的内置网格配置。 */
  listProps?: ProTableListProps
  tabActiveKey?: Key
  defaultTabActiveKey?: Key
  headerTitle?: VNodeChild
  headerSubtitle?: VNodeChild
  headerAlert?: AlertProps
  /** 工具栏导出按钮配置；传 true 时默认显示“导出”。 */
  download?: ProTableDownload
  /**
   * 已选条件条前缀文案
   * @default '已筛选'
   */
  selectedFiltersTitle?: string
  toolBarRender?: (
    action: ActionType<T>,
    context: { selectedRowKeys: Key[]; selectedRows: T[] },
  ) => Array<VNodeChild> | false
  options?: false | ProTableOptions
  beforeSearchSubmit?: (params: RequestParams<U>) => RequestParams<U>
  manualRequest?: boolean
  columnEmptyText?: string | false
  loading?: boolean
  onLoad?: (data: T[]) => void
  onRequestError?: (error: Error) => void
  onSubmit?: (params: RequestParams<U>) => void
  onReset?: () => void
  /** 查询表单字段值发生变化时触发，支持同步或异步回调；第三个参数可区分日期快捷选择和手动选择。 */
  onFieldChange?: (fieldKey: string, value: unknown, context: ProTableRequestContext) => void | Promise<void>
  onTabChange?: (key: Key) => void
  /** 数据展示模式切换时触发。 */
  onModeChange?: (mode: ProTableMode) => void
  onDataSourceChange?: (data: T[]) => void
  /** 点击工具栏导出按钮时触发。 */
  onDownload?: DownloadFn<U>
  actionRef?: ActionRef<T>
  /**
   * 粘性表头与底部横向滚动条，行为对齐 ant-design Table `sticky`。
   * `true` 等同 `{ offsetHeader: 0, offsetScroll: 0 }`。
   */
  sticky?: boolean | StickyConfig
  /**
   * @default false
   * */
  showRequestError?: boolean
  /**
   * 可透传给Table的props
   * */
  tableProps?: ProComponentProps<TableProps>
}
