/**
 * 图片处理相关类型（火山引擎 TOS）。
 */

/** 处理后的目标格式 */
export type TosImageFormat =
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'awebp'
  | 'avif'
  | 'avis'
  | 'heic'
  | 'heif'
  | 'gif'
  | 'bmp'
  | 'tiff'

/**
 * 缩放模式。
 *
 * - `lfit`（默认）等比缩放，限制在 `width × height` 的矩形内
 * - `mfit` 等比缩放，取延伸出矩形框外的最小图
 * - `fill` 等比缩放后居中裁剪超出部分
 * - `pad` 缩放到矩形内最大图后用底色填充空白
 * - `fixed` 强制固定宽高，不保持比例
 */
export type TosImageResizeMode = 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed'

/**
 * 质量类型。
 *
 * - `absolute`（默认）对应 `Q`，直接压到指定质量，jpg / webp / heic 等生效
 * - `relative` 对应 `q`，按原图质量的百分比压缩，只对 jpg / pjpeg 生效
 */
export type TosImageQualityType = 'absolute' | 'relative'

/** 图片处理参数 */
export interface TosImageProcessOptions {
  /** 目标宽度（px），取值范围 1 - 16384 */
  width?: number
  /** 目标高度（px），取值范围 1 - 16384 */
  height?: number
  /** 目标长边（px），宽高均未指定时生效，等比缩到长边不超过该值 */
  longEdge?: number
  /** 目标短边（px），宽高均未指定时生效 */
  shortEdge?: number
  /**
   * 缩放模式，默认 `lfit`。
   *
   * 只给一边时服务端按原图比例推算另一边；`fill` / `pad` 会以该边长构造正方形框。
   */
  resizeMode?: TosImageResizeMode
  /** 质量，取值范围 1 - 100；png / gif / bmp / tiff 不生效 */
  quality?: number
  /** 质量类型，默认 `absolute` */
  qualityType?: TosImageQualityType
  /** 目标格式，`webp` / `avif` 最常用于压体积 */
  format?: TosImageFormat
  /** 是否按 Exif 方向自动旋转，默认 `false` */
  autoOrient?: boolean
}
