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

/** 多 tab 表单垂直导航的默认宽度。 */
export const tabFormNavWidth = 160

/** FileModal 素材网格的默认列数。 */
export const fileModalDefaultColumns = 6

/** FileModal 默认每页条数。 */
export const fileModalDefaultPageSize = 18

/** FileModal 每页条数可选项。 */
export const fileModalPageSizeOptions = [12, 18, 24, 36]

/** 新建分组名称的最大长度。 */
export const fileModalGroupNameMaxLength = 10

/** 新建分组的默认颜色。 */
export const fileModalDefaultGroupColor = '#409eff'

/**
 * FileModal 里代表「自定义」比例的占位值：按图片本身宽高等比裁剪。
 * 与 `CropperUpload` 的 `0`（自由拖拽）不同，FileModal 会给它换算成图片的真实比例。
 */
export const fileModalCustomRatio = 0

/** 「自定义」比例按钮的文案。 */
export const fileModalCustomRatioLabel = '自定义'

/** FileModal 上传按钮的默认文案。 */
export const fileModalUploadText = '上传素材'

/** FileModal 排序选项，`value` 会作为 `sortBy` 参数传给 request。 */
export const fileModalSortOptions = [
  { label: '最新上传', value: 'latest' },
  { label: '名称 A-Z', value: 'name' },
  { label: '文件从大到小', value: 'size' },
] as const
