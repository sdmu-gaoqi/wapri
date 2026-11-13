import type { FileMediaSource } from '../media'

/** 卡片渲染需要的最小数据：名称 + 媒体地址。 */
export interface FileCardSource extends FileMediaSource {
  name: string
}

export interface FileCardProps {
  /** 文件数据 */
  source: FileCardSource
  /** 选中 / 激活态 */
  active?: boolean
  /** 禁用态，只影响光标，不影响预览与选择 */
  disabled?: boolean
  /** 开启拖拽时，键盘的 Space / Enter 交给 @vue-dnd-kit 拾取卡片 */
  keyboardSortable?: boolean
  /** 操作按钮常驻显示；默认 hover 或聚焦时才显示 */
  actionsAlwaysVisible?: boolean
}

export interface FileCardEmits {
  /** 点击卡片或键盘激活 */
  activate: []
}

export interface FileCardSlots {
  /** 缩略图右上角的操作按钮，由 FileList / FileModal 各自提供 */
  actions?: () => unknown
  /** 缩略图左上角的角标，通常用于选中态勾选标记 */
  badge?: () => unknown
  /** 缩略图下方的补充信息 */
  meta?: () => unknown
}
