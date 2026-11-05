/** 图标集脚本的 DOM 标记，避免与宿主页面已有的 script 冲突 */
const SCRIPT_ID_PREFIX = 'wa-ui-iconfont'
const SCRIPT_URL_ATTR = 'data-iconfont-url'

const loadPromises = new Map<string, Promise<void>>()
let scriptSeed = 0

export interface IconfontSymbol {
  content: string
  viewBox: string | undefined
}

const findLoadedScript = (url: string): HTMLScriptElement | undefined =>
  Array.from(document.querySelectorAll<HTMLScriptElement>(`script[${SCRIPT_URL_ATTR}]`)).find(
    (script) => script.getAttribute(SCRIPT_URL_ATTR) === url,
  )

/**
 * 在浏览器中按需加载图标集脚本（例如阿里 Iconfont 导出的 symbol 集合）。
 *
 * 图标源由调用方传入（`SvgIcon` 的 `src` 或 `ConfigProvider` 的 `iconfont`），库内不内置任何图标地址。
 */
export function loadIconfont(url: string): Promise<void> {
  if (typeof document === 'undefined' || !url) return Promise.resolve()

  const cached = loadPromises.get(url)
  if (cached) return cached
  if (findLoadedScript(url)) return Promise.resolve()

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    scriptSeed += 1
    script.id = `${SCRIPT_ID_PREFIX}-${scriptSeed}`
    script.setAttribute(SCRIPT_URL_ATTR, url)
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromises.delete(url)
      reject(new Error(`[element-pro] 图标集加载失败：${url}`))
    }
    document.head.appendChild(script)
  })

  loadPromises.set(url, promise)

  return promise
}

export function getIconfontSymbol(id: string): IconfontSymbol | undefined {
  if (typeof document === 'undefined') return undefined
  const symbol = document.getElementById(id)
  if (!symbol || symbol.tagName.toLowerCase() !== 'symbol') return undefined
  return {
    content: symbol.innerHTML,
    viewBox: symbol.getAttribute('viewBox') ?? undefined,
  }
}
