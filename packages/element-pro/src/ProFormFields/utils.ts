import type { CSSProperties } from 'vue'
import type { ValueEnum, ValueEnumItem } from '../shared/field/types'
import { fieldDateValueFormat, fieldDateTimeValueFormat, fieldWidthMap } from '../constant'
import type { ProFormFieldOption, ProFormFieldValueType, ProFormFieldWidth } from './types'

/** 日期类 valueType 的集合。 */
export const DATE_VALUE_TYPES: ProFormFieldValueType[] = ['date', 'dateRange', 'time', 'timeRange']

/** 日期类 valueType 到 `ElDatePicker` 的 `type` 映射。 */
export const DATE_PICKER_TYPE_MAP = {
  date: 'date',
  dateRange: 'daterange',
  time: 'datetime',
  timeRange: 'datetimerange',
} as const

/** 判断 valueType 是否由 `ElDatePicker` 渲染。 */
export const isDateValueType = (valueType: ProFormFieldValueType): boolean => DATE_VALUE_TYPES.includes(valueType)

/** 取日期类 valueType 对应的 `ElDatePicker` type。 */
export const getDatePickerType = (
  valueType: ProFormFieldValueType,
): (typeof DATE_PICKER_TYPE_MAP)[keyof typeof DATE_PICKER_TYPE_MAP] | undefined => {
  if (valueType === 'date' || valueType === 'dateRange' || valueType === 'time' || valueType === 'timeRange') {
    return DATE_PICKER_TYPE_MAP[valueType]
  }
  return undefined
}

/** 取日期类 valueType 的默认值格式。 */
export const getDateValueFormat = (valueType: ProFormFieldValueType): string =>
  valueType === 'time' || valueType === 'timeRange' ? fieldDateTimeValueFormat : fieldDateValueFormat

/** 把 `width` 预设或像素值转成行内样式。 */
export const getFieldWidthStyle = (width?: ProFormFieldWidth): CSSProperties | undefined => {
  if (width === undefined) return undefined
  const pixels = typeof width === 'number' ? width : fieldWidthMap[width]
  if (!pixels) return undefined
  return { width: `${pixels}px` }
}

/** 按 valueType 推导占位文案；显式传入的 placeholder 原样返回。 */
export const getFieldPlaceholder = (
  valueType: ProFormFieldValueType,
  label?: string,
  placeholder?: string,
): string | undefined => {
  if (placeholder !== undefined) return placeholder
  if (valueType === 'switch' || valueType === 'tag') return undefined
  if (valueType === 'select' || valueType === 'treeSelect' || valueType === 'cascader') return '请选择'
  if (valueType === 'date' || valueType === 'dateRange') return '请选择日期'
  if (valueType === 'time' || valueType === 'timeRange') return '请选择日期时间'
  return label ? `请输入${label}` : '请输入'
}

const optionToValueEnumItem = (option: ProFormFieldOption): ValueEnumItem => ({
  text: option.label,
  value: option.value,
  disabled: option.disabled,
  children: option.children?.length ? option.children.map(optionToValueEnumItem) : undefined,
})

/** 把显式 `options` 转成 `valueEnum`，供选项渲染与只读文本共用同一套解析。 */
export const optionsToValueEnum = (options?: ProFormFieldOption[]): ValueEnum | undefined => {
  if (!options?.length) return undefined
  return options.map(optionToValueEnumItem)
}
