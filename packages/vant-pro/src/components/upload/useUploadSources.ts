import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { UploadSource } from './types'

/**
 * 默认来源顺序对齐 H5 常见操作习惯：拍照 > 相册 > 文件。
 * 业务不传 sources 时直接可用，不用每个页面再抄一遍三个选项。
 */
export const DEFAULT_UPLOAD_SOURCES: UploadSource[] = [
  { key: 'camera', name: '拍照', icon: 'photograph' },
  { key: 'library', name: '从相册选择', icon: 'photo-o' },
  { key: 'file', name: '选择文件', icon: 'description-o' },
]

/** key → van-icon 名称，业务只关心 key 时也能出图标 */
const SOURCE_ICONS: Record<string, string> = {
  camera: 'photograph',
  library: 'photo-o',
  file: 'description-o',
}

export const resolveSourceIcon = (source: UploadSource): string => source.icon ?? SOURCE_ICONS[source.key] ?? 'photo-o'

/** van-share-sheet 的选项形状，组件内部转换一次即可 */
export interface UploadSheetOption {
  name: string
  icon: string
}

export const useUploadSources = (
  getSources: () => UploadSource[] | undefined,
): { sources: ComputedRef<UploadSource[]>; sheetOptions: ComputedRef<UploadSheetOption[]> } => {
  // 空数组也回落默认值：业务把配置写成 [] 时面板不该变成空白
  const sources = computed(() => {
    const list = getSources()
    return list && list.length > 0 ? list : DEFAULT_UPLOAD_SOURCES
  })

  const sheetOptions = computed(() =>
    sources.value.map((source) => ({ name: source.name, icon: resolveSourceIcon(source) })),
  )

  return { sources, sheetOptions }
}
