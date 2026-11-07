export const defaultPrefix = 'wa-ui'

/** 字段宽度预设映射，对齐 pro-components 的 width 枚举。 */
export const fieldWidthMap = {
  xs: 104,
  sm: 216,
  md: 328,
  lg: 440,
  xl: 552,
} as const

/** 只读态的默认占位文本，与 ProTable 单元格保持一致。 */
export const fieldEmptyText = '-'

/** 日期类 valueType 的默认值格式。 */
export const fieldDateValueFormat = 'YYYY-MM-DD'

/** 日期时间类 valueType 的默认值格式。 */
export const fieldDateTimeValueFormat = 'YYYY-MM-DD HH:mm:ss'

/** 多行文本的默认自适应行数。 */
export const fieldTextAreaAutosize = { minRows: 2, maxRows: 6 } as const

/** 金额字段的默认小数位数。 */
export const fieldMoneyPrecision = 2

/** 金额字段的默认货币符号。 */
export const fieldMoneyCurrency = '¥'
