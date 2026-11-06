/**
 * PDF 预览选项。
 */

import type { BasePreviewOptions } from './common'

/** pdf.js 运行资源，业务方按部署路径注入，包内不写死 CDN */
export interface PdfjsRuntimeConfig {
  /** `pdf.worker.min.mjs` 地址；默认取包内 vendor 副本 */
  workerSrc?: string
  /** CMap 目录，预览中文 PDF 建议配置 */
  cMapUrl?: string
  /** 标准字体目录 */
  standardFontDataUrl?: string
}

export interface PdfPreviewOptions extends BasePreviewOptions {
  /** 固定缩放，未设置时按容器宽度自适应 */
  scale?: number
  /** 自适应缩放上限，默认 3 */
  maxScale?: number
  /** 是否展示底部缩略图条，默认 false */
  thumbnails?: boolean
  /** pdf.js 资源配置 */
  pdfjs?: PdfjsRuntimeConfig
}
