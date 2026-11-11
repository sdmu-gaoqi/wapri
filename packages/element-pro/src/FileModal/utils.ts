import { dayjs, getFileExtension } from '@wapri/gutils'
import { formatRatio } from '../CropperUpload/utils'
import { fileModalCustomRatio, fileModalCustomRatioLabel, fileModalGroupMaxDepth } from '../constant'
import type { ProFormFieldOption } from '../ProFormFields/types'
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

/** 可能承载 MIME 的字段名，业务接口命名不统一，这里都认 */
const MIME_FIELDS = ['type', 'mime', 'mimeType', 'contentType', 'fileType'] as const

/** data URL 直接看前缀，扩展名解析对它没有意义 */
const mediaTypeOfDataUrl = (value: string): FileModalAssetMediaType | undefined => {
  if (!value.startsWith('data:')) return undefined
  if (value.startsWith('data:image/')) return 'image'
  if (value.startsWith('data:video/')) return 'video'
  return 'other'
}

/**
 * 素材的媒体类型，供业务判断该用哪种预览方式。
 * 先看 MIME（`type` / `mime` / `mimeType` / `contentType` / `fileType`），
 * 再按 `url` / `previewUrl` / `abbreviateUrl` / `name` 的扩展名兜底。
 */
export const getAssetMediaType = (asset: FileModalAsset): FileModalAssetMediaType => {
  for (const field of MIME_FIELDS) {
    const value = asset[field]
    if (typeof value !== 'string') continue
    const mime = value.toLowerCase()
    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('video/')) return 'video'
  }

  const sources = [asset.url, asset.previewUrl, asset.abbreviateUrl, asset.name]
  for (const source of sources) {
    if (typeof source !== 'string' || !source) continue
    const fromDataUrl = mediaTypeOfDataUrl(source)
    if (fromDataUrl) return fromDataUrl
    const extension = getFileExtension(source)
    if (!extension) continue
    if ((IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return 'image'
    if ((VIDEO_EXTENSIONS as readonly string[]).includes(extension)) return 'video'
  }
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

/** 左侧列表的一行：分组本身加上层级深度，深度用于缩进。 */
export interface FileModalGroupRow {
  group: FileModalGroup
  depth: number
}

/** 把分类树按展示顺序展开成带层级的行，深度用于左侧缩进。 */
export const flattenGroupTree = (groups: FileModalGroup[], depth = 0): FileModalGroupRow[] =>
  groups.flatMap((group) => [{ group, depth }, ...flattenGroupTree(group.children ?? [], depth + 1)])

/** 分类的完整层级路径（从一级分组到自身），未命中返回空数组。 */
export const getGroupPath = (groups: FileModalGroup[], id?: string): FileModalGroup[] => {
  if (!id) return []
  for (const group of groups) {
    if (group.id === id) return [group]
    const subPath = getGroupPath(group.children ?? [], id)
    if (subPath.length) return [group, ...subPath]
  }
  return []
}

/** 展开分类树里的全部分组，顺序与左侧列表一致。 */
export const listGroups = (groups: FileModalGroup[]): FileModalGroup[] =>
  groups.flatMap((group) => [group, ...listGroups(group.children ?? [])])

/**
 * 分类弹窗「上级分类」的可选树，结构与级联控件要求的 `label` / `value` / `children` 一致。
 *
 * - `excludeId` 用于编辑：整棵子树都不出现，避免把分类挂到自己下面。
 * - 最深一级不再展开子级，让「上级分类」最多只到 `fileModalGroupMaxDepth - 1` 层，
 *   也就是三级分类下面不能再新建。
 */
export const buildGroupTree = (groups: FileModalGroup[], excludeId?: string, depth = 1): ProFormFieldOption[] =>
  groups
    .filter((group) => group.id !== excludeId)
    .map((group) => {
      const children =
        depth < fileModalGroupMaxDepth - 1 ? buildGroupTree(group.children ?? [], excludeId, depth + 1) : []
      return { label: group.name, value: group.id, children: children.length ? children : undefined }
    })

/** 从分类树里移除某个分组（连同它的子分组）。 */
export const removeGroupFromTree = (groups: FileModalGroup[], id: string): FileModalGroup[] =>
  groups
    .filter((group) => group.id !== id)
    .map((group) => (group.children?.length ? { ...group, children: removeGroupFromTree(group.children, id) } : group))

/**
 * 把分组挂到指定上级下；上级不存在（或未传）时退回一级分组。
 * 树里已有同 id 分组时原样返回，避免使用方回写 `groups` 后出现重复项。
 */
export const addGroupToTree = (
  groups: FileModalGroup[],
  group: FileModalGroup,
  parentId?: string,
): FileModalGroup[] => {
  if (listGroups(groups).some((item) => item.id === group.id)) return groups
  if (!parentId) return [...groups, group]

  let found = false
  const insert = (list: FileModalGroup[]): FileModalGroup[] =>
    list.map((item) => {
      if (item.id === parentId) {
        found = true
        return { ...item, children: [...(item.children ?? []), group] }
      }
      return item.children?.length ? { ...item, children: insert(item.children) } : item
    })

  const next = insert(groups)
  return found ? next : [...groups, group]
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
