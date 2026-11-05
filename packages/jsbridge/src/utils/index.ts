import { isUndefined } from '@wapri/gbase'
import type { BridgeWindow, NativeBridge } from '../types/bridge'

/** 获取当前浏览器环境的 window；非浏览器环境返回 undefined。 */
export function getBridgeWindow(): BridgeWindow | undefined {
  const bridgeWindow = globalThis.window as BridgeWindow | undefined
  return isUndefined(bridgeWindow) ? undefined : bridgeWindow
}

/**
 * 读取注入在 window 上的 Native 通道。
 *
 * 通道名由业务通过 `createJSB({ nativeChannel })` 指定，因此按索引动态取值。
 */
export function getNativeChannel(channel: string): NativeBridge | undefined {
  const bridgeWindow = getBridgeWindow()

  if (isUndefined(bridgeWindow)) {
    return undefined
  }

  return (bridgeWindow as unknown as Record<string, unknown>)[channel] as NativeBridge | undefined
}

/** 从 window 上读取缓存值，用于复用 Bridge 代理实例。 */
export function getWindowValue<T>(key: string): T | undefined {
  const bridgeWindow = getBridgeWindow()

  if (isUndefined(bridgeWindow)) {
    return undefined
  }

  return (bridgeWindow as unknown as Record<string, unknown>)[key] as T | undefined
}

/** 向 window 写入缓存值，用于复用 Bridge 代理实例。 */
export function setWindowValue(key: string, value: unknown): void {
  const bridgeWindow = getBridgeWindow()

  if (isUndefined(bridgeWindow)) {
    return
  }

  ;(bridgeWindow as unknown as Record<string, unknown>)[key] = value
}
