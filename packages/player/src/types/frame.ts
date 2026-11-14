/** 画面适配方式：`contain` 完整显示，`cover` 裁切铺满，`fill` 直接拉伸（与 artplayer 的 `object-fit: fill` 对齐） */
export type FrameFit = 'contain' | 'cover' | 'fill'

/** 视频滤镜预设 */
export type VideoFilterPreset = 'none' | 'mono' | 'sepia' | 'vivid' | 'warm' | 'cool' | 'fade' | 'film' | 'invert'

/** 马赛克：块越大越糊 */
export interface MosaicEffect {
  /** 块的边长，单位为工作画布像素 */
  size: number
}

/** 整画面模糊 */
export interface BlurEffect {
  /** 模糊半径（px） */
  radius: number
}

/** 背景模糊：前景保持比例居中，四周用同一帧放大模糊铺满 */
export interface BackgroundBlurEffect {
  /** 背景模糊半径（px） */
  radius: number
  /** 背景放大倍数，避免模糊后边缘透出黑边 */
  overscan: number
}

/** 绿幕抠像 */
export interface ChromaKeyEffect {
  /** 被抠掉的颜色，`#rrggbb` */
  color: string
  /** 相似度 0–1，越大抠得越干净，也越容易误伤主体 */
  similarity: number
  /** 边缘羽化 0–1，越大过渡越柔和 */
  smoothness: number
}

/** 视频滤镜 */
export interface VideoFilterEffect {
  preset: VideoFilterPreset
  /** 强度 0–1 */
  intensity: number
}

/** 横屏转竖屏 */
export interface VerticalEffect {
  fit: FrameFit
  /** 顺时针旋转角度 */
  rotate: 0 | 90
}

/** 防抖：与上一帧做时间域混合，压掉手持抖动带来的高频闪烁 */
export interface StabilizerEffect {
  /** 混合强度 0–1，越大越稳但残影越明显 */
  strength: number
}

/** 帧效果参数映射，插件按 key 写入自己那一份 */
export type FrameEffectMap = {
  mosaic: MosaicEffect
  blur: BlurEffect
  backgroundBlur: BackgroundBlurEffect
  chromaKey: ChromaKeyEffect
  videoFilter: VideoFilterEffect
  vertical: VerticalEffect
  stabilizer: StabilizerEffect
}

/** 帧效果的 key */
export type FrameEffectKey = keyof FrameEffectMap

/** 帧渲染器：需要逐帧处理画面的插件通过它改画面 */
export interface FrameRenderer {
  /** 设置一类效果，传 `null` 关闭 */
  set<K extends FrameEffectKey>(key: K, effect: FrameEffectMap[K] | null): void
  /** 读取已设置的效果 */
  get<K extends FrameEffectKey>(key: K): FrameEffectMap[K] | null
  /**
   * 取某一屏幕坐标上的画面颜色，返回 `#rrggbb`。
   * 画面未就绪或视频源跨域时返回 `null`。
   */
  pickColor: (clientX: number, clientY: number) => string | null
  /** 卸载覆盖层、取消渲染循环 */
  dispose: () => void
}
