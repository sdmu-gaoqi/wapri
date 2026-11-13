import { getFileExtension } from '@wapri/gutils'

/** 文件在预览层的媒体分类。 */
export type FileMediaType = 'image' | 'video' | 'other'

/**
 * 媒体类型判断需要的字段。
 * `FileModal` 的素材有 `url`，`FileList` 的项有必填的 `previewUrl` / `abbreviateUrl`，
 * 其余业务字段通过索引签名透传。
 */
export interface FileMediaSource {
  name?: string
  url?: string
  previewUrl?: string
  abbreviateUrl?: string
  [key: string]: unknown
}

/** 可预览的图片扩展名。 */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'avif'] as const

/** 可预览的视频扩展名。 */
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'ogg', 'mov', 'm4v', 'avi', 'mkv'] as const

/** 业务接口可能用不同字段名给出 MIME，按顺序尝试。 */
const MIME_FIELDS = ['type', 'mime', 'mimeType', 'contentType', 'fileType'] as const

/** data URL 直接看前缀，扩展名推不出来时也能判断。 */
const mediaTypeOfDataUrl = (value: string): FileMediaType | undefined => {
  if (!value.startsWith('data:')) return undefined
  if (value.startsWith('data:image/')) return 'image'
  if (value.startsWith('data:video/')) return 'video'
  return 'other'
}

/**
 * 判断文件是图片、视频还是其他类型。
 *
 * 先看 MIME 字段，再看 data URL 前缀，最后按地址 / 文件名的扩展名兜底。
 */
export const getFileMediaType = (source: FileMediaSource): FileMediaType => {
  for (const field of MIME_FIELDS) {
    const value = source[field]
    if (typeof value !== 'string') continue
    const mime = value.toLowerCase()
    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('video/')) return 'video'
  }

  // 缩略图（abbreviateUrl）本质永远是图片，不能参与媒体类型判断，
  // 否则带图片封面的 PDF / 视频会被误判成图片。
  const sources = [source.url, source.previewUrl, source.name]
  for (const value of sources) {
    if (typeof value !== 'string' || !value) continue
    const fromDataUrl = mediaTypeOfDataUrl(value)
    if (fromDataUrl) return fromDataUrl
    const extension = getFileExtension(value)
    if (!extension) continue
    if ((IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return 'image'
    if ((VIDEO_EXTENSIONS as readonly string[]).includes(extension)) return 'video'
  }

  return 'other'
}
