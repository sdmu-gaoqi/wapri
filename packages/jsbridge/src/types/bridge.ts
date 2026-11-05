import { BridgeRegister } from './register'

export interface JSBridgeConfig {
  /** 是否在控制台打印 JS 与 Native 通信的原始数据。 */
  debug: boolean
  /** Android / 鸿蒙注入到 window 上的 Native 通道名，默认 `JSBridge`。 */
  nativeChannel: string
  /** 代理实例缓存在 window 上的键名，默认 `__sdkJSBridge`。 */
  globalKey: string
}

export interface NativeRequest<TParams = Record<string, unknown>> {
  method: string
  params: TParams
  requestId: string
}

export type NativeTransport = (request: NativeRequest) => void

export interface NativeBridge {
  handle?: (message: string) => void
}

export interface IOSBridgeHandler {
  postMessage?: (message: string) => void
}

export type NativeEventListener<TData = unknown> = (data: TData) => void

export interface PendingRequest {
  reject: (reason: Error) => void
  resolve: (data: unknown) => void
  timer: number
}

export interface JSBridge extends BridgeRegister {
  config: JSBridgeConfig
  setDebug(debug: boolean): void
  on<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): () => void
  once<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): () => void
  off<TData = unknown>(eventName: string, listener: NativeEventListener<TData>): void
  webReady(): boolean
  destroy(): void
}

export interface BridgeWindow extends Window {
  webkit?: {
    messageHandlers?: Record<string, IOSBridgeHandler | undefined>
  }
  onNativeMessage?: (message: string) => void
  onNativeEvent?: (eventName: string, data: unknown) => void
}
