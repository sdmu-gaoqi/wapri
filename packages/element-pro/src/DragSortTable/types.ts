import type { VNodeChild } from 'vue'
import type { ProTableProps } from '../ProTable/types'

/** 拖拽排序把手渲染函数，与 pro-components `dragSortHandlerRender` 一致。 */
export type DragSortHandlerRender<T> = (record: T, index: number) => VNodeChild

/** 拖拽排序完成回调，与 pro-components `onDragSortEnd` 一致。 */
export type DragSortEndHandler<T> = (
  beforeIndex: number,
  afterIndex: number,
  newDataSource: T[],
) => void | Promise<void>

/**
 * DragSortTable 在 ProTable 之上只多四个 props：
 * `dragSortKey` 指向哪一列显示把手，`dragSortHandlerRender` 换把手内容，
 * `onDragSortEnd` 拿新顺序，`dragSortDisabled` 整体关掉拖拽。
 */
export interface DragSortTableProps<
  T extends object = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>,
> extends ProTableProps<T, U> {
  /** 拖拽把手所在列的 `dataIndex`（单层 key），该列的单元格由组件接管渲染。 */
  dragSortKey?: string
  /** 自定义把手内容；不传时渲染默认的拖动图标。 */
  dragSortHandlerRender?: DragSortHandlerRender<T>
  /** 拖拽结束且顺序发生变化时触发。 */
  onDragSortEnd?: DragSortEndHandler<T>
  /** 关闭拖拽：把手展示为禁用态，且不能起拖。 */
  dragSortDisabled?: boolean
}
