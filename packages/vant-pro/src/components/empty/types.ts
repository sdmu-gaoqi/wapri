/** WaEmpty 对外类型 */

/** 常用空状态预设，用来省掉每个页面手写文案与图片 */
export type EmptyModule = 'list' | 'table' | 'search' | 'network' | 'notice' | 'error'

export interface WaEmptyProps {
  /** van-empty 内置名（default/search/network/error）或图片地址 */
  image?: string
  /** 为空时回落到 module 预设，再回落到「暂无数据」 */
  description?: string
  module?: EmptyModule
  /** 透传给 van-empty 的 image-size */
  size?: number | string
  showAction?: boolean
  actionText?: string
  loading?: boolean
}

export interface WaEmptyEmits {
  action: []
}
