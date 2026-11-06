/**
 * 统一入口：识别文件类型后分发到具体预览实现。
 */

import { resolvePreviewSource } from './core/source'
import { renderPdf } from './pdf'
import { renderText } from './text'
import { renderWord } from './word'
import { renderXlsx } from './xlsx'
import type { BasePreviewOptions, PreviewHandle, PreviewInput } from './types/common'
import type { PdfPreviewOptions } from './types/pdf'
import type { TextPreviewOptions } from './types/text'
import type { WordPreviewOptions } from './types/word'
import type { XlsxPreviewOptions } from './types/xlsx'

type Extra<T extends BasePreviewOptions> = Omit<T, keyof BasePreviewOptions>

export interface PreviewFileOptions extends BasePreviewOptions {
  text?: Extra<TextPreviewOptions>
  pdf?: Extra<PdfPreviewOptions>
  word?: Extra<WordPreviewOptions>
  xlsx?: Extra<XlsxPreviewOptions>
}

const mergeOptions = <T extends BasePreviewOptions>(base: BasePreviewOptions, extra?: Extra<T>): T =>
  ({ ...base, ...extra }) as T

/** 自动识别文件类型并选择预览器 */
export const previewFile = async (input: PreviewInput, options: PreviewFileOptions): Promise<PreviewHandle> => {
  const source = await resolvePreviewSource(input)

  switch (source.kind) {
    case 'pdf':
      return renderPdf(source, mergeOptions<PdfPreviewOptions>(options, options.pdf))
    case 'word':
      return renderWord(source, mergeOptions<WordPreviewOptions>(options, options.word))
    case 'xlsx':
      return renderXlsx(source, mergeOptions<XlsxPreviewOptions>(options, options.xlsx))
    case 'text':
    default:
      return renderText(source, mergeOptions<TextPreviewOptions>(options, options.text))
  }
}
