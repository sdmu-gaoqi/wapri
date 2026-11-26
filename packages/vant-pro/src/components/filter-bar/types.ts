import type { WaDateRange, WaNumberRange } from '../../types'

/** WaFilterBar 及其子控件的对外类型 */

export interface FilterOption {
  label: string
  value: string
  disabled?: boolean
}

/** 级联选项：父子嵌套，只有没有 children 的叶子能被选中（如「一级 / 二级 / 三级」分类） */
export interface FilterCascaderOption {
  label: string
  value: string
  disabled?: boolean
  children?: FilterCascaderOption[]
}

/** 快捷时间项：点击时求值，保证「近 7 天」始终相对当前时间 */
export interface DateShortcut {
  name: string
  range: () => [string, string]
}

export type FilterDateType = 'date' | 'datetime' | 'month'

interface FilterFieldCommon {
  key: string
  label: string
  /** true 直接展示在筛选条上，false / 不传 收进「筛选」面板 */
  inline?: boolean
}

export interface FilterTagField extends FilterFieldCommon {
  type: 'tag'
  multiple?: boolean
  options: FilterOption[]
  placeholder?: string
}

export interface FilterRangeField extends FilterFieldCommon {
  type: 'range'
  min?: number
  max?: number
  unit?: string
  /** 小数位，避免 0.1 + 0.2 之类的浮点尾巴进到接口里 */
  precision?: number
  placeholder?: [string, string]
}

export interface FilterDateField extends FilterFieldCommon {
  type: 'date'
  dateType?: FilterDateType
  /** 不传时用内置的 近7天/近30天/本月/上月 */
  shortcuts?: DateShortcut[]
  placeholder?: string
}

export interface FilterSelectField extends FilterFieldCommon {
  type: 'select'
  options: FilterOption[]
  multiple?: boolean
  placeholder?: string
}

/** 级联：值是选中的叶子节点 value，路径展示由 options 反查 */
export interface FilterCascaderField extends FilterFieldCommon {
  type: 'cascader'
  options: FilterCascaderOption[]
  placeholder?: string
  /** 路径文案分隔符，默认 ` / ` */
  separator?: string
  /** 叶子文案是否只显示末级（默认 false，显示完整路径） */
  leafOnly?: boolean
}

export type FilterField = FilterTagField | FilterRangeField | FilterDateField | FilterSelectField | FilterCascaderField
export type FilterFieldType = FilterField['type']

export type FilterTagValue = string | string[]
export type FilterSelectValue = string | string[]
export type FilterCascaderValue = string
export type FilterRangeValue = WaNumberRange
export type FilterDateValue = WaDateRange

/** 统一值结构：tag/select 是 string | string[]，cascader 是叶子 value，range 是 min/max，date 是 start/end */
export type FilterValue =
  | FilterTagValue
  | FilterSelectValue
  | FilterCascaderValue
  | FilterRangeValue
  | FilterDateValue

/** key 由 fields 决定，父组件可以只放已选中的项 */
export type FilterBarModel = Record<string, FilterValue | undefined>

export interface FilterSummaryChip {
  key: string
  label: string
  text: string
}

export interface WaFilterBarProps {
  modelValue?: FilterBarModel
  fields: FilterField[]
  /** 兜底的展开名单：字段上显式给了 inline 时以字段为准 */
  inlineKeys?: string[]
  expandText?: string
  confirmText?: string
  resetText?: string
  showReset?: boolean
  /** 是否在筛选条下方展示已选条件胶囊，默认关闭（手机上那一排太占地方） */
  showSummary?: boolean
  /** 摘要区超过一行时是否允许收起 */
  collapsible?: boolean
  /** true：改动立即同步 v-model；默认 false，面板内的改动要点「确定」才提交 */
  autoConfirm?: boolean
}

export interface WaFilterBarEmits {
  'update:modelValue': [value: FilterBarModel]
  'change': [value: FilterBarModel, key?: string]
  'confirm': [value: FilterBarModel]
  'reset': []
}

export interface WaFilterSummaryProps {
  chips: FilterSummaryChip[]
  /** true 时超过一条可以收起，只留第一条 */
  collapsible?: boolean
}

export interface WaFilterSummaryEmits {
  close: [key: string]
}

export interface WaFilterTagProps {
  field: FilterTagField
  modelValue?: FilterTagValue
  inline?: boolean
  /** 单字段面板里标题已经有了字段名，行内不再重复一遍 */
  hideLabel?: boolean
  /** 选项排布：面板里三列网格，字段下拉里竖列表 */
  layout?: 'grid' | 'list'
}

export interface WaFilterRangeProps {
  field: FilterRangeField
  modelValue?: FilterRangeValue
  inline?: boolean
  hideLabel?: boolean
}

export interface WaFilterDateProps {
  field: FilterDateField
  modelValue?: FilterDateValue
  inline?: boolean
  hideLabel?: boolean
}

export interface WaFilterSelectProps {
  field: FilterSelectField
  modelValue?: FilterSelectValue
  inline?: boolean
  hideLabel?: boolean
  /** 选项排布：面板里用格子 + 弹层，字段下拉里直接竖列表 */
  layout?: 'grid' | 'list'
}

export interface WaFilterCascaderProps {
  field: FilterCascaderField
  modelValue?: FilterCascaderValue
  inline?: boolean
  hideLabel?: boolean
  /**
   * 挂载后立刻展开级联弹层。
   *
   * 筛选条的字段下拉里只有这一个控件，传 true 才能做到「点触发器 → 直接选分类」，
   * 不用先点开一层窄下拉再点格子。
   */
  autoOpen?: boolean
}
