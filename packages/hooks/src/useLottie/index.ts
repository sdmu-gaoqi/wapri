import { isObject } from '@wapri/gbase'
import lottieApi, { type LottieApi } from 'lottie-api'
import lottie from 'lottie-web'
import type { AnimationEventName, AnimationItem, AnimationSegment, RendererType } from 'lottie-web'
import { onBeforeUnmount, onMounted, shallowRef, unref, watch, type Ref } from 'vue'

export type { AnimationItem, AnimationSegment } from 'lottie-web'

/** 动画容器：DOM 元素、ref，或返回元素的 getter */
export type LottieTarget = Element | Ref<Element | null | undefined> | (() => Element | null | undefined)

export type UseLottieOptions = {
  /** 渲染器类型，默认 svg */
  renderer?: RendererType
  /** 是否循环播放，默认 true */
  loop?: boolean | number
  /** 是否自动播放，默认 true */
  autoplay?: boolean
  /** 动画名，多实例场景用于区分 */
  name?: string
  /** 使用 http 资源时的 json 地址 */
  path?: string
  /** 初始化时按图层名替换的图片 */
  dynamic?: Record<string, string>
  /** 动画加载完成回调 */
  onReady?: (instance: AnimationItem) => void
}

export type UseLottieReturn = {
  /** lottie 实例，未加载完成时为 null */
  instance: Ref<AnimationItem | null>
  play: () => void
  pause: () => void
  stop: () => void
  playSegments: (segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean) => void
  /** 播放指定区间，播放结束后 resolve */
  playAnimation: (segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean) => Promise<void>
  goToAndStop: (value: number | string, isFrame?: boolean, name?: string) => void
  goToAndPlay: (value: number | string, isFrame?: boolean, name?: string) => void
  getDuration: (inFrames?: boolean) => number
  on: (name: AnimationEventName, callback: () => void) => void
  off: (name: AnimationEventName, callback?: () => void) => void
  /** 按图层名动态替换图片 */
  dynamicReplaceImg: (dynamicList: Record<string, string>) => void
  setLoop: (value: number | boolean) => void
  destroy: () => void
}

/** 兼容元素、ref、getter 三种容器写法 */
const resolveContainer = (target: LottieTarget): Element | null => {
  const element = typeof target === 'function' ? target() : unref(target)
  return element instanceof Element ? element : null
}

/**
 * lottie-web 常用能力封装，组件卸载时自动 destroy。
 */
export const useLottie = (
  target: LottieTarget,
  animationData: Record<string, unknown> | null,
  options: UseLottieOptions = {},
): UseLottieReturn => {
  const instance = shallowRef<AnimationItem | null>(null)
  let animationApi: LottieApi | null = null

  /** 按图层名替换图片；canvas 与 svg 渲染器取元素的方式不同 */
  const dynamicReplaceImg = (dynamicList: Record<string, string>) => {
    const current = instance.value
    const api = animationApi
    if (!current || !api) return

    const isCanvas = (current.renderer as { rendererType?: string } | null)?.rendererType === 'canvas'

    Object.entries(dynamicList).forEach(([key, src]) => {
      api
        .getKeyPath(key)
        .getElements()
        .forEach((item) => {
          if (isCanvas) {
            if (item.element.img) item.element.img.src = src
            return
          }
          item.element.innerElem?.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src)
        })
    })
  }

  const destroy = () => {
    animationApi = null
    instance.value?.destroy()
    instance.value = null
  }

  const load = () => {
    destroy()

    const container = resolveContainer(target)
    if (!container) return

    const item = lottie.loadAnimation<RendererType>({
      container,
      animationData,
      path: options.path,
      renderer: options.renderer ?? 'svg',
      loop: options.loop ?? true,
      autoplay: options.autoplay ?? true,
      name: options.name,
    })
    instance.value = item

    item.addEventListener('DOMLoaded', () => {
      animationApi = lottieApi.createAnimationApi(item)
      if (options.dynamic && isObject(options.dynamic)) {
        dynamicReplaceImg(options.dynamic)
      }
      options.onReady?.(item)
    })
  }

  onMounted(load)

  // 仅 path 变化时重新加载，与既有实现保持一致
  watch(
    () => options.path,
    () => load(),
  )

  onBeforeUnmount(destroy)

  const play = () => {
    instance.value?.play()
  }

  const pause = () => {
    instance.value?.pause()
  }

  const stop = () => {
    instance.value?.stop()
  }

  const playSegments = (segments: AnimationSegment | AnimationSegment[], forceFlag = true) => {
    instance.value?.playSegments(segments, forceFlag)
  }

  const playAnimation = (segments: AnimationSegment | AnimationSegment[], forceFlag = true) =>
    new Promise<void>((resolve) => {
      const item = instance.value
      if (!item) {
        resolve()
        return
      }

      // 先挂监听再播放，避免区间很短时错过 complete
      const handleComplete = () => {
        item.removeEventListener('complete', handleComplete)
        resolve()
      }
      item.addEventListener('complete', handleComplete)
      item.playSegments(segments, forceFlag)
    })

  const goToAndStop = (value: number | string, isFrame?: boolean, name?: string) => {
    instance.value?.goToAndStop(value, isFrame, name)
  }

  const goToAndPlay = (value: number | string, isFrame?: boolean, name?: string) => {
    instance.value?.goToAndPlay(value, isFrame, name)
  }

  const getDuration = (inFrames?: boolean) => instance.value?.getDuration(inFrames) ?? 0

  const on = (name: AnimationEventName, callback: () => void) => {
    instance.value?.addEventListener(name, callback)
  }

  const off = (name: AnimationEventName, callback?: () => void) => {
    instance.value?.removeEventListener(name, callback)
  }

  const setLoop = (value: number | boolean) => {
    const item = instance.value
    if (item) item.loop = value
  }

  return {
    instance,
    play,
    pause,
    stop,
    playSegments,
    playAnimation,
    goToAndStop,
    goToAndPlay,
    getDuration,
    on,
    off,
    dynamicReplaceImg,
    setLoop,
    destroy,
  }
}
