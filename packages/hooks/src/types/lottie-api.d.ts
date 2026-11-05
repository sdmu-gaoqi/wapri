/**
 * lottie-api 未提供类型声明，这里按仓库实际用到的 API 补充。
 * 上游实现参考：https://github.com/bodymovin/lottie-api
 */
declare module 'lottie-api' {
  import type { AnimationItem } from 'lottie-web'

  /** keyPath 命中的单个图层元素，canvas 与 svg 渲染器暴露的字段不同 */
  export interface LottieApiElement {
    element: {
      /** canvas 渲染器下的 Image 元素 */
      img?: { src: string }
      /** svg 渲染器下的 <image> 元素 */
      innerElem?: Element
    }
  }

  /** 一个 keyPath 命中的图层集合 */
  export interface LottieApiKeyPath {
    getElements: () => LottieApiElement[]
  }

  /** createAnimationApi 返回的操作句柄 */
  export interface LottieApi {
    /** 按图层名/keyPath 取元素 */
    getKeyPath: (keyPath: string) => LottieApiKeyPath
    /** 当前渲染器类型 */
    getRendererType: () => string
  }

  const lottieApi: {
    createAnimationApi: (animation: AnimationItem) => LottieApi
  }

  export default lottieApi
}
