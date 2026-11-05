import { isFunction, isUndefined } from '@wapri/gbase'
import type { BridgeApiConfig } from '../registers'
import { BridgeCB } from './bridgeCB'
import type { JSBridgeConfig, NativeTransport } from '../types/bridge'
import { getBridgeWindow, getNativeChannel } from '../utils'

/** 默认配置：通道名与缓存键都是通用值，业务可通过 `createJSB` 覆盖。 */
export const DEFAULT_JSBRIDGE_CONFIG: JSBridgeConfig = {
  debug: false,
  nativeChannel: 'JSBridge',
  globalKey: '__sdkJSBridge',
}

/** 只负责三端 Native transport，并复用 BridgeCB 的回调能力。 */
export class JSBNative {
  /** 当前实例的运行时配置。 */
  readonly config: JSBridgeConfig

  /** 可复用的请求响应与事件回调管理器。 */
  readonly cb: BridgeCB

  /** 挂载供 Native 调用的全局响应与事件回调。 */
  constructor(config: Partial<JSBridgeConfig> = {}) {
    this.config = { ...DEFAULT_JSBRIDGE_CONFIG, ...config }
    this.cb = new BridgeCB(this.config)
    this.installNativeCallbacks()
  }

  /** 设置是否打印当前实例与 Native 通信的原始数据。 */
  setDebug(debug: boolean): void {
    this.config.debug = debug
  }

  /**
   * 将业务方法及参数交给当前 WebView 容器的 Native 通道。
   *
   * @param options 本次 Native 调用的执行配置。
   * @returns Native 成功响应中的 data。
   */
  callNative<TData = unknown, TParams extends Record<string, unknown> = Record<string, unknown>>(
    method: string,
    params: TParams,
    options: Omit<BridgeApiConfig, 'nativeMethod' | 'initialParams'>,
  ): Promise<TData> {
    const transport = this.getNativeTransport(method)

    if (isUndefined(transport)) {
      const message = `Native 通道未就绪（${this.config.nativeChannel}）`
      console.log(message)
      console.dir({
        method: method,
        params: params,
      })
      return Promise.reject(new Error(message))
    }

    return this.cb.call(method, params, transport, options)
  }

  /** 清理未完成请求、事件订阅以及本实例挂载的全局回调。 */
  destroy(): void {
    this.cb.destroy()

    const bridgeWindow = getBridgeWindow()

    if (bridgeWindow?.onNativeMessage === this.cb.onNativeMessage) {
      delete bridgeWindow.onNativeMessage
    }

    if (bridgeWindow?.onNativeEvent === this.cb.onNativeEvent) {
      delete bridgeWindow.onNativeEvent
    }
  }

  /**
   * 检查 Native 通道是否已注入到当前页面。
   *
   * @returns `true` 表示 Android/鸿蒙或 iOS 的 Native 通道已挂载。
   */
  webReady(): boolean {
    const bridgeWindow = getBridgeWindow()

    return (
      !isUndefined(getNativeChannel(this.config.nativeChannel)) || !isUndefined(bridgeWindow?.webkit?.messageHandlers)
    )
  }

  /** 将 BridgeCB 的处理函数注册为 Native 回调入口。 */
  private installNativeCallbacks(): void {
    const bridgeWindow = getBridgeWindow()

    if (isUndefined(bridgeWindow)) {
      return
    }

    bridgeWindow.onNativeMessage = this.cb.onNativeMessage
    bridgeWindow.onNativeEvent = this.cb.onNativeEvent
  }

  /**
   * 按业务方法获取 iOS 消息通道，未注入时回退到 Android/鸿蒙通道。
   *
   * iOS 使用 `webkit.messageHandlers[method]`，报文中不重复携带 method；
   * Android/鸿蒙使用 `window[nativeChannel].handle`，报文中携带完整请求。
   *
   * @param method 本次调用对应的 Native 方法名。
   * @returns 可调用的 Native 消息发送函数；容器未注入时返回 undefined。
   */
  private getNativeTransport(method: string): NativeTransport | undefined {
    const bridgeWindow = getBridgeWindow()
    const iOSHandler = bridgeWindow?.webkit?.messageHandlers?.[method]

    if (isFunction(iOSHandler?.postMessage)) {
      const postMessage = iOSHandler.postMessage.bind(iOSHandler)

      return ({ params, requestId }) => {
        const message = JSON.stringify({
          params,
          requestId,
        })

        this.debugLog('[jsbridge] JS -> Native', message)
        postMessage(message)
      }
    }

    const nativeBridge = getNativeChannel(this.config.nativeChannel)

    if (isFunction(nativeBridge?.handle)) {
      const handle = nativeBridge.handle.bind(nativeBridge)
      return (request) => {
        const message = JSON.stringify(request)

        this.debugLog('[jsbridge] JS -> Native', message)
        handle(message)
      }
    }

    return undefined
  }

  /** 仅在当前实例开启调试时输出发送给 Native 的原始报文。 */
  private debugLog(...args: unknown[]): void {
    if (this.config.debug) {
      console.log(...args)
    }
  }
}
