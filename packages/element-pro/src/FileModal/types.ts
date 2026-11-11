import type { DialogProps } from 'element-plus'
import type { Key } from '../shared/field/types'
import type { RequestFn } from '../ProTable/types'

/** 素材记录，业务可扩展额外字段。 */
export interface FileModalAsset {
  /** 素材唯一标识，同时作为列表行键 */
  id: Key
  /** 素材名称 */
  name: string
  /** 素材地址 */
  url: string
  /**
   * 卡片里展示的预览图地址，图片与视频都用它。
   * 视频填封面帧、图片填缩略图；未传时退回 `url`。
   */
  abbreviateUrl?: string
  /** 点击预览时展示的地址，未传时退回 `url` */
  previewUrl?: string
  /** 文件大小（字节） */
  size?: number
  /** 上传时间，支持时间戳或可被 dayjs 解析的字符串 */
  createdAt?: string | number
  /** 所属分组 id */
  groupId?: string
  [key: string]: unknown
}

/** 分组记录。 */
export interface FileModalGroup {
  id: string
  name: string
  /** 分组标识色，用于左侧色点 */
  color?: string
  [key: string]: unknown
}

/**
 * 素材的媒体类型。
 * `image` / `video` 支持预览触发，`other` 不展示预览入口。
 */
export type FileModalAssetMediaType = 'image' | 'video' | 'other'

/** 新建分组的提交参数。 */
export interface FileModalGroupPayload {
  name: string
  color: string
}

/** 排序方式，作为 `sortBy` 传给 `request`。 */
export type FileModalSortValue = 'latest' | 'name' | 'size'

/**
 * 传给 `request` 的业务参数。
 * 声明为类型别名而非 interface，才能满足 `RequestFn` 对 `Record<string, unknown>` 的约束。
 */
export type FileModalQuery = {
  /** 素材名称关键词 */
  keyword?: string
  /** 排序方式 */
  sortBy?: FileModalSortValue
  /** 当前分组 id，未选中分组时不传 */
  groupId?: string
}

/** 上传回调的上下文。 */
export interface FileModalUploadContext {
  /** 当前选中的分组 id，未选中分组时为 undefined */
  groupId?: string
}

/** 列表请求，直接透传给内部 ProTable。 */
export type FileModalRequest<T extends FileModalAsset = FileModalAsset> = RequestFn<T, FileModalQuery>

/** 新建分组，返回值会插入到分组数据内并自动选中。 */
export type FileModalCreateGroup = (payload: FileModalGroupPayload) => Promise<FileModalGroup>

/** 上传裁剪结果，返回值会插入列表并自动选中。 */
export type FileModalUpload<T extends FileModalAsset = FileModalAsset> = (
  file: File,
  context: FileModalUploadContext,
) => Promise<T>

export interface FileModalProps<T extends FileModalAsset = FileModalAsset> {
  /** 弹窗开关 */
  open?: boolean
  /** 列表请求，直接透传给内部 ProTable */
  request: FileModalRequest<T>
  /** 一行几列 */
  columns?: number
  /** 分组初始数据 */
  groups?: FileModalGroup[]
  /** 新建分组，不传时隐藏「添加分组」 */
  createGroup?: FileModalCreateGroup
  /** 上传裁剪结果，不传时隐藏「上传图片」 */
  upload?: FileModalUpload<T>
  /** 是否多选 */
  multiple?: boolean
  /** 已选素材 id，配合 `v-model:selected` 使用 */
  selected?: Key[]
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 取消按钮文案 */
  cancelText?: string
  /** 上传按钮文案 */
  uploadText?: string
  /** 新建分组按钮文案 */
  addGroupText?: string
  /** 空数据文案 */
  emptyText?: string
  /**
   * 可选的裁剪比例，默认空数组表示**不裁剪**，选完直接上传原图。
   * 传入比例后才打开裁剪弹窗，`0` 表示「自定义」——按图片自身宽高等比裁剪。
   * 例如只允许 9:16 传 `[9 / 16]`；同时允许 9:16 与 16:9 传 `[9 / 16, 16 / 9]`。
   */
  cropperRatios?: number[]
  /** 裁剪比例按钮文案，与 `cropperRatios` 一一对应；缺省项按比例自动生成 */
  cropperRatioLabels?: string[]
  /** 裁剪弹窗标题 */
  cropperTitle?: string
  /** 透传给 ElDialog */
  modalProps?: Partial<Omit<DialogProps, 'modelValue'>>
}

export interface FileModalEmits<T extends FileModalAsset = FileModalAsset> {
  'update:open': [value: boolean]
  'update:selected': [keys: Key[]]
  /** 点击确定，回传选中的素材记录 */
  'confirm': [assets: T[]]
  'cancel': []
  /** 切换分组 */
  'groupChange': [groupId: string | undefined]
  /** 新建分组成功 */
  'groupCreated': [group: FileModalGroup]
  /** 上传成功 */
  'uploaded': [asset: T]
  /** 上传失败 */
  'uploadError': [error: Error]
}
