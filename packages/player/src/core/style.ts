import { overlayStyleSheet, styleElementFlag } from '../constant'

/**
 * 注入覆盖层样式表。
 * 开场动画与视频叠加都要用到，注入一次后复用，避免每个实例加一份。
 */
export const ensureOverlayStyle = () => {
  if (typeof document === 'undefined') return

  if (document.head.querySelector(`style[${styleElementFlag}]`)) return

  const style = document.createElement('style')

  style.setAttribute(styleElementFlag, '')
  style.textContent = overlayStyleSheet
  document.head.appendChild(style)
}
