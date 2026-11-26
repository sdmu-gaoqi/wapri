import type { UploadFileItem, UploadPickResult } from './types'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'avif']

/** 先去掉 query / hash 再取扩展名：CDN 地址经常挂 ?x-oss-process=... */
const extensionOf = (value: string): string => {
  const clean = value.split('?')[0].split('#')[0]
  const dotIndex = clean.lastIndexOf('.')
  if (dotIndex < 0 || dotIndex < clean.lastIndexOf('/')) return ''
  return clean.slice(dotIndex + 1).toLowerCase()
}

/**
 * 判断是否按图片渲染。
 * 没有扩展名时按图片处理：H5 上传来源以拍照/相册为主，缩略图比文件图标信息量更大。
 */
export const isImageItem = (item: UploadFileItem): boolean => {
  const url = item.url ?? ''
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return true

  const nameExtension = item.name ? extensionOf(item.name) : ''
  if (nameExtension) return IMAGE_EXTENSIONS.includes(nameExtension)

  const urlExtension = extensionOf(url)
  if (urlExtension) return IMAGE_EXTENSIONS.includes(urlExtension)

  return Boolean(url)
}

export const formatFileSize = (size?: number): string => {
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) return ''
  if (size < 1024) return `${Math.round(size)}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

/** 上限文案：默认 10MB 要显示成「10MB」而不是「10.0MB」 */
export const formatSizeLimit = (bytes: number): string => {
  const megabytes = bytes / 1024 / 1024
  return Number.isInteger(megabytes) ? `${megabytes}MB` : `${megabytes.toFixed(1)}MB`
}

export const percentOf = (item: UploadFileItem): number => {
  const percent = Math.round(item.percent ?? 0)
  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, percent))
}

export const isOversize = (item: UploadFileItem, maxSize: number): boolean =>
  typeof item.size === 'number' && item.size > maxSize

let sequence = 0

/** 业务没给 id 时补一个稳定 key：列表用 index 做 key 在删除时会错位 */
export const createUploadItem = (result: UploadPickResult): UploadFileItem => {
  sequence += 1
  return {
    id: result.id ?? `upload-${Date.now().toString(36)}-${sequence}`,
    url: result.url,
    name: result.name,
    size: result.size,
    // pick 返回即视为已就绪：真正的上传由父组件驱动，需要进度时再回写 status/percent
    status: 'done',
    percent: 100,
    deletable: true,
  }
}

/** pick 允许返回单个、数组或空，这里统一成数组，调用侧只处理一种形状 */
export const toPickResultList = (result: UploadPickResult | UploadPickResult[] | null | void): UploadPickResult[] => {
  if (!result) return []
  if (Array.isArray(result)) return result.filter((item): item is UploadPickResult => Boolean(item))
  return [result]
}
