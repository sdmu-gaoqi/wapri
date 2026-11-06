/**
 * 文本预览选项。
 */

import type { BasePreviewOptions } from './common'

export interface TextPreviewOptions extends BasePreviewOptions {
  /** 是否自动换行，默认 true */
  wrap?: boolean
  /** 文本编码，默认 utf-8 */
  encoding?: string
  /** 每个懒渲染块包含的行数，默认 80 */
  chunkLines?: number
  /** 代码字体族覆盖 */
  monoFontFamily?: string
}
