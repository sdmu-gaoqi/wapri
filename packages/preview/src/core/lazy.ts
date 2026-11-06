/**
 * 可视区域懒渲染池。
 *
 * 每个可渲染单元（文本块、PDF 页、表格行、Word 页）注册进来，
 * 进入视口才执行 render，离开视口按 keepAlive 决定是否调用 release 释放位图。
 */

export interface LazyTarget {
  element: HTMLElement
  render: () => void | Promise<void>
  /** 离开视口时释放，例如把 canvas 宽高置 0 */
  release?: () => void
}

export interface LazyPoolOptions {
  /** IntersectionObserver 的 root，通常是滚动容器 */
  root?: HTMLElement | null
  /** 提前渲染的边距，默认 1 屏 */
  rootMargin?: string
  /** 离开视口是否保留渲染结果，默认 true */
  keepAlive?: boolean
  /** 同时渲染的最大数量，默认 2 */
  maxConcurrent?: number
}

interface Entry {
  target: LazyTarget
  rendered: boolean
  queued: boolean
}

export class LazyRenderPool {
  private readonly observer?: IntersectionObserver
  private readonly entries = new Map<Element, Entry>()
  private readonly queue: Entry[] = []
  private readonly keepAlive: boolean
  private readonly maxConcurrent: number
  private running = 0
  private destroyed = false

  constructor(options: LazyPoolOptions = {}) {
    this.keepAlive = options.keepAlive ?? true
    this.maxConcurrent = Math.max(1, options.maxConcurrent ?? 2)

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(this.handleIntersect, {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '100% 0px',
        threshold: 0.01,
      })
    }
  }

  get renderedCount() {
    let count = 0

    this.entries.forEach((entry) => {
      if (entry.rendered) count += 1
    })

    return count
  }

  /** 注册一个懒渲染单元，返回取消注册函数 */
  register(target: LazyTarget): () => void {
    const entry: Entry = { target, rendered: false, queued: false }

    this.entries.set(target.element, entry)

    if (!this.observer) {
      // 没有 IntersectionObserver 时直接全量渲染
      this.enqueue(entry)

      return () => this.entries.delete(target.element)
    }

    this.observer.observe(target.element)

    return () => {
      this.observer?.unobserve(target.element)
      this.entries.delete(target.element)
    }
  }

  /** 立即渲染全部单元，用于打印、导出或关闭懒加载 */
  renderAll() {
    this.entries.forEach((entry) => this.enqueue(entry))
  }

  /** 丢弃已渲染结果并重新观察，用于容器尺寸变化后重排 */
  reset() {
    this.queue.length = 0

    this.entries.forEach((entry) => {
      entry.rendered = false
      entry.queued = false
      entry.target.release?.()

      if (!this.observer) {
        this.enqueue(entry)

        return
      }

      // 重新 observe 会重新触发一次 intersect 回调
      this.observer.unobserve(entry.target.element)
      this.observer.observe(entry.target.element)
    })
  }

  destroy() {
    this.destroyed = true
    this.observer?.disconnect()
    this.entries.clear()
    this.queue.length = 0
  }

  private readonly handleIntersect = (records: IntersectionObserverEntry[]) => {
    for (const record of records) {
      const entry = this.entries.get(record.target)

      if (!entry) continue

      if (record.isIntersecting) {
        this.enqueue(entry)
        continue
      }

      if (!this.keepAlive && entry.rendered) {
        entry.target.release?.()
        entry.rendered = false
      }
    }
  }

  private enqueue(entry: Entry) {
    if (entry.rendered || entry.queued) return

    entry.queued = true
    this.queue.push(entry)
    this.pump()
  }

  private pump() {
    while (!this.destroyed && this.running < this.maxConcurrent && this.queue.length > 0) {
      const entry = this.queue.shift()

      if (!entry || entry.rendered) continue

      this.running += 1
      Promise.resolve(entry.target.render())
        .then(() => {
          entry.rendered = true
        })
        .catch((error: unknown) => {
          console.error('[preview] 渲染单元失败', error)
        })
        .finally(() => {
          entry.queued = false
          this.running -= 1
          this.pump()
        })
    }
  }
}
