/**
 * Word 预览选项与文档模型。
 */

import type { BasePreviewOptions } from './common'

export interface WordTextRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  /** 字号覆盖，未设置时继承块级设置 */
  fontSize?: number
}

export type WordBlock =
  | {
      type: 'paragraph'
      runs: WordTextRun[]
      /** 1 - 6，0 表示普通段落 */
      heading?: number
      /** 列表层级，0 表示不在列表里 */
      listLevel?: number
      /** 有序列表序号 */
      listIndex?: number
      align?: 'left' | 'center' | 'right' | 'justify'
    }
  | {
      type: 'table'
      rows: WordTableCell[][]
    }
  | {
      type: 'image'
      src: string
      width: number
      height: number
    }

export interface WordTableCell {
  runs: WordTextRun[]
  /** 表头行用粗体渲染 */
  header?: boolean
}

export interface WordDocumentModel {
  blocks: WordBlock[]
  /** 默认字号，px */
  fontSize: number
}

export interface WordPreviewOptions extends BasePreviewOptions {
  /** 页面宽度 px，默认 A4 96dpi */
  pageWidth?: number
  /** 页面高度 px */
  pageHeight?: number
  /** 页面内边距 px */
  padding?: number
  /** 内嵌字体（TTF / OTF / WOFF 的 ArrayBuffer），用于精确测量与绘制 */
  fonts?: ArrayBuffer[]
  /** 字号覆盖 */
  fontSize?: number
  /** 是否展示缩略图条，默认 false */
  thumbnails?: boolean
  /** 每页渲染的最大设备像素比，默认 2 */
  maxPixelRatio?: number
}
