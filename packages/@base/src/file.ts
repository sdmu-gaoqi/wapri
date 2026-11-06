/**
 * 统一读取用户提供的文件来源：本地 File / Blob、内存 Buffer、远程或 data URL。
 */

export type FileInput = Blob | ArrayBuffer | ArrayBufferView | string

/** 是否是 fetch 能直接处理的地址 */
export const isFileUrl = (value: string) => /^(https?:|data:|blob:|file:)/i.test(value)

const viewToArrayBuffer = (view: ArrayBufferView): ArrayBuffer => {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)

  return bytes.slice().buffer
}

const fetchBuffer = async (url: string, init?: RequestInit): Promise<ArrayBuffer> => {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new Error(`[base] 文件请求失败：${response.status} ${response.statusText}`)
  }

  return response.arrayBuffer()
}

/** 读取为 ArrayBuffer，字符串按 URL 处理 */
export const readFileAsArrayBuffer = async (input: FileInput, init?: RequestInit): Promise<ArrayBuffer> => {
  if (typeof input === 'string') {
    return fetchBuffer(input, init)
  }

  if (input instanceof ArrayBuffer) {
    return input
  }

  if (ArrayBuffer.isView(input)) {
    return viewToArrayBuffer(input)
  }

  return input.arrayBuffer()
}

/** 读取为 Blob；传入 ArrayBuffer / Buffer 时需要显式给 MIME，否则按 octet-stream 处理 */
export const readFileAsBlob = async (input: FileInput, mime = 'application/octet-stream'): Promise<Blob> => {
  if (input instanceof Blob) {
    return input
  }

  if (typeof input === 'string') {
    return new Blob([await fetchBuffer(input)], { type: mime })
  }

  return new Blob([await readFileAsArrayBuffer(input)], { type: mime })
}

/** 读取为文本，默认 UTF-8，BOM 由 TextDecoder 处理 */
export const readFileAsText = async (input: FileInput, encoding = 'utf-8', init?: RequestInit): Promise<string> => {
  if (typeof input === 'string' && !isFileUrl(input)) {
    return input
  }

  if (input instanceof Blob) {
    const buffer = await input.arrayBuffer()

    return new TextDecoder(encoding).decode(buffer)
  }

  return new TextDecoder(encoding).decode(await readFileAsArrayBuffer(input, init))
}

/** 读取体积，无法直接得知时返回 0（不额外发请求） */
export const getFileSize = (input: FileInput): number => {
  if (input instanceof Blob) return input.size
  if (input instanceof ArrayBuffer) return input.byteLength
  if (ArrayBuffer.isView(input)) return input.byteLength

  return 0
}

/** 取文件名，URL 会去掉 query、hash 并做一次 decode */
export const getFileName = (input: FileInput, fallback = ''): string => {
  if (input instanceof File) return input.name
  if (typeof input !== 'string') return fallback

  const clean = input.split(/[?#]/)[0]
  const name = clean.split('/').pop() ?? fallback

  try {
    return decodeURIComponent(name) || fallback
  } catch {
    return name || fallback
  }
}
