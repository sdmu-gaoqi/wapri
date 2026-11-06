/**
 * XLSX 预览选项与解析后的模型。
 */

import type { BasePreviewOptions } from './common'

export interface XlsxMerge {
  s: { r: number; c: number }
  e: { r: number; c: number }
}

export interface XlsxSheet {
  name: string
  /** 二维文本矩阵，未解析到的单元格为空串 */
  rows: string[][]
  rowCount: number
  colCount: number
  merges: XlsxMerge[]
  /** 列宽 px，0 表示使用默认值 */
  colWidths: number[]
  /** 行高 px，0 表示使用默认值 */
  rowHeights: number[]
  /** 单元格数量超过上限被截断 */
  truncated: boolean
}

export interface XlsxWorkbook {
  sheets: XlsxSheet[]
}

export interface XlsxPreviewOptions extends BasePreviewOptions {
  /** 初始 sheet 名称或下标 */
  sheet?: string | number
  /** 默认列宽 px */
  colWidth?: number
  /** 默认行高 px */
  rowHeight?: number
  /** 单表最大单元格数，默认 20 万 */
  maxCells?: number
  /** 是否使用 worker 解析，默认 true */
  worker?: boolean
  /** SheetJS UMD 地址；默认取包内 vendor 副本 */
  workerScript?: string
}
