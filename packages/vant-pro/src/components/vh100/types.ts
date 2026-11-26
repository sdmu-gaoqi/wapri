import type { CSSProperties } from 'vue'

/** WaVH100 对外类型 */

export interface WaVH100Props {
  /** 追加样式，与组件算出的高度合并 */
  style?: CSSProperties
  /** 追加类名，与组件根类合并 */
  class?: string
}
