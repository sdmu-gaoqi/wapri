import { dayjs, getFileExtension } from '@wapri/gutils'
import { formatRatio } from '../CropperUpload/utils'
import { fileModalCustomRatio, fileModalCustomRatioLabel } from '../constant'
import type { Key } from '../shared/field/types'
import type { FileModalAsset, FileModalAssetMediaType, FileModalGroup } from './types'

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/** 可预览的图片扩展名 */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'avif'] as const

/** 可预览的视频扩展名 */
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'ogg', 'mov', 'm4v', 'avi', 'mkv'] as const

/** 字节数转可读大小，如 `349.8 KB`；整数不带小数，非法值返回空串。 */
export const formatFileSize = (size?: number): string => {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) return ''
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${SIZE_UNITS[unitIndex]}`
}

/** 上传时间格式化，默认 `YYYY-MM-DD HH:mm`；非法值返回空串。 */
export const formatFileTime = (value?: string | number, template = 'YYYY-MM-DD HH:mm'): string => {
  if (value === undefined || value === null || value === '') return ''
  const date = dayjs(value)
  return date.isValid() ? date.format(template) : ''
}

/** 卡片里展示的预览图：图片与视频统一取 `abbreviateUrl`，未传时退回 `url`。 */
export const getAssetThumb = (asset: FileModalAsset): string => asset.abbreviateUrl || asset.url

/** 点击预览时展示的地址：优先 `previewUrl`，未传时退回 `url`。 */
export const getAssetPreviewUrl = (asset: FileModalAsset): string => asset.previewUrl || asset.url

/** 素材卡片副标题：大小与时间用 `·` 连接，缺省项自动省略。 */
export const getAssetMeta = (asset: FileModalAsset): string => {
  return [formatFileSize(asset.size), formatFileTime(asset.createdAt)].filter(Boolean).join(' · ')
}

/**
 * 素材的媒体类型，供业务判断该用哪种预览方式。
 * 优先信任 `type`（MIME），拿不到时按 `url` / `name` 的扩展名兜底。
 */
export const getAssetMediaType = (asset: FileModalAsset): FileModalAssetMediaType => {
  const mime = typeof asset.type === 'string' ? asset.type.toLowerCase() : ''
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'

  const extension = getFileExtension(asset.url) || getFileExtension(asset.name)
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return 'image'
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(extension)) return 'video'
  return 'other'
}

/** 是否属于当前支持预览的类型（图片、视频）。 */
export const isAssetPreviewable = (asset: FileModalAsset): boolean => getAssetMediaType(asset) !== 'other'

/** 分组搜索：按名称做本地不区分大小写的包含匹配。 */
export const filterGroups = (groups: FileModalGroup[], keyword: string): FileModalGroup[] => {
  const text = keyword.trim().toLowerCase()
  if (!text) return groups
  return groups.filter((group) => group.name.toLowerCase().includes(text))
}

/** 是否已经选中某个素材。 */
export const isAssetSelected = (selected: Key[], id: Key): boolean => selected.includes(id)

/** 单选/多选统一收敛成下一次的选中结果。 */
export const resolveNextSelected = (selected: Key[], id: Key, multiple: boolean): Key[] => {
  if (!multiple) return selected.includes(id) ? [] : [id]
  return selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
}

/** 从缓存里按选中顺序取出素材记录，缺失的 id 自动跳过。 */
export const pickSelectedAssets = <T extends FileModalAsset>(cache: Map<Key, T>, selected: Key[]): T[] =>
  selected.map((id) => cache.get(id)).filter((asset): asset is T => Boolean(asset))

/**
 * 把配置里的比例换算成裁剪器真正能用的比例与文案。
 *
 * 配置里的 `0` 是「自定义」占位值，含义是「按图片自身宽高等比裁剪」，必须换成
 * `imageRatio` 再交给裁剪器——裁剪器里 `0` 表示自由拖拽，语义不同。
 * 空数组表示不裁剪，原样返回空列表。
 */
export const resolveCropperRatios = (
  ratios: number[],
  labels: string[],
  imageRatio: number,
): { ratios: number[]; labels: string[] } => ({
  ratios: ratios.map((ratio) => (ratio === fileModalCustomRatio ? imageRatio : ratio)),
  labels: ratios.map((ratio, index) =>
    ratio === fileModalCustomRatio ? fileModalCustomRatioLabel : (labels[index] ?? formatRatio(ratio)),
  ),
})
