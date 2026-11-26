import type { WaDateRange, WaNumberRange } from '../../types'
import { formatRangeText } from './date'
import type {
  FilterBarModel,
  FilterCascaderOption,
  FilterField,
  FilterSelectField,
  FilterSummaryChip,
  FilterTagField,
  FilterValue,
} from './types'

/** 统一值的读取、克隆与摘要文案：全部是纯函数，组件里只管交互，不重复写判断 */

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export const isRangeValue = (value: unknown): value is WaNumberRange =>
  isRecord(value) && ('min' in value || 'max' in value)

export const isDateValue = (value: unknown): value is WaDateRange =>
  isRecord(value) && typeof value.start === 'string' && typeof value.end === 'string'

export const toRangeValue = (value: unknown): WaNumberRange | undefined => {
  if (!isRangeValue(value)) return undefined
  const range: WaNumberRange = {}
  if (typeof value.min === 'number') range.min = value.min
  if (typeof value.max === 'number') range.max = value.max
  return range
}

export const toDateValue = (value: unknown): WaDateRange | undefined => {
  if (!isDateValue(value)) return undefined
  const range: WaDateRange = { start: value.start, end: value.end }
  if (value.shortcut) range.shortcut = value.shortcut
  return range
}

/** tag / select 都可能是单选或多选，统一读成数组，子控件不用各自判断 */
export const toSelectionList = (value: unknown): string[] => {
  if (typeof value === 'string') return value ? [value] : []
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

export const isEmptyFilterValue = (value: FilterValue | undefined): boolean => {
  if (value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (isDateValue(value)) return !value.start || !value.end
  if (isRangeValue(value)) return value.min === undefined && value.max === undefined
  return true
}

const cloneFilterValue = (value: FilterValue): FilterValue => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (isDateValue(value)) return { ...value }
  return { ...value }
}

/**
 * 清掉空值并深拷贝。
 * 空值（空串、空数组、只有一端的区间）不该进 v-model：父组件拿去做接口参数时还得再过滤一遍。
 */
export const compactModel = (model: FilterBarModel): FilterBarModel => {
  const result: FilterBarModel = {}
  for (const [key, value] of Object.entries(model)) {
    if (value === undefined || isEmptyFilterValue(value)) continue
    result[key] = cloneFilterValue(value)
  }
  return result
}

const optionLabel = (field: FilterTagField | FilterSelectField, value: string): string =>
  field.options.find((option) => option.value === value)?.label ?? value

/**
 * 级联路径：按 value 在树里反查出「一级 → 二级 → 三级」的选项链。
 *
 * 值只存叶子 value（业务上就是最终要传给接口的分类 ID），展示需要的完整路径
 * 由 options 现场反查，父组件不用再自己维护一份 id → 路径的映射。
 */
export const findCascaderPath = (options: FilterCascaderOption[], value?: string): FilterCascaderOption[] => {
  if (!value) return []

  for (const option of options) {
    if (option.value === value) return [option]

    const path = findCascaderPath(option.children ?? [], value)

    if (path.length > 0) return [option, ...path]
  }

  return []
}

/** 单个字段的值摘要：筛选条上的触发器、已选条件胶囊共用这一份文案 */
export const formatFilterValue = (field: FilterField, value: FilterValue): string => {
  switch (field.type) {
    case 'tag':
    case 'select': {
      const labels = toSelectionList(value).map((item) => optionLabel(field, item))
      if (labels.length === 0) return ''
      // 多选只展示首个 + 剩余数量：筛选条一行放不下全部标签
      return labels.length > 1 ? `${labels[0]} +${labels.length - 1}` : labels[0]
    }
    case 'cascader': {
      const labels = findCascaderPath(field.options, typeof value === 'string' ? value : '').map(
        (option) => option.label,
      )
      if (labels.length === 0) return ''
      // 筛选条一行放不下多级路径时由 CSS 省略；只想看末级就传 leafOnly
      if (field.leafOnly) return labels[labels.length - 1]

      return labels.join(field.separator ?? ' / ')
    }
    case 'range': {
      const range = toRangeValue(value)
      if (!range) return ''
      const unit = field.unit ?? ''
      const min = range.min === undefined ? '' : `${range.min}${unit}`
      const max = range.max === undefined ? '' : `${range.max}${unit}`
      return min && max ? `${min}~${max}` : min || max
    }
    case 'date': {
      const range = toDateValue(value)
      if (!range) return ''
      return range.shortcut || formatRangeText(range.start, range.end)
    }
    default:
      return ''
  }
}

export const createSummaryChips = (fields: FilterField[], model: FilterBarModel): FilterSummaryChip[] => {
  const chips: FilterSummaryChip[] = []
  for (const field of fields) {
    const value = model[field.key]
    if (value === undefined || isEmptyFilterValue(value)) continue
    const text = formatFilterValue(field, value)
    if (text) chips.push({ key: field.key, label: field.label, text })
  }
  return chips
}

/** 字段上的 inline 显式优先，其次看容器给的 inlineKeys */
export const isFieldInline = (field: FilterField, inlineKeys?: string[]): boolean =>
  field.inline ?? (inlineKeys ? inlineKeys.includes(field.key) : false)
