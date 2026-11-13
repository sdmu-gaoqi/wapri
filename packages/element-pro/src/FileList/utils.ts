import type { Key } from '../shared/field/types'
import { getFileMediaType, getFilePreviewUrl, getFileThumb, getFileVideoPoster, getFileVideoSrc } from '../shared/media'
import type { FileListItem, FileListRowKey } from './types'

/** 预览地址：优先 `previewUrl`，缺失时退回缩略图。 */
export const getItemPreviewUrl = (item: FileListItem): string => getFilePreviewUrl(item)

/** 是否为图片。 */
export const isImageItem = (item: FileListItem): boolean => getFileMediaType(item) === 'image'

/** 是否为视频。 */
export const isVideoItem = (item: FileListItem): boolean => getFileMediaType(item) === 'video'

/** 缩略图地址：优先 `abbreviateUrl`，图片缺失时退回预览地址。 */
export const getItemThumb = (item: FileListItem): string => getFileThumb(item)

/** 卡片里的视频地址：取预览地址，并补首帧锚点。 */
export const getItemVideoSrc = (item: FileListItem): string => getFileVideoSrc(item)

/** 视频封面：`abbreviateUrl` 与视频地址不同时才作为 `poster`。 */
export const getItemVideoPoster = (item: FileListItem): string | undefined => getFileVideoPoster(item)

/** 从列表中筛出图片项，图片查看器只在这些项之间左右切换。 */
export const collectImageItems = <T extends FileListItem>(data: readonly T[]): T[] => data.filter(isImageItem)

/** 当前项在图片列表中的下标，找不到时回到 0。 */
export const resolveImageIndex = <T extends FileListItem>(data: readonly T[], index: number): number => {
  const item = data[index]
  const imageIndex = collectImageItems(data).findIndex((image) => image === item)
  return imageIndex >= 0 ? imageIndex : 0
}

/** 卡片 key：优先 `rowKey`，其次 `id`，最后用名称 + 缩略图地址兜底。 */
export const getItemKey = <T extends FileListItem>(item: T, index: number, rowKey?: FileListRowKey<T>): Key => {
  if (typeof rowKey === 'function') return rowKey(item, index)
  if (typeof rowKey === 'string') {
    const value = item[rowKey]
    if (typeof value === 'string' || typeof value === 'number') return value
  }
  const id = item.id
  if (typeof id === 'string' || typeof id === 'number') return id
  return `${item.name}@@${item.abbreviateUrl ?? ''}`
}
