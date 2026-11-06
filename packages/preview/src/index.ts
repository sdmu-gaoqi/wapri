/**
 * @wapri/preview 公共入口。
 */

export * from './constant'
export * from './types/common'
export * from './types/text'
export * from './types/pdf'
export * from './types/word'
export * from './types/xlsx'

export { previewFile } from './previewFile'
export type { PreviewFileOptions } from './previewFile'
export { previewText } from './text'
export { previewPdf } from './pdf'
export { previewWord } from './word'
export { previewXlsx } from './xlsx'
export { configurePdfjs } from './pdf/load'
export { PreviewUnsupportedError, resolvePreviewSource } from './core/source'
export type { ResolvedSource } from './core/source'
