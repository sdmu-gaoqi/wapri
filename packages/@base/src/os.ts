import { regexpArkWeb, regexpHarmonyOS, regexpHarmonyOSNext } from './constant/os'
import type { OSType } from './types/os'

/* eslint-disable no-useless-escape */
const browserList = {
  // app内
  wechat: /micromessenger\/([\d\.]+)/i,
  alipay: /alipay/i,
  qq: /qq\/([\d\.]+)/i,
  weibo: /\bweibo\b/i,
  tiktok: /aweme/i,
  // app游览器
  baidu: / (baiduboxapp|biduboxapp)\//i,
  douban: /com\.douban\.frodo\/([\d\.]+)/i,
  xiaomi: /miuibrowser/i,
  uc: /ucbrowser/i,
  quark: /quark/i,
  // 游览器
  ie: /(msie\s([\d.]+)|(trident\/\d\.\d))/i,
  chrome: /(crios|chrome)\/([\d\.]+)/i,
  safari: /safari\/([\d\.]+)/i,
  edge: /edge\/([\d\.]+)/i,
  firefox: /firefox\/([\d\.]+)/i,
  opera: /(?:opera|opr).([\d\.]+)/i,
}

type BrwoserType = keyof typeof browserList

const getUA = () => {
  return navigator?.userAgent.toLocaleLowerCase() ?? ''
}

const isIOS = (ua = getUA()) => /iphone|ipad|ipod|ios/i.test(ua)

const isIpad: () => boolean = () => {
  const platform = navigator.platform === 'MacIntel' || navigator.platform === 'iPad'
  return (platform && navigator.maxTouchPoints > 1) || navigator.userAgent.match(/iPad/i) != null
}

/**
 * 是否为 Android
 *
 * 旧版鸿蒙（HarmonyOS 4 及以前）兼容 AOSP，其 UA 中同时包含 `Android`，因此这里会返回 `true`；
 * 若需要区分两者，请优先用 `isHarmonyOS()` 判断。
 */
const isAndroid = (ua = getUA()) => {
  return /android/i.test(ua)
}

/**
 * 是否为鸿蒙系统（广义）
 *
 * 覆盖两类：
 * - 纯血鸿蒙 HarmonyOS NEXT：UA 含 `OpenHarmony` / `ArkWeb`，不含 `Android`
 * - 旧版鸿蒙 HarmonyOS 4 及以前：UA 含 `HarmonyOS` / `HMSCore`，同时含 `Android`
 */
const isHarmonyOS = (ua = getUA()) => {
  return regexpHarmonyOS().test(ua)
}

/**
 * 是否为纯血鸿蒙（HarmonyOS NEXT，5.x）
 *
 * UA 含 `OpenHarmony` 或 `Harmony/x.y`，且不再是 AOSP 兼容架构，不含 `Android`。
 * 需要与旧版鸿蒙区分时使用。
 */
const isHarmonyOSNext = (ua = getUA()) => {
  if (/android/i.test(ua)) return false
  return regexpHarmonyOSNext().test(ua) || regexpArkWeb().test(ua)
}

/**
 * 是否为旧版鸿蒙（HarmonyOS 4 及以前，兼容 AOSP）
 *
 * UA 同时包含 `Android` 与鸿蒙标识，可正常安装 Android APK。
 */
const isHarmonyOSLegacy = (ua = getUA()) => {
  return /android/i.test(ua) && regexpHarmonyOS().test(ua)
}

const isPC = (ua = getUA()) => {
  return !ua.match(/android|iphone|ipad|pod/i) && !isHarmonyOS(ua) && !isIpad()
}

const isMobile = (ua = getUA()) => {
  return /iphone|ipad|ipod|ios|android|mobile/i.test(ua) || isHarmonyOS(ua) || isIpad()
}

/** 是否在微信内置浏览器中（UA 含 micromessenger），常用于 App Scheme 唤起等能力的降级判断 */
const isWeixin = (ua = getUA()) => {
  return browserList.wechat.test(ua)
}

// WqmtClient uniwebview https://docs.uniwebview.com/
// DeutolsWebSDK sdk-webview https://developer.papegames.com/docs/sdk/sdk_webview/
// UnrealEngine|PlayStation x6判断
const isInWebview = (ua = getUA()) => {
  return /Client|DeutolsWebSDK|UnrealEngine|PlayStation/i.test(ua)
}

/**
 * 获取操作系统类型
 *
 * 鸿蒙必须最先判断：旧版鸿蒙兼容 AOSP，其 appVersion 与 UA 中同时含 `Linux` 和 `Android`，
 * 若先匹配 `linux` 分支，鸿蒙会被吞成 `linux`，新增的 `harmonyos` 分支永远走不到。
 */
const getOS = (): OSType | undefined => {
  const userAgent = getUA()
  const appVersion = ('navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase()) || ''

  if (isHarmonyOS(userAgent)) return 'harmonyos'
  if (/mac/i.test(appVersion)) return 'mac'
  if (/win/i.test(appVersion)) return 'windows'
  if (/linux/i.test(appVersion)) return 'linux'
  if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) return 'ios'
  if (/android/i.test(userAgent)) return 'android'
}

const getBrwoserType = (ua: string = getUA()): BrwoserType | 'unknown' => {
  for (const i in browserList) {
    if (ua.match(browserList[i as BrwoserType])) {
      return i as BrwoserType
    }
  }
  return 'unknown'
}

export const os = {
  isPC,
  isMobile,
  isIpad,
  isIOS,
  isAndroid,
  isHarmonyOS,
  isHarmonyOSNext,
  isHarmonyOSLegacy,
  isWeixin,
  isInWebview,
  getBrwoserType,
  getOS,
  getUA,
}
