/**
 * Worker 创建与主线程 RPC 通道。
 *
 * 预览场景需要把重解析丢进 worker；这里只提供传输层，不绑定具体解析库，
 * 内联源码用 Blob URL 创建，避免消费方必须把 worker 文件暴露成独立入口。
 */

import type {
  CreateWorkerOptions,
  WorkerRequestMessage,
  WorkerRequestOptions,
  WorkerResponseMessage,
  WorkerTask,
} from './types/worker'

interface PendingTask {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timer?: ReturnType<typeof setTimeout>
  onProgress?: (progress: number) => void
}

/** 内联 worker 的 Blob URL，释放前先登记，避免重复 revoke */
const inlineUrls = new Set<string>()

/** 用脚本源码创建 classic worker，源码里可用 importScripts 加载 UMD 资源 */
export const createInlineWorker = (source: string, options: CreateWorkerOptions = {}): Worker => {
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
  const worker = new Worker(url, { type: options.type ?? 'classic', name: options.name })

  inlineUrls.add(url)
  // worker 启动后再释放；部分 WebView 在启动前 revoke 会直接加载失败
  setTimeout(() => {
    if (!inlineUrls.delete(url)) return

    URL.revokeObjectURL(url)
  }, 30_000)

  return worker
}

/** 用入口地址创建 worker，默认 module，便于 worker 内部使用 ESM */
export const createWorkerFromUrl = (url: string | URL, options: CreateWorkerOptions = {}): Worker =>
  new Worker(url, { type: options.type ?? 'module', name: options.name })

/**
 * 主线程 worker 通道：request 返回 Promise，支持超时、进度与自定义事件。
 */
export class WorkerChannel {
  private readonly worker: Worker
  private readonly pending = new Map<number, PendingTask>()
  private readonly listeners = new Map<string, Set<(payload: unknown) => void>>()
  private seq = 0
  private disposed = false

  constructor(worker: Worker) {
    this.worker = worker
    this.worker.addEventListener('message', this.handleMessage)
    this.worker.addEventListener('error', this.handleError)
  }

  /** 发送任务并等待结果 */
  request<TResponse = unknown>(task: WorkerTask, options: WorkerRequestOptions = {}): Promise<TResponse> {
    if (this.disposed) {
      return Promise.reject(new Error('[base] worker 已终止'))
    }

    const id = ++this.seq
    const message: WorkerRequestMessage = { id, type: task.type, payload: task.payload }

    return new Promise<TResponse>((resolve, reject) => {
      const pending: PendingTask = {
        resolve: resolve as (value: unknown) => void,
        reject,
        onProgress: options.onProgress,
      }
      const timeout = options.timeout ?? 60_000

      if (timeout > 0) {
        pending.timer = setTimeout(() => {
          this.pending.delete(id)
          reject(new Error(`[base] worker 任务超时：${task.type}`))
        }, timeout)
      }

      this.pending.set(id, pending)
      this.worker.postMessage(message)
    })
  }

  /** 监听 worker 主动推送的事件，返回取消函数 */
  on(type: string, listener: (payload: unknown) => void): () => void {
    const set = this.listeners.get(type) ?? new Set<(payload: unknown) => void>()

    set.add(listener)
    this.listeners.set(type, set)

    return () => {
      set.delete(listener)
      if (set.size === 0) this.listeners.delete(type)
    }
  }

  /** 结束 worker 并拒绝所有未完成的任务 */
  terminate() {
    if (this.disposed) return

    this.disposed = true
    this.worker.removeEventListener('message', this.handleMessage)
    this.worker.removeEventListener('error', this.handleError)
    this.rejectAll(new Error('[base] worker 已终止'))
    this.worker.terminate()
    this.listeners.clear()
  }

  private readonly handleMessage = (event: MessageEvent) => {
    const message = event.data as WorkerResponseMessage | undefined

    if (!message || typeof message.id !== 'number') return

    const task = this.pending.get(message.id)

    if (!task) return

    if (message.type === 'progress') {
      task.onProgress?.(message.progress ?? 0)

      return
    }

    this.pending.delete(message.id)
    if (task.timer) clearTimeout(task.timer)

    if (message.type === 'error') {
      task.reject(new Error(message.error || '[base] worker 任务失败'))

      return
    }

    task.resolve(message.payload)
  }

  private readonly handleError = (event: ErrorEvent) => {
    this.rejectAll(new Error(event.message || '[base] worker 运行异常'))
  }

  private rejectAll(reason: unknown) {
    this.pending.forEach((task) => {
      if (task.timer) clearTimeout(task.timer)
      task.reject(reason)
    })
    this.pending.clear()
  }
}
