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

/**
 * 分类的最大层级。达到这一级的分类不再作为「上级分类」出现，
 * 也就不允许在它下面继续新建。
 */
export const fileModalGroupMaxDepth = 3

/** 分类弹窗里「上级分类」的标签文案。 */
export const fileModalGroupParentLabel = '上级分类'

/** 分类弹窗里「分类名称」的标签文案。 */
export const fileModalGroupNameLabel = '分类名称'

/** 分类弹窗里「上级分类」的占位文案。 */
export const fileModalGroupParentPlaceholder = '不选则为一级分类'

/** 分类弹窗里「分类名称」的占位文案，同时作为必填校验提示。 */
export const fileModalGroupNamePlaceholder = '请输入分类名称'

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

/** FileModal 分组新建按钮的默认文案。 */
export const fileModalAddGroupText = '添加分类'

/** FileModal 分组编辑按钮的默认文案。 */
export const fileModalEditGroupText = '编辑分类'

/** FileModal 分组删除按钮的默认文案。 */
export const fileModalRemoveGroupText = '删除分类'

/** FileModal 分组删除确认弹窗的默认提示文案。 */
export const fileModalRemoveGroupConfirmText = '确定删除该分类吗？分类下的素材不会被删除。'

/** FileModal 左侧分组的「更多操作」按钮文案。 */
export const fileModalGroupMoreText = '更多操作'

/** FileModal 表格视图的默认列配置标题。 */
export const fileModalTableNameText = '图片名称'
export const fileModalTableSizeText = '大小'
export const fileModalTableTimeText = '上传时间'
export const fileModalTableActionText = '操作'
export const fileModalPreviewActionText = '预览'

/** FileModal 排序选项，`value` 会作为 `sortBy` 参数传给 request。 */
export const fileModalSortOptions = [
  { label: '最新上传', value: 'latest' },
  { label: '名称 A-Z', value: 'name' },
  { label: '文件从大到小', value: 'size' },
] as const

/** FileList 默认每行列数。 */
export const fileListDefaultColumns = 4

/** FileList 空列表文案。 */
export const fileListEmptyText = '暂无文件'

/** FileList 预览按钮的提示文案。 */
export const fileListPreviewText = '预览'

/** FileList 删除按钮的提示文案。 */
export const fileListRemoveText = '删除'

/** FileList 文档预览加载中的文案。 */
export const fileListPreviewLoadingText = '正在加载预览…'

/** FileList 文档预览失败的文案。 */
export const fileListPreviewErrorText = '预览失败，请下载后查看'

/** FileList 文档预览弹窗宽度：桌面 880px，窄屏跟随视口。 */
export const fileListPreviewDialogWidth = 'min(880px, 92vw)'

/** FileList 视频预览弹窗宽度：桌面 720px，窄屏跟随视口。 */
export const fileListVideoDialogWidth = 'min(720px, 92vw)'
