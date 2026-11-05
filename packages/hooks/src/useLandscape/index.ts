import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

const isClient = typeof window !== 'undefined'

export interface UseLandscapeOptions {
  /** 横屏时自动展示遮罩层阻止横屏浏览,竖屏后自动消失,默认 false */
  lock?: boolean
  /** 遮罩层的提示文案,默认 '请旋转您的屏幕,切换至竖屏模式' */
  tip?: string
  /** 遮罩层的层级,默认 9999 */
  zIndex?: number | string
}

const DEFAULT_TIP = '请旋转您的屏幕,切换至竖屏模式'
const DEFAULT_Z_INDEX = 9999

const checkIsLandscape = (): boolean => {
  return window.innerWidth > window.innerHeight
}

export const useLandscape = (options: UseLandscapeOptions = {}): Ref<boolean> => {
  const { lock = false, tip = DEFAULT_TIP, zIndex = DEFAULT_Z_INDEX } = options

  const isLandscape = ref(isClient ? checkIsLandscape() : false)

  let mask: HTMLDivElement | null = null

  const removeMask = (): void => {
    if (!mask) return
    mask.remove()
    mask = null
  }

  const createMask = (): void => {
    if (mask) return
    const maskNode = document.createElement('div')
    maskNode.style.cssText = [
      'position: fixed',
      'top: 0',
      'right: 0',
      'bottom: 0',
      'left: 0',
      `z-index: ${zIndex}`,
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'background: #fff',
      'touch-action: none',
    ].join(';')
    const text = document.createElement('p')
    text.style.cssText = [
      'margin: 0',
      'padding: 0 32px',
      'font-size: 16px',
      'line-height: 1.6',
      'color: #333',
      'text-align: center',
    ].join(';')
    text.textContent = tip
    maskNode.appendChild(text)
    document.body.appendChild(maskNode)
    mask = maskNode
  }

  const update = (): void => {
    isLandscape.value = checkIsLandscape()
    if (!lock) return
    if (isLandscape.value) {
      createMask()
    } else {
      removeMask()
    }
  }

  onMounted(() => {
    if (!isClient) return
    update()
    window.addEventListener('orientationchange', update)
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    if (!isClient) return
    window.removeEventListener('orientationchange', update)
    window.removeEventListener('resize', update)
    removeMask()
  })

  return isLandscape
}
