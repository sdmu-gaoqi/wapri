/**
 * pdf.js 运行时加载与资源定位。
 *
 * 用 legacy 构建，兼容更多 H5 WebView；worker 默认指向包内 `dist/vendor` 的副本，
 * 业务方可用 `pdfjs.workerSrc` 覆盖成自己的 CDN。
 *
 * 注意：webpack 会把 `import.meta.url` 替换成构建机上的 `file://` 路径，浏览器无法 fetch，
 * 因此这里只在 `http(s)` 协议下才采用包内 vendor，其余情况交给调用方显式配置。
 */

import type { PdfjsRuntimeConfig } from '../types/pdf'

export type PdfjsModule = typeof import('pdfjs-dist')

let runtimeConfig: PdfjsRuntimeConfig = {}
let modulePromise: Promise<PdfjsModule> | undefined

/** 用字符串拼接避免构建器把包内 vendor 路径当成静态资源去解析 */
const resolveVendorUrl = (file: string): string | undefined => {
  try {
    if (typeof import.meta === 'undefined' || !import.meta.url) return undefined

    const base = import.meta.url

    if (!/^https?:\/\//i.test(base)) return undefined

    const dir = base.slice(0, base.lastIndexOf('/'))

    return `${dir}/../vendor/${file}`
  } catch {
    return undefined
  }
}

export const configurePdfjs = (config: PdfjsRuntimeConfig) => {
  runtimeConfig = { ...runtimeConfig, ...config }
}

export const getPdfjsConfig = (): PdfjsRuntimeConfig => ({
  ...runtimeConfig,
  workerSrc: runtimeConfig.workerSrc ?? resolveVendorUrl('pdf.worker.min.mjs'),
})

/** 按需加载 pdf.js，workerSrc 为空时保持 pdf.js 默认行为，并在调用侧给出明确提示 */
export const loadPdfJs = async (config: PdfjsRuntimeConfig = {}): Promise<PdfjsModule> => {
  configurePdfjs(config)

  modulePromise ??= import('pdfjs-dist/legacy/build/pdf.mjs') as unknown as Promise<PdfjsModule>

  const pdfjs = await modulePromise
  const { workerSrc } = getPdfjsConfig()

  if (workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  }

  return pdfjs
}
