/**
 * Worker 相关类型：内联 worker 创建参数与请求 / 响应协议。
 */

export type WorkerKind = 'classic' | 'module'

export interface CreateWorkerOptions {
  /** module worker 才能用 import，默认 classic */
  type?: WorkerKind
  name?: string
}

/** worker 收到的任务消息 */
export interface WorkerRequestMessage {
  id: number
  type: string
  payload?: unknown
}

export type WorkerResponseType = 'result' | 'error' | 'progress'

/** worker 回传的消息 */
export interface WorkerResponseMessage {
  id: number
  type: WorkerResponseType
  payload?: unknown
  error?: string
  /** 0 - 1，progress 类型时使用 */
  progress?: number
}

export interface WorkerRequestOptions {
  /** 超时毫秒数，<= 0 表示不限时 */
  timeout?: number
  /** 进度回调，worker 主动发 progress 消息时触发 */
  onProgress?: (progress: number) => void
}

/** 转发给 worker 的通用任务 */
export interface WorkerTask {
  type: string
  payload?: unknown
}
