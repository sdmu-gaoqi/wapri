import type { BridgeRegister } from '../types/register'

/** 单个业务 Bridge 方法的 Native 调用配置。 */
export type BridgeApiConfig = {
  /** Native 方法未响应时的超时，单位毫秒。 */
  nativeMethod?: string
  timeout?: number
  initialParams?: Record<string, unknown>
}

/**
 * 对业务暴露api转换为调用原生的api
 *
 * `initialParams` 只放与业务无关的默认值，业务参数由调用方传入。
 * */
export const apiRegistry: Partial<Record<keyof BridgeRegister, BridgeApiConfig>> = {
  canIUse: {
    nativeMethod: 'permission.caniuse',
  },
  getSafeArea: {
    nativeMethod: 'getSafeArea',
  },
  close: {
    nativeMethod: 'closeWebview',
  },
  makePhoneCall: {
    nativeMethod: 'makePhoneCall',
  },
}
