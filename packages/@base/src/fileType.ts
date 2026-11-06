/**
 * 文件类型识别：先看魔数，再按扩展名 / MIME 兜底。
 *
 * 浏览器给 File 的 `type` 经常是空串或 `application/octet-stream`（尤其是 App WebView 里从本地选的文件），
 * 所以预览分发不能只信 `file.type`，必须读文件头。
 */

import { EXTENSION_MIME, FILE_SIGNATURES, OOXML_PREFIX, TEXT_EXTENSIONS } from './constant/file'

export type FileCategory = 'pdf' | 'word' | 'xlsx' | 'ppt' | 'image' | 'text' | 'video' | 'audio' | 'unknown'

export interface FileTypeInfo {
  /** 归一化后的能力分类 */
  category: FileCategory
  /** 归一化 MIME，未知时为 `application/octet-stream` */
  mime: string
  /** 小写扩展名，不带点；推导不出来时为空串 */
  extension: string
}

const EMPTY: FileTypeInfo = { category: 'unknown', mime: 'application/octet-stream', extension: '' }

const toBytes = (input: ArrayBuffer | Uint8Array): Uint8Array =>
  input instanceof Uint8Array ? input : new Uint8Array(input)

/** 取文件扩展名，忽略 query / hash 与路径 */
export const getFileExtension = (nameOrUrl = ''): string => {
  const clean = nameOrUrl.split(/[?#]/)[0].split('/').pop() ?? ''
  const dot = clean.lastIndexOf('.')

  return dot > 0 ? clean.slice(dot + 1).toLowerCase() : ''
}

const startsWith = (bytes: Uint8Array, signature: readonly number[]) => {
  if (bytes.length < signature.length) return false

  return signature.every((byte, index) => bytes[index] === byte)
}

/** 在文件头里找 OOXML 内部的目录名，zip 无法只靠魔数区分 docx / xlsx / pptx */
const matchOoxml = (bytes: Uint8Array): FileCategory | undefined => {
  const head = bytes.subarray(0, Math.min(bytes.length, 8192))
  const decoder = new TextDecoder('latin1')
  const text = decoder.decode(head)

  if (text.includes(OOXML_PREFIX.word)) return 'word'
  if (text.includes(OOXML_PREFIX.xlsx)) return 'xlsx'
  if (text.includes(OOXML_PREFIX.ppt)) return 'ppt'

  return undefined
}

/** 判断字节流是否更像文本：控制字符占比低，且有可打印内容 */
const looksLikeText = (bytes: Uint8Array) => {
  if (bytes.length === 0) return true
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return true
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return true
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return true

  const sample = bytes.subarray(0, Math.min(bytes.length, 1024))
  let control = 0

  for (const byte of sample) {
    if (byte === 0) return false
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) control += 1
  }

  return control / sample.length < 0.05
}

const byExtension = (extension: string, category: FileCategory): FileTypeInfo => ({
  category,
  mime: EXTENSION_MIME[extension] ?? 'application/octet-stream',
  extension,
})

const normalize = (category: FileCategory, extension: string, mime: string): FileTypeInfo => ({
  category,
  mime: mime || EXTENSION_MIME[extension] || 'application/octet-stream',
  extension,
})

/**
 * 识别文件类型。
 *
 * @param input 文件头字节（建议传前 8KB 以上，zip 内部目录名可能不在最前面）
 * @param fileName 可选文件名或 URL，用于扩展名兜底
 */
export const detectFileType = (input: ArrayBuffer | Uint8Array, fileName = ''): FileTypeInfo => {
  const bytes = toBytes(input)
  const extension = getFileExtension(fileName)

  if (startsWith(bytes, FILE_SIGNATURES.pdf)) {
    return normalize('pdf', extension || 'pdf', 'application/pdf')
  }

  if (startsWith(bytes, FILE_SIGNATURES.zip)) {
    const ooxml = matchOoxml(bytes)

    if (ooxml) {
      const defaultExtension = ooxml === 'word' ? 'docx' : ooxml === 'xlsx' ? 'xlsx' : 'pptx'

      return normalize(ooxml, extension || defaultExtension, '')
    }

    return normalize('unknown', extension, 'application/zip')
  }

  if (startsWith(bytes, FILE_SIGNATURES.png)) return normalize('image', extension || 'png', 'image/png')
  if (startsWith(bytes, FILE_SIGNATURES.jpeg)) return normalize('image', extension || 'jpg', 'image/jpeg')
  if (startsWith(bytes, FILE_SIGNATURES.gif)) return normalize('image', extension || 'gif', 'image/gif')
  if (startsWith(bytes, FILE_SIGNATURES.bmp)) return normalize('image', extension || 'bmp', 'image/bmp')
  if (startsWith(bytes, FILE_SIGNATURES.webp)) return normalize('image', extension || 'webp', 'image/webp')

  if (extension === 'pdf') return byExtension(extension, 'pdf')

  if (extension === 'docx') return byExtension(extension, 'word')
  if (extension === 'doc') return byExtension(extension, 'word')
  if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') return byExtension(extension, 'xlsx')
  if (extension === 'pptx' || extension === 'ppt') return byExtension(extension, 'ppt')

  if ((TEXT_EXTENSIONS as readonly string[]).includes(extension)) return byExtension(extension, 'text')

  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') return byExtension(extension, 'image')
  if (extension === 'gif' || extension === 'webp' || extension === 'bmp' || extension === 'svg') {
    return byExtension(extension, 'image')
  }

  if (extension === 'mp4' || extension === 'webm' || extension === 'mov') return byExtension(extension, 'video')
  if (extension === 'mp3' || extension === 'wav' || extension === 'aac' || extension === 'm4a') {
    return byExtension(extension, 'audio')
  }

  if (looksLikeText(bytes)) return normalize('text', extension || 'txt', '')

  return { ...EMPTY, extension }
}
