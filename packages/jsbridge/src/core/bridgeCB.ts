import { get, isNumber, isObject, isString } from '@wapri/gbase'
import { BridgeError } from '../errors'
import type { BridgeApiConfig } from '../registers'
import type {
  JSBridgeConfig,
  NativeEventListener,
  NativeRequest,
  NativeTransport,
  PendingRequest,
} from '../types/bridge'

const DEFAULT_TIMEOUT = 10_000
/** 统一维护 Native 响应回调、请求 ID、pending Map 与订阅事件。 */
export class BridgeCB {
  constructor(private readonly config: JSBridgeConfig) {}

  private readonly pendingRequests = new Map<string, PendingRequest>()
  private readonly eventListeners = new Map<string, Set<NativeEventListener>>()
  private requestSequence = 0

  /** 接收 Native 一次性事务响应的全局回调。 */
  readonly onNativeMessage = (rawResponse: string): void => {
    this.debugLog('[jsbridge] Native -> JS', rawResponse)
    this.handleNativeResponse(rawResponse)
  }

  /** 接收 Native 长连接或订阅事件的全局回调。 */
  readonly onNativeEvent = (eventName: string, data: unknown): void => {
    this.debugLog('[jsbridge] Native -> JS event', eventName, data)
    this.handleNativeEvent(eventName, data)
  }

  /**
   * 创建一个等待 Native 响应的事务，并通过 transport 发送请求。
   *
   * @param options 本次 Native 调用的执行配置。
   * @returns code 为 0 时解析 data，否则以携带 Native code 的 BridgeError 拒绝。
   */
  call<TData = unknown, TParams extends Record<string, unknown> = Record<string, unknown>>(
    method: string,
    params: TParams,
    transport: NativeTransport,
    options: Omit<BridgeApiConfig, 'nativeMethod' | 'initialParams'>,
  ): Promise<TData> {
    const requestId = this.createRequestId()
    const request: NativeRequest<TParams> = { method, params, requestId }

    return new Promise<TData>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.settleRequest(requestId, new Error('Native 请求超时'))
      }, options?.timeout || DEFAULT_TIMEOUT)

      this.pendingRequests.set(requestId, {
        resolve: (data) => resolve(data as TData),
        reject,
        timer,
      })

      try {
        transport(request)
      } catch (error: unknown) {
        this.settleRequest(requestId, error instanceof Error ? error : new Error('Native 调用失败'))
      }
    })
  }

  /**
   * 订阅指定 Native 事件。
   *
   * @returns 取消本次订阅的函数。
   */
  on<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): () => void {
    const listeners = this.eventListeners.get(eventName) ?? new Set<NativeEventListener>()
    const eventListener = listener as NativeEventListener

    listeners.add(eventListener)
    this.eventListeners.set(eventName, listeners)

    return () => this.off(eventName, eventListener)
  }

  /**
   * 订阅一次指定 Native 事件，首次触发后自动取消。
   *
   * @returns 提前取消本次订阅的函数。
   */
  once<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): () => void {
    const remove = this.on<TData>(eventName, (data) => {
      remove()
      listener(data)
    })

    return remove
  }

  /** 移除指定事件的一个监听函数。 */
  off<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): void {
    const listeners = this.eventListeners.get(eventName)

    if (!listeners) {
      return
    }

    listeners.delete(listener as NativeEventListener)

    if (listeners.size === 0) {
      this.eventListeners.delete(eventName)
    }
  }

  /** 拒绝未完成请求并清空所有事件订阅。 */
  destroy(): void {
    this.pendingRequests.forEach((pendingRequest) => {
      clearTimeout(pendingRequest.timer)
      pendingRequest.reject(new Error('Native 已销毁'))
    })
    this.pendingRequests.clear()
    this.eventListeners.clear()
  }

  /** 生成当前实例内唯一的请求 ID。 */
  private createRequestId(): string {
    this.requestSequence += 1
    return `BridgeHandle${Date.now()}${this.requestSequence}`
  }

  /** 根据 requestId 清理事务，并将结果交给对应的 Promise。 */
  private settleRequest(requestId: string, error?: Error, data?: unknown): void {
    const pendingRequest = this.pendingRequests.get(requestId)

    if (!pendingRequest) {
      return
    }

    clearTimeout(pendingRequest.timer)
    this.pendingRequests.delete(requestId)

    if (error) {
      pendingRequest.reject(error)
      return
    }

    pendingRequest.resolve(data)
  }

  /** 解析 Native 返回的 JSON 响应，并匹配对应的一次性事务。 */
  private handleNativeResponse(rawResponse: string): void {
    try {
      const response: unknown = JSON.parse(rawResponse)

      if (!isObject(response)) {
        return
      }

      const requestId = get(response, 'requestId')
      const code = get(response, 'code')
      const message = get(response, 'message')

      if (!isString(requestId) || !isNumber(code) || !isString(message)) {
        return
      }

      const nativeCode = Number(code)

      if (nativeCode === 0) {
        this.settleRequest(requestId, undefined, get(response, 'data'))
        return
      }

      this.settleRequest(requestId, new BridgeError(nativeCode, message))
    } catch {
      // Native 返回非法 JSON 时忽略，不影响仍在等待的其他事务。
    }
  }

  /** 解析并分发指定名称的 Native 订阅事件。 */
  private handleNativeEvent(eventName: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventName)

    if (!listeners) {
      return
    }

    const eventData = this.parseEventData(data)
    listeners.forEach((listener) => listener(eventData))
  }

  /** 尝试将 Native 传入的 JSON 字符串还原为事件数据。 */
  private parseEventData(data: unknown): unknown {
    if (!isString(data)) {
      return data
    }

    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }

  /** 仅在当前 JSBridge 实例开启调试时输出 Native 原始数据。 */
  private debugLog(...args: unknown[]): void {
    if (this.config.debug) {
      console.log(...args)
    }
  }
}
