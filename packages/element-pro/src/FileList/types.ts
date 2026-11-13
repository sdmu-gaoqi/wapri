import type { Key } from '../shared/field/types'
import type { FileMediaType } from '../shared/media'

/** 文件卡片的数据项。业务可继续通过索引签名带 `id`、`size` 等字段。 */
export interface FileListItem {
  /** 文件名称，展示在缩略图下方 */
  name: string
  /** 缩略图地址，图片 / 视频取首帧 */
  abbreviateUrl: string
  /** 预览地址，图片查看器、视频播放、文档预览都取这个地址 */
  previewUrl: string
  [key: string]: unknown
}

/** 业务可自定义卡片 key，默认取 `id`，没有时用名称与缩略图地址组合。 */
export type FileListRowKey<T extends FileListItem = FileListItem> = string | ((item: T, index: number) => Key)

export interface FileListProps<T extends FileListItem = FileListItem> {
  /** 文件列表，支持 `v-model:data` */
  data: T[]
  /** 每行列数，默认 4；窄屏自动降为 2 列 */
  columns?: number
  /** 是否支持拖动排序，默认 `true` */
  sortable?: boolean
  /** 是否显示删除按钮，默认 `true` */
  removable?: boolean
  /** 是否支持点击预览，默认 `true` */
  previewable?: boolean
  /** 空列表文案 */
  emptyText?: string
  /** 禁用删除与排序 */
  disabled?: boolean
  /** 卡片 key，默认取 `id`；没有 `id` 时用名称与缩略图地址组合 */
  rowKey?: FileListRowKey<T>
}

export interface FileListEmits<T extends FileListItem = FileListItem> {
  /** 删除或排序后的新数组 */
  'update:data': [data: T[]]
  /** 打开预览 */
  'preview': [item: T, index: number, mediaType: FileMediaType]
  /** 删除某一项 */
  'remove': [item: T, index: number]
  /** 排序完成 */
  'sort': [data: T[], oldIndex: number, newIndex: number]
  /** 文档预览失败 */
  'error': [error: Error]
}

export interface FileListExpose<T extends FileListItem = FileListItem> {
  /** 打开指定项的预览 */
  preview: (index: number) => void
  /** 关闭当前预览 */
  closePreview: () => void
  /** 当前渲染顺序的副本 */
  getData: () => T[]
}
