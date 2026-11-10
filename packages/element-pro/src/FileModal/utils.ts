import { dayjs } from '@wapri/gutils'
import { formatRatio } from '../CropperUpload/utils'
import { fileModalCustomRatio, fileModalCustomRatioLabel } from '../constant'
import type { Key } from '../shared/field/types'
import type { FileModalAsset, FileModalGroup } from './types'

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

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

/** 素材缩略图地址，优先 `thumbUrl`。 */
export const getAssetThumb = (asset: FileModalAsset): string => asset.thumbUrl || asset.url

/** 素材卡片副标题：大小与时间用 `·` 连接，缺省项自动省略。 */
export const getAssetMeta = (asset: FileModalAsset): string => {
  return [formatFileSize(asset.size), formatFileTime(asset.createdAt)].filter(Boolean).join(' · ')
}

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
