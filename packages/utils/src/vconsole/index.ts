import { loadResource } from '@wapri/gbase'

const ERUDA_URL = 'https://cdn.jsdelivr.net/npm/eruda'

interface Eruda {
  init?: () => void
}

declare global {
  interface Window {
    eruda?: Eruda
  }
}

let initializePromise: Promise<void> | undefined
let initialized = false

/**
 * 动态加载并初始化移动端调试面板 Eruda。
 *
 * 同一页面中重复调用只会初始化一次；服务端渲染环境会安全跳过。
 */
export function vconsole(): Promise<void> {
  if (typeof window === 'undefined' || initialized) {
    return Promise.resolve()
  }

  if (initializePromise) {
    return initializePromise
  }

  initializePromise = (window.eruda ? Promise.resolve() : loadResource(ERUDA_URL))
    .then(() => {
      const eruda = window.eruda

      if (!eruda?.init) {
        throw new Error('Eruda 加载失败')
      }

      eruda.init()
      initialized = true
    })
    .catch((error: unknown) => {
      initializePromise = undefined
      throw error
    })

  return initializePromise
}
