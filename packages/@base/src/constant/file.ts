/**
 * 文件识别相关常量。
 *
 * 魔数只保留预览与上传场景真正需要的类型，扩展名与 MIME 的映射用于浏览器上报 MIME 不可靠时兜底。
 */

/** 各类文件的魔数签名，长度不足以匹配时视为不命中 */
export const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  zip: [0x50, 0x4b, 0x03, 0x04],
  png: [0x89, 0x50, 0x4e, 0x47],
  jpeg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46],
  bmp: [0x42, 0x4d],
  webp: [0x52, 0x49, 0x46, 0x46],
  rt: [0x52, 0x54],
} as const

/** OOXML 压缩包内部目录前缀，用于把 zip 细分成 docx / xlsx / pptx */
export const OOXML_PREFIX = {
  word: 'word/',
  xlsx: 'xl/',
  ppt: 'ppt/',
} as const

/** 扩展名 → MIME，键统一小写且不带点 */
export const EXTENSION_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  log: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  ts: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
}

/** 按文本处理、无需二进制解析的扩展名 */
export const TEXT_EXTENSIONS = [
  'txt',
  'log',
  'md',
  'markdown',
  'csv',
  'tsv',
  'json',
  'xml',
  'yml',
  'yaml',
  'ini',
  'conf',
  'html',
  'htm',
  'css',
  'scss',
  'less',
  'js',
  'jsx',
  'ts',
  'tsx',
  'vue',
  'py',
  'java',
  'go',
  'rs',
  'c',
  'h',
  'cpp',
  'sh',
] as const
