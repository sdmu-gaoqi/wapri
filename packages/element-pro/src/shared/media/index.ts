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

/** 预览地址：优先 `previewUrl`，其次 `url`，最后退回缩略图。 */
export const getFilePreviewUrl = (source: FileMediaSource): string =>
  source.previewUrl || source.url || source.abbreviateUrl || ''

/**
 * 卡片缩略图地址：优先 `abbreviateUrl`。
 * 只有图片在缺失缩略图时才退回预览地址；文档 / 视频的预览地址不能直接当图片用。
 */
export const getFileThumb = (source: FileMediaSource): string =>
  source.abbreviateUrl || (getFileMediaType(source) === 'image' ? getFilePreviewUrl(source) : '')

/** 卡片里的视频地址：取预览地址，补 `#t=0.1` 让浏览器解码首帧。 */
export const getFileVideoSrc = (source: FileMediaSource): string => {
  const src = getFilePreviewUrl(source)
  return src && !src.includes('#t=') ? `${src}#t=0.1` : src
}

/** 去掉 `#` 后的锚点，便于比较同一份视频地址。 */
const stripHash = (value: string): string => value.replace(/#.*$/, '')

/** 视频封面：`abbreviateUrl` 与视频地址不同时才作为 `poster`，避免重复请求。 */
export const getFileVideoPoster = (source: FileMediaSource): string | undefined => {
  if (!source.abbreviateUrl) return undefined
  const src = getFilePreviewUrl(source)
  return stripHash(source.abbreviateUrl) === stripHash(src) ? undefined : source.abbreviateUrl
}

/** 卡片占位图标的分类。 */
export type FileIconType = 'pdf' | 'word' | 'xlsx' | 'ppt' | 'image' | 'video' | 'other'

/** 占位图标需要的分类与短文案。 */
export interface FileIconInfo {
  type: FileIconType
  /** 图标里显示的短文案，如 `PDF`、`XLSX` */
  label: string
}

/** 扩展名到图标分类，文档类型优先按扩展名识别。 */
const EXTENSION_ICON_TYPES: Record<string, FileIconType> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'xlsx',
  xlsx: 'xlsx',
  csv: 'xlsx',
  ppt: 'ppt',
  pptx: 'ppt',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  bmp: 'image',
  webp: 'image',
  svg: 'image',
  avif: 'image',
  mp4: 'video',
  webm: 'video',
  ogv: 'video',
  ogg: 'video',
  mov: 'video',
  m4v: 'video',
  avi: 'video',
  mkv: 'video',
}

/** MIME 到文档图标分类，扩展名缺失时兜底。 */
const MIME_ICON_TYPES: ReadonlyArray<readonly [string, FileIconType]> = [
  ['application/pdf', 'pdf'],
  ['word', 'word'],
  ['excel', 'xlsx'],
  ['spreadsheet', 'xlsx'],
  ['powerpoint', 'ppt'],
  ['presentation', 'ppt'],
]

/** 没有扩展名时按分类给默认短文案。 */
const DEFAULT_ICON_LABELS: Record<FileIconType, string> = {
  pdf: 'PDF',
  word: 'DOC',
  xlsx: 'XLS',
  ppt: 'PPT',
  image: 'IMG',
  video: 'VIDEO',
  other: 'FILE',
}

/** 取业务给出的 MIME，字段名与媒体类型判断保持一致。 */
const getSourceMime = (source: FileMediaSource): string => {
  for (const field of MIME_FIELDS) {
    const value = source[field]
    if (typeof value === 'string' && value) return value.toLowerCase()
  }
  return ''
}

/**
 * 取扩展名：优先能对应到图标分类的扩展名，名称最可靠，其次看预览地址与原始地址。
 * 名称里带版本号（如 `方案 v1.2`）时不能被误当成扩展名，所以先记住候选再继续往后找。
 */
const getSourceExtension = (source: FileMediaSource): string => {
  let fallback = ''
  for (const value of [source.name, source.previewUrl, source.url]) {
    if (typeof value !== 'string' || !value) continue
    const extension = getFileExtension(value)
    if (!extension) continue
    if (EXTENSION_ICON_TYPES[extension]) return extension
    if (!fallback) fallback = extension
  }
  return fallback
}

/**
 * 取卡片占位图标的分类与短文案。
 *
 * 缩略图缺失或加载失败时使用：文档按扩展名 / MIME 区分 PDF、Excel、Word、PPT，
 * 图片与视频沿用媒体类型，其余落到通用的文件图标。
 */
export const getFileIconInfo = (source: FileMediaSource): FileIconInfo => {
  const extension = getSourceExtension(source)
  const mime = getSourceMime(source)
  const mediaType = getFileMediaType(source)

  const type: FileIconType =
    EXTENSION_ICON_TYPES[extension] ??
    MIME_ICON_TYPES.find(([prefix]) => mime.includes(prefix))?.[1] ??
    (mediaType === 'other' ? 'other' : mediaType)

  const label = extension ? extension.toUpperCase().slice(0, 4) : DEFAULT_ICON_LABELS[type]

  return { type, label }
}
