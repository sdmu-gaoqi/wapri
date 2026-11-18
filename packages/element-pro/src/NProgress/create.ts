import { defaultPrefix, nprogressDefaults, nprogressMaxReachable, nprogressTrickleSteps } from '../constant'
import type { NProgressInstance, NProgressOptions, NProgressSettings } from './types'

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

/** 进度越高步长越小，超过 0.99 后不再自动递增。 */
const trickleAmount = (value: number): number => {
  const step = nprogressTrickleSteps.find((item) => value < item.until)
  return step ? step.amount : 0
}

/** 合并默认值，避免把 `undefined` 写进配置。 */
const resolveSettings = (options: NProgressOptions): NProgressSettings => ({
  minimum: options.minimum ?? nprogressDefaults.minimum,
  maximum: options.maximum ?? nprogressDefaults.maximum,
  trickle: options.trickle ?? nprogressDefaults.trickle,
  trickleSpeed: options.trickleSpeed ?? nprogressDefaults.trickleSpeed,
  showSpinner: options.showSpinner ?? nprogressDefaults.showSpinner,
  speed: options.speed ?? nprogressDefaults.speed,
  easing: options.easing ?? nprogressDefaults.easing,
  parent: options.parent ?? nprogressDefaults.parent,
  zIndex: options.zIndex ?? nprogressDefaults.zIndex,
  color: options.color ?? nprogressDefaults.color,
})

const busyClass = `${defaultPrefix}-nprogress-busy`

/**
 * 创建一个独立的顶部进度条实例。
 * 默认导出 `NProgress` 是模块级单例，需要「全局 + 局部」并存时用本方法各建一个。
 */
export const createNProgress = (options: NProgressOptions = {}): NProgressInstance => {
  let settings = resolveSettings(options)
  /** 只记调用方显式传过的配置，没传的仍由 CSS 变量里的默认值兜底。 */
  let explicit: NProgressOptions = { ...options }
  let status: number | null = null
  let root: HTMLDivElement | null = null
  let bar: HTMLDivElement | null = null
  let spinner: HTMLDivElement | null = null
  let trickleTimer: ReturnType<typeof setTimeout> | null = null
  let fadeTimer: ReturnType<typeof setTimeout> | null = null
  let removeTimer: ReturnType<typeof setTimeout> | null = null
  /** 是否挂在业务容器里（决定用绝对定位还是固定定位）。 */
  let scoped = false

  const isStarted = (): boolean => status !== null

  const resolveParent = (): HTMLElement | null => {
    if (typeof document === 'undefined') return null
    const { parent } = settings
    if (!parent) return document.body
    if (typeof parent === 'string') return document.querySelector<HTMLElement>(parent) ?? document.body
    return parent
  }

  const applySettings = (): void => {
    if (!root) return
    if (explicit.speed !== undefined) root.style.setProperty('--wa-ui-nprogress-speed', `${settings.speed}ms`)
    if (explicit.easing !== undefined) root.style.setProperty('--wa-ui-nprogress-easing', settings.easing)
    if (explicit.zIndex !== undefined) root.style.setProperty('--wa-ui-nprogress-z-index', String(settings.zIndex))
    if (settings.color) {
      root.style.setProperty('--wa-ui-nprogress-color', settings.color)
    } else {
      root.style.removeProperty('--wa-ui-nprogress-color')
    }
    if (spinner) spinner.style.display = settings.showSpinner ? '' : 'none'
    root.setAttribute('aria-valuemax', String(settings.maximum))
    root.classList.toggle(`${defaultPrefix}-nprogress--scoped`, scoped)
  }

  const createRoot = (): HTMLDivElement | null => {
    if (typeof document === 'undefined') return null
    const parent = resolveParent()
    if (!parent) return null
    scoped = parent !== document.body

    const nextRoot = document.createElement('div')
    nextRoot.className = `${defaultPrefix}-nprogress`
    nextRoot.setAttribute('role', 'progressbar')
    nextRoot.setAttribute('aria-valuemin', '0')
    nextRoot.setAttribute('aria-valuemax', String(settings.maximum))
    nextRoot.style.opacity = '0'

    const nextBar = document.createElement('div')
    nextBar.className = `${defaultPrefix}-nprogress__bar`
    const peg = document.createElement('div')
    peg.className = `${defaultPrefix}-nprogress__peg`
    nextBar.appendChild(peg)

    const nextSpinner = document.createElement('div')
    nextSpinner.className = `${defaultPrefix}-nprogress__spinner`
    const spinnerIcon = document.createElement('div')
    spinnerIcon.className = `${defaultPrefix}-nprogress__spinner-icon`
    nextSpinner.appendChild(spinnerIcon)

    nextRoot.appendChild(nextBar)
    nextRoot.appendChild(nextSpinner)

    root = nextRoot
    bar = nextBar
    spinner = nextSpinner
    applySettings()
    parent.appendChild(nextRoot)
    // 读一次布局，让 0 → minimum 的位移有过渡，而不是直接跳过去
    void nextRoot.offsetWidth
    return nextRoot
  }

  const mount = (): HTMLDivElement | null => {
    if (root?.parentNode) return root
    return createRoot()
  }

  const paint = (value: number): void => {
    // 收一下浮点误差，避免出现 -91.99999999999999% 这种位移
    const offset = Math.round((value - 1) * 10000) / 100
    if (bar) bar.style.transform = `translate3d(${offset}%, 0, 0)`
    if (root) root.setAttribute('aria-valuenow', String(value))
  }

  const show = (): void => {
    if (!root) return
    root.style.opacity = '1'
    if (typeof document !== 'undefined') document.documentElement.classList.add(busyClass)
  }

  const stopBusy = (): void => {
    if (typeof document !== 'undefined') document.documentElement.classList.remove(busyClass)
  }

  const stopTrickle = (): void => {
    if (!trickleTimer) return
    clearTimeout(trickleTimer)
    trickleTimer = null
  }

  const cancelFinish = (): void => {
    if (fadeTimer) {
      clearTimeout(fadeTimer)
      fadeTimer = null
    }
    if (removeTimer) {
      clearTimeout(removeTimer)
      removeTimer = null
    }
  }

  const unmount = (): void => {
    if (root?.parentNode) root.parentNode.removeChild(root)
    root = null
    bar = null
    spinner = null
    stopBusy()
  }

  const scheduleTrickle = (): void => {
    stopTrickle()
    if (!settings.trickle) return
    trickleTimer = setTimeout(() => {
      trickleTimer = null
      inc()
    }, settings.trickleSpeed)
  }

  /** 先让进度走满，再淡出，最后移除节点；两步都用 `speed` 作为时长。 */
  const finish = (): void => {
    stopTrickle()
    cancelFinish()
    stopBusy()
    fadeTimer = setTimeout(() => {
      fadeTimer = null
      if (root) root.style.opacity = '0'
      removeTimer = setTimeout(() => {
        removeTimer = null
        unmount()
      }, settings.speed)
    }, settings.speed)
  }

  const start = (): NProgressInstance => {
    if (!mount()) return api
    cancelFinish()
    if (status === null) {
      status = settings.minimum
      paint(status)
    }
    show()
    scheduleTrickle()
    return api
  }

  const set = (value: number): NProgressInstance => {
    if (!mount()) return api
    cancelFinish()
    const next = clamp(value, 0, settings.maximum)
    if (next >= settings.maximum) {
      status = null
      paint(settings.maximum)
      finish()
      return api
    }
    status = Math.max(next, settings.minimum)
    paint(status)
    show()
    scheduleTrickle()
    return api
  }

  const inc = (amount?: number): NProgressInstance => {
    if (!isStarted()) return start()
    const current = status ?? settings.minimum
    const step = amount ?? trickleAmount(current)
    return set(Math.min(current + step, nprogressMaxReachable))
  }

  const done = (force = false): NProgressInstance => {
    if (!force && !isStarted()) return api
    if (!mount()) return api
    status = null
    paint(settings.maximum)
    finish()
    return api
  }

  const configure = (next: NProgressOptions): NProgressInstance => {
    const previousParent = settings.parent
    explicit = { ...explicit, ...next }
    settings = resolveSettings({ ...settings, ...next })
    if (settings.parent !== previousParent && root) {
      const parent = resolveParent()
      if (parent) {
        parent.appendChild(root)
        scoped = parent !== document.body
      }
    }
    applySettings()
    if (!settings.trickle) stopTrickle()
    else if (isStarted()) scheduleTrickle()
    return api
  }

  const remove = (): NProgressInstance => {
    status = null
    stopTrickle()
    cancelFinish()
    unmount()
    return api
  }

  const api: NProgressInstance = {
    get status() {
      return status
    },
    get settings() {
      return { ...settings }
    },
    start,
    done,
    inc,
    set,
    trickle: inc,
    configure,
    isStarted,
    remove,
  }

  return api
}
