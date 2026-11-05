/**
 * 鸿蒙系统 UA 特征集中维护
 *
 * 约定与 `constant/regexp.ts` 一致：只导出「创建正则」的函数，避免正则字面量在脚本解析阶段抛错。
 *
 * 真实 UA 样本：
 * - 纯血鸿蒙（HarmonyOS NEXT）系统浏览器：
 *   `Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile HuaweiBrowser/5.0.3.351`
 * - 纯血鸿蒙 App 内嵌 WebView（部分应用会把型号与版本追加在末尾，形态为 `Harmony/5.0.1.71`）：
 *   `Mozilla/5.0 (Phone; OpenHarmony 5.0) ... ArkWeb/4.1.6.1 Mobile PPDWebUI/10.5.0 ... (Harmony/5.0.1.71)`
 * - 旧版鸿蒙（HarmonyOS 4 及以前，兼容 AOSP）：UA 中同时含 `Android` 与 `HarmonyOS`，
 *   形如 `Mozilla/5.0 (Linux; Android 10; HarmonyOS; ...) ... HuaweiBrowser/12.x`
 */

/** 鸿蒙 ArkWeb 内核标识，纯血鸿蒙（HarmonyOS NEXT）必带，旧版鸿蒙不带 */
export const regexpArkWeb = () => new RegExp('arkweb', 'i')

/** 纯血鸿蒙（HarmonyOS NEXT）平台标识，形如 `OpenHarmony 5.0` 或 `Harmony/5.0.1.71` */
export const regexpHarmonyOSNext = () => new RegExp('openharmony|harmony/\\d', 'i')

/**
 * 广义鸿蒙标识：覆盖纯血鸿蒙（`OpenHarmony`、`Harmony/5.x`、`ArkWeb`）与旧版鸿蒙（`HarmonyOS`）
 *
 * 注意不要把 `HMSCore` 作为判定依据：它是华为移动服务的 SDK 标识，普通华为 Android 机型
 * （如 ELS-AN00 / Mate 系列）的 UA 里同样带有，会把所有华为安卓机误判成鸿蒙。
 */
export const regexpHarmonyOS = () => new RegExp('openharmony|harmony/\\d|harmonyos|arkweb', 'i')
