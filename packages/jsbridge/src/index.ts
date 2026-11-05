import { isFunction, isObject, isString, isUndefined } from '@wapri/gbase'
import { DEFAULT_JSBRIDGE_CONFIG, JSBNative } from './core'
import type { JSBridge, JSBridgeConfig } from './types/bridge'
import { getWindowValue, setWindowValue } from './utils'
import { apiRegistry } from './registers'
import type { BridgeRegister } from './types/register'

export { BridgeError } from './errors'
export { DEFAULT_JSBRIDGE_CONFIG } from './core'
export type { JSBridgeConfig } from './types/bridge'

const EVENT_METHODS = new Set(['on', 'once', 'off'])
const INTERNAL_METHODS = new Set([
  'handle',
  'ready',
  'request',
  'callNative',
  'onNativeMessage',
  'onNativeEvent',
  'installNativeCallbacks',
  'cb',
])

/**
 * 创建并缓存业务侧唯一的 Bridge 代理。
 *
 * 代理会将未注册的属性访问转换为 Native 方法调用，同时屏蔽底层通道与回调实现。
 * Native 通道名（`nativeChannel`）与缓存键（`globalKey`）由业务传入，库内只提供通用默认值。
 *
 * @param config 本次创建的运行时配置，只需传要覆盖的字段。
 */
export const createJSB = (config: Partial<JSBridgeConfig> = {}): JSBridge => {
  const globalKey = config.globalKey ?? DEFAULT_JSBRIDGE_CONFIG.globalKey
  const cached = getWindowValue<JSBridge>(globalKey)

  if (!isUndefined(cached)) {
    return cached
  }

  const nativeBridge = new JSBNative({ ...config, globalKey })
  const bridge = new Proxy(nativeBridge, {
    /** 根据属性名分发事件订阅、销毁方法或 Native 业务方法。 */
    get(target, property): unknown {
      if (!isString(property)) {
        return undefined
      }

      if (EVENT_METHODS.has(property)) {
        const eventMethod = Reflect.get(target.cb, property)
        return isFunction(eventMethod) ? eventMethod.bind(target.cb) : undefined
      }

      if (property === 'config') {
        return target.config
      }

      if (property === 'setDebug') {
        return target.setDebug.bind(target)
      }

      if (property === 'destroy') {
        return target.destroy.bind(target)
      }

      if (property === 'webReady') {
        return target.webReady.bind(target)
      }

      if (property === 'then' || INTERNAL_METHODS.has(property)) {
        return undefined
      }

      return (params: Record<string, unknown> = {}) => {
        if (!isObject(params)) {
          return Promise.reject(new Error('jsbridge 参数必须是对象'))
        }

        const apiConfig = apiRegistry?.[property as unknown as keyof BridgeRegister]
        const { nativeMethod, initialParams = {}, ...other } = apiConfig || {}
        const methodName = nativeMethod || property

        return target.callNative(methodName, { ...initialParams, ...params }, other)
      }
    },
  }) as unknown as JSBridge

  setWindowValue(globalKey, bridge)

  return bridge
}

/** 业务侧默认入口：使用 jsbridge.<具体 Native 方法名>(params)。 */
export const jsbridge = createJSB()

export default jsbridge
