/**
 * 可视区域观察。
 *
 * 预览要「看到哪里渲染哪里」，IntersectionObserver 是最稳的判定方式；
 * 不支持 IntersectionObserver 的环境（部分老 WebView）直接按可见处理，由调用方降级成全量渲染。
 */

export type VisibilityCallback = (visible: boolean, entry?: IntersectionObserverEntry) => void

export interface VisibilityOptions extends IntersectionObserverInit {
  /** 首次进入视口后自动断开，适合一次性资源加载 */
  once?: boolean
}

export const observeVisibility = (
  element: Element,
  callback: VisibilityCallback,
  options: VisibilityOptions = {},
): (() => void) => {
  if (typeof IntersectionObserver === 'undefined') {
    callback(true)

    return () => {}
  }

  const { once = false, ...init } = options
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      callback(entry.isIntersecting, entry)

      if (once && entry.isIntersecting) {
        observer.disconnect()
        break
      }
    }
  }, init)

  observer.observe(element)

  return () => observer.disconnect()
}
