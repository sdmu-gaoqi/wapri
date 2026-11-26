/** WaUpload 对外类型：列表项、来源、pick 返回值与事件载荷 */

/** 列表项状态，与 Vant Uploader 的 status 命名保持一致，方便父组件直接复用 */
export type UploadStatus = 'uploading' | 'done' | 'failed'

/**
 * 列表项。
 * 组件只负责展示与交互，url/name/size 全部由父组件给，组件不碰任何上传接口。
 */
export interface UploadFileItem {
  id?: string
  url?: string
  name?: string
  size?: number
  status?: UploadStatus
  /** 上传中进度 0-100，缺省按 0 展示 */
  percent?: number
  /** 显式给 false 时不显示右上角删除按钮（例如业务侧只允许追加） */
  deletable?: boolean
}

/** 面板里的一个来源，key 由业务定义，组件只用来回传和取默认图标 */
export interface UploadSource {
  key: string
  name: string
  /** van-icon 名称；不传时按 key 取内置图标 */
  icon?: string
}

/** pick 的返回值：组件只用到这几项渲染列表，其他业务字段父组件自己留着 */
export interface UploadPickResult {
  id?: string
  url?: string
  name?: string
  size?: number
  /** 原样透传的业务句柄（File、桥接原始返回值等），组件不读取 */
  raw?: unknown
}

/**
 * pick 的第二个参数。
 * 业务侧拿 accept / maxSize / remaining 时不用再回读组件 props，避免两边各算一份。
 */
export interface UploadPickContext {
  accept: string
  maxSize: number
  /** 还能再选几个 */
  remaining: number
}

export type UploadPickHandler = (
  source: UploadSource,
  context: UploadPickContext,
) => Promise<UploadPickResult | UploadPickResult[] | null | void>

export type UploadErrorType = 'size' | 'count' | 'pick'

export interface UploadErrorPayload {
  type: UploadErrorType
  message: string
  /** 触发出错的那一项，size / pick 场景有值 */
  item?: UploadFileItem
  source?: UploadSource
}

export interface WaUploadProps {
  modelValue?: UploadFileItem[]
  /** 业务注入的取图/取文件能力，组件内部 await 后合并结果 */
  pick?: UploadPickHandler
  maxCount?: number
  /** 仅作为上下文传给 pick，组件自身不使用文件选择控件 */
  accept?: string
  disabled?: boolean
  readonly?: boolean
  previewable?: boolean
  sources?: UploadSource[]
  /** 单文件字节上限 */
  maxSize?: number
  uploadText?: string
}

export interface WaUploadEmits {
  'update:modelValue': [value: UploadFileItem[]]
  'select': [source: UploadSource]
  'picked': [items: UploadFileItem[]]
  'remove': [item: UploadFileItem, index: number]
  'retry': [item: UploadFileItem, index: number]
  'preview': [item: UploadFileItem, index: number]
  'error': [payload: UploadErrorPayload]
}
