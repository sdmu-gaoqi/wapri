import type { VNodeChild } from 'vue'

export type EllipsisDirection = 'start' | 'end' | 'middle'

export type EllipsisActionPropagationEvent = 'click' | 'mousedown' | 'mouseup' | 'touchstart' | 'touchend'

export interface EllipsisExpandInfo {
  event: MouseEvent
}

export interface EllipsisProps {
  /** 要截断的纯文本内容。 */
  content?: string
  /** 省略位置。 */
  direction?: EllipsisDirection
  /** 最多展示的行数。 */
  rows?: number
  /** 展开操作文案或节点。设置后仅在内容实际被截断时展示。 */
  expandText?: VNodeChild
  /** 收起操作文案或节点。设置后仅在已展开且内容实际被截断时展示。 */
  collapseText?: VNodeChild
  /** 操作按钮需要阻止冒泡的事件类型。 */
  stopPropagationForActionButtons?: EllipsisActionPropagationEvent[]
  /** 初始是否展开。 */
  defaultExpanded?: boolean
}
