import type { VideoFilterPreset } from '../types/frame'

/** 保留两位小数，避免插值后出现 1.2000000000000002 这种值 */
const toFixed = (value: number) => Number(value.toFixed(2))

/** 预设滤镜的 CSS 片段，`intensity` 为 0–1 的强度 */
export type VideoFilterRenderer = (intensity: number) => string

/**
 * 视频滤镜预设。
 * 参数按强度线性缩放，强度为 0 时退化成 `none`。
 */
export const videoFilterPresets: Record<VideoFilterPreset, VideoFilterRenderer> = {
  none: () => '',
  mono: (intensity) => `grayscale(${toFixed(intensity)})`,
  sepia: (intensity) =>
    `sepia(${toFixed(intensity * 0.75)}) saturate(${toFixed(1 + intensity * 0.3)}) contrast(${toFixed(
      1 + intensity * 0.05,
    )})`,
  vivid: (intensity) => `saturate(${toFixed(1 + intensity * 0.8)}) contrast(${toFixed(1 + intensity * 0.15)})`,
  warm: (intensity) =>
    `sepia(${toFixed(intensity * 0.35)}) saturate(${toFixed(1 + intensity * 0.25)}) hue-rotate(${-Math.round(
      intensity * 8,
    )}deg)`,
  cool: (intensity) => `hue-rotate(${Math.round(intensity * 18)}deg) saturate(${toFixed(1 + intensity * 0.15)})`,
  fade: (intensity) =>
    `contrast(${toFixed(1 - intensity * 0.25)}) brightness(${toFixed(1 + intensity * 0.12)}) saturate(${toFixed(
      1 - intensity * 0.4,
    )})`,
  film: (intensity) =>
    `sepia(${toFixed(intensity * 0.3)}) contrast(${toFixed(1 + intensity * 0.2)}) brightness(${toFixed(
      1 - intensity * 0.06,
    )}) saturate(${toFixed(1 - intensity * 0.1)})`,
  invert: (intensity) => `invert(${toFixed(intensity)})`,
}

/** 预设的菜单文案 */
export const videoFilterPresetLabels: Record<VideoFilterPreset, string> = {
  none: '原图',
  mono: '黑白',
  sepia: '复古',
  vivid: '鲜艳',
  warm: '暖色',
  cool: '冷色',
  fade: '褪色',
  film: '胶片',
  invert: '反色',
}

/** 菜单里可选的预设顺序 */
export const videoFilterPresetOrder: VideoFilterPreset[] = [
  'none',
  'mono',
  'sepia',
  'vivid',
  'warm',
  'cool',
  'fade',
  'film',
  'invert',
]

/** 生成预设对应的 filter 片段，强度为 0 时返回空串 */
export const renderVideoFilter = (preset: VideoFilterPreset, intensity: number) =>
  intensity <= 0 ? '' : videoFilterPresets[preset](intensity)
