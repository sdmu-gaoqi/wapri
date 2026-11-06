/**
 * 输入来源解析：把 File / Blob / ArrayBuffer / URL 统一成可识别的字节流。
 */

import { detectFileType, getFileName, isFileUrl, readFileAsArrayBuffer } from '@wapri/gbase'
import type { FileInput } from '@wapri/gbase'
import type { PreviewInput, PreviewUrlSource } from '../types/common'
import type { FileCategory } from '@wapri/gbase'

export interface ResolvedSource {
  /** 预览能力分类 */
  kind: 'text' | 'pdf' | 'word' | 'xlsx'
  /** 原始识别分类，便于调用方判断 doc/ppt 等不支持的类型 */
  category: FileCategory
  name: string
  extension: string
  mime: string
  buffer: ArrayBuffer
}

export class PreviewUnsupportedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PreviewUnsupportedError'
  }
}

const isUrlSource = (input: PreviewInput): input is PreviewUrlSource =>
  typeof input === 'object' &&
  input !== null &&
  !(input instanceof Blob) &&
  !(input instanceof ArrayBuffer) &&
  !ArrayBuffer.isView(input) &&
  'url' in input

const toFileInput = (input: PreviewInput): FileInput => {
  if (isUrlSource(input)) return input.url

  return input
}

const resolveName = (input: PreviewInput): string => {
  if (isUrlSource(input)) {
    return input.fileName || getFileName(input.url)
  }

  return getFileName(toFileInput(input))
}

const toPreviewKind = (category: FileCategory, extension: string): ResolvedSource['kind'] => {
  switch (category) {
    case 'pdf':
      return 'pdf'
    case 'word':
      if (extension === 'doc') {
        throw new PreviewUnsupportedError('暂不支持 .doc 旧格式，请另存为 .docx 后再预览')
      }

      return 'word'
    case 'xlsx':
      return 'xlsx'
    case 'text':
      return 'text'
    default:
      throw new PreviewUnsupportedError(
        `暂不支持预览该文件类型${extension ? `（.${extension}）` : ''}，当前支持文本、PDF、Word（docx）、Excel（xlsx/xls/csv）`,
      )
  }
}

/** 解析来源并读取整个文件；远程文件支持自定义请求头 */
export const resolvePreviewSource = async (input: PreviewInput): Promise<ResolvedSource> => {
  // 非 URL 的字符串按文本内容处理，便于直接预览一段文本
  if (typeof input === 'string' && !isFileUrl(input)) {
    const bytes = new TextEncoder().encode(input)
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer

    return {
      kind: 'text',
      category: 'text',
      name: '',
      extension: 'txt',
      mime: 'text/plain',
      buffer,
    }
  }

  const name = resolveName(input)
  const init = isUrlSource(input) && input.headers ? { headers: input.headers } : undefined
  const buffer = await readFileAsArrayBuffer(toFileInput(input), init)
  const head = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 8192))
  const info = detectFileType(head, name)
  const kind = toPreviewKind(info.category, info.extension)

  return {
    kind,
    category: info.category,
    name,
    extension: info.extension,
    mime: info.mime,
    buffer,
  }
}
