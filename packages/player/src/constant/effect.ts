import type { VideoFilterPreset } from '../types/frame'
import type { VerticalMode } from '../types/plugin'

/** 各插件在右侧菜单里的名称 */
export const webFullscreenLabel = '网页全屏'
export const mosaicLabel = '马赛克'
export const stabilizerLabel = '防抖'
export const blurLabel = '模糊'
export const reverseLabel = '倒放'
export const backgroundBlurLabel = '背景模糊'
export const introLabel = '开场动画'
export const overlayLabel = '视频叠加'
export const chromaKeyLabel = '绿幕'
export const videoFilterLabel = '视频滤镜'
export const verticalLabel = '横屏转竖屏'

/** 帧渲染的工作画布长边上限，避免 4K 素材把帧率拖垮 */
export const frameMaxSide = 1280
/** 绿幕要逐像素处理，工作画布再降一档 */
export const chromaKeyMaxSide = 960
/** 覆盖层的最大像素比，高分屏上不再按真实 dpr 放大 */
export const frameMaxPixelRatio = 2

/** 网页全屏插件的默认状态 */
export const defaultWebFullscreen = false

/** 马赛克插件的默认取值与区间 */
export const defaultMosaicSize = 16
export const mosaicMin = 2
export const mosaicMax = 64
export const mosaicStep = 1

/** 防抖插件的默认取值与区间 */
export const defaultStabilizerStrength = 0.35
export const stabilizerMin = 0
export const stabilizerMax = 0.9
export const stabilizerStep = 0.05

/** 模糊插件的默认取值与区间 */
export const defaultBlurRadius = 6
export const blurMin = 0
export const blurMax = 30
export const blurStep = 1

/** 背景模糊插件的默认取值与区间 */
export const defaultBackgroundBlurRadius = 16
export const backgroundBlurMin = 0
export const backgroundBlurMax = 40
export const backgroundBlurStep = 1
/** 背景放大倍数，模糊后边缘不会露出黑边 */
export const backgroundBlurOverscan = 1.15

/** 倒放插件的默认速率 */
export const defaultReverseRate = 1

/** 开场动画插件的默认配置 */
export const defaultIntroText = 'wapri'
export const defaultIntroDuration = 1600
export const defaultIntroDelay = 0

/** 视频叠加插件的默认配置，位置与宽度都按容器百分比 */
export const defaultOverlayX = 68
export const defaultOverlayY = 68
export const defaultOverlayWidth = 24
export const defaultOverlayOpacity = 1
export const overlayMinWidth = 6
export const overlayMaxWidth = 80

/** 绿幕插件的默认配置 */
export const defaultChromaColor = '#00ff00'
export const defaultChromaSimilarity = 0.35
export const defaultChromaSmoothness = 0.12
export const chromaSimilarityMin = 0
export const chromaSimilarityMax = 1
export const chromaSmoothnessMin = 0
export const chromaSmoothnessMax = 0.6

/** 视频滤镜插件的默认配置 */
export const defaultVideoFilterPreset: VideoFilterPreset = 'none'
export const defaultVideoFilterIntensity = 1
export const videoFilterIntensityMin = 0
export const videoFilterIntensityMax = 1
export const videoFilterIntensityStep = 0.05

/** 横屏转竖屏：目标容器比例与默认适配方式 */
export const verticalRatio = '9:16'
export const defaultVerticalMode: VerticalMode = 'crop'

/** 各插件菜单项的补充文案 */
export const mosaicSizeText = '块大小'
export const stabilizerStrengthText = '稳像强度'
export const blurRadiusText = '模糊程度'
export const backgroundBlurRadiusText = '背景模糊'
export const reverseRateText = '倒放速率'
export const chromaPickText = '吸取背景色'
export const chromaPickTip = '点击画面取色'
export const chromaSimilarityText = '相似度'
export const chromaSmoothnessText = '边缘羽化'
export const chromaPickFailedText = '取色失败，视频源需开启跨域（CORS）'
export const videoFilterIntensityText = '强度'
export const verticalModeText = '适配方式'
export const verticalModeCropText = '裁切铺满'
export const verticalModeContainText = '完整显示'
export const verticalModeRotateText = '旋转 90°'
export const introReplayText = '重播开场'
export const overlayOpacityText = '透明度'
export const overlayWidthText = '大小'
export const overlayResetText = '重置位置'
export const overlayEmptyText = '未配置叠加素材'

/** 覆盖层类名，统一带包前缀 */
export const introClassName = 'wa-player-intro'
export const introTextClassName = 'wa-player-intro__text'
export const introImageClassName = 'wa-player-intro__image'
export const overlayClassName = 'wa-player-overlay'
export const frameClassName = 'wa-player-frame'

/** 覆盖层样式表的标记属性，注入一次后复用 */
export const styleElementFlag = 'data-wa-player-style'

/** 覆盖层的 CSS，插件首次使用时注入 */
export const overlayStyleSheet = `
.${frameClassName} {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}
.${introClassName} {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #000;
  opacity: 1;
  transition: opacity 400ms ease;
  pointer-events: none;
  z-index: 40;
}
.${introClassName}--out {
  opacity: 0;
}
.${introImageClassName} {
  max-width: 40%;
  max-height: 40%;
  object-fit: contain;
  animation: wa-player-intro-pop 600ms ease both;
}
.${introTextClassName} {
  color: #fff;
  font-size: 20px;
  letter-spacing: 2px;
  animation: wa-player-intro-pop 600ms ease both;
}
.${overlayClassName} {
  position: absolute;
  z-index: 30;
  transform: translate(-50%, -50%);
  touch-action: none;
  user-select: none;
}
.${overlayClassName}--draggable {
  cursor: move;
}
.${overlayClassName} img,
.${overlayClassName} video {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}
@keyframes wa-player-intro-pop {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`
