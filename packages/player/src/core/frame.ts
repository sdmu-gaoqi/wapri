import type Artplayer from 'artplayer'
import { chromaKeyMaxSide, frameClassName, frameMaxPixelRatio, frameMaxSide, renderVideoFilter } from '../constant'
import { ensureOverlayStyle } from './style'
import type { ChromaKeyEffect, FrameEffectKey, FrameEffectMap, FrameFit, FrameRenderer } from '../types/frame'

/** 已写入的效果参数，插件不启用时对应 key 不存在 */
type EffectStore = Partial<{ [K in FrameEffectKey]: FrameEffectMap[K] }>

/** 一块离屏画布 */
interface Surface {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

/** 适配绘制参数 */
interface DrawOptions {
  fit: FrameFit
  /** 顺时针旋转角度 */
  rotate: number
  /** 放大倍数，用于背景模糊时盖住模糊边缘 */
  overscan?: number
}

const emptyRenderer: FrameRenderer = {
  set: () => undefined,
  get: () => null,
  pickColor: () => null,
  dispose: () => undefined,
}

/** 单测与 SSR 环境没有 DOM，渲染器整体降级为空实现 */
const isSupported = () => typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'

const createSurface = (width: number, height: number): Surface | null => {
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))

  // 绿幕与取色都要读像素，提前声明可以避免浏览器把画布放到 GPU 侧
  const context = canvas.getContext('2d', { willReadFrequently: true })

  return context ? { canvas, context } : null
}

const resizeSurface = (surface: Surface, width: number, height: number) => {
  const nextWidth = Math.max(1, Math.round(width))
  const nextHeight = Math.max(1, Math.round(height))

  if (surface.canvas.width === nextWidth && surface.canvas.height === nextHeight) return

  surface.canvas.width = nextWidth
  surface.canvas.height = nextHeight
}

/** 把 `#rgb` / `#rrggbb` 解析成三通道 */
const parseColor = (value: string) => {
  const hex = value.trim().replace('#', '')
  const normalized = hex.length === 3 ? [...hex].map((item) => `${item}${item}`).join('') : hex

  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null

  const int = Number.parseInt(normalized, 16)

  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((item) =>
      Math.max(0, Math.min(255, Math.round(item)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

/**
 * 把源帧按 `fit` 画到目标画布。
 * 旋转 90° 时宽高互换后再算缩放，保证旋转后的画面仍然铺满或完整显示。
 */
const drawFitted = (
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
  options: DrawOptions,
) => {
  const sourceWidth = source.width
  const sourceHeight = source.height
  const rotated = options.rotate === 90

  context.save()
  context.translate(width / 2, height / 2)

  if (rotated) context.rotate(Math.PI / 2)

  if (options.fit === 'fill' && !rotated && !options.overscan) {
    // 与 video 的 `object-fit: fill` 保持一致，直接铺满
    context.drawImage(source, -width / 2, -height / 2, width, height)
    context.restore()

    return
  }

  const effectiveWidth = rotated ? sourceHeight : sourceWidth
  const effectiveHeight = rotated ? sourceWidth : sourceHeight
  const base =
    options.fit === 'cover'
      ? Math.max(width / effectiveWidth, height / effectiveHeight)
      : Math.min(width / effectiveWidth, height / effectiveHeight)
  const scale = base * (options.overscan ?? 1)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale

  context.drawImage(source, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  context.restore()
}

/**
 * 帧渲染器：一个实例对应一个播放器，多个插件通过 `set()` 往里写自己的参数。
 * 没有任何参数时不会创建 canvas，也不会启动循环。
 */
export const createFrameRenderer = (art: Artplayer): FrameRenderer => {
  if (!isSupported()) return emptyRenderer

  const effects: EffectStore = {}
  const store = effects as Partial<Record<FrameEffectKey, unknown>>

  let overlay: HTMLCanvasElement | undefined
  let output: CanvasRenderingContext2D | null = null
  let work: Surface | null = null
  let scratch: Surface | null = null
  let composite: Surface | null = null
  let previous: Surface | null = null
  let sample: Surface | null = null

  let rafId = 0
  let disposed = false
  let lastTime = -1

  const ensureOverlay = () => {
    if (overlay) return

    ensureOverlayStyle()

    const node = document.createElement('canvas')

    node.className = frameClassName

    output = node.getContext('2d')
    // 插到播放器容器里，控制条与设置面板的层级都在它上面
    art.template.$player.appendChild(node)
    overlay = node
  }

  const syncOutputSize = () => {
    const ratio = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, frameMaxPixelRatio)
    const width = Math.max(1, Math.round(art.video.clientWidth * ratio))
    const height = Math.max(1, Math.round(art.video.clientHeight * ratio))

    if (!overlay) return { width, height }

    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width
      overlay.height = height
    }

    return { width, height }
  }

  /** 工作画布：长边压到上限，绿幕开启时再压一档 */
  const ensureWork = (sourceWidth: number, sourceHeight: number) => {
    const limit = effects.chromaKey ? chromaKeyMaxSide : frameMaxSide
    const ratio = Math.min(1, limit / Math.max(sourceWidth, sourceHeight))
    const width = Math.round(sourceWidth * ratio)
    const height = Math.round(sourceHeight * ratio)

    if (!work) work = createSurface(width, height)
    else resizeSurface(work, width, height)

    return work
  }

  const applyChromaKey = (surface: Surface, chroma: ChromaKeyEffect) => {
    const target = parseColor(chroma.color)

    if (!target) return

    const { width, height } = surface.canvas
    let image: ImageData

    try {
      image = surface.context.getImageData(0, 0, width, height)
    } catch {
      // 视频源跨域，画布被污染，抠像降级为不处理
      return
    }

    const data = image.data
    const maxDistance = Math.sqrt(3) * 255
    const threshold = Math.min(1, Math.max(0, chroma.similarity)) * maxDistance
    const feather = Math.max(1, Math.min(1, Math.max(0, chroma.smoothness)) * maxDistance)

    for (let index = 0; index < data.length; index += 4) {
      const dr = data[index] - target.r
      const dg = data[index + 1] - target.g
      const db = data[index + 2] - target.b
      const distance = Math.sqrt(dr * dr + dg * dg + db * db)

      if (distance <= threshold) {
        data[index + 3] = 0
      } else if (distance < threshold + feather) {
        data[index + 3] = Math.round(((distance - threshold) / feather) * 255)
      }
    }

    surface.context.putImageData(image, 0, 0)
  }

  const applyMosaic = (surface: Surface, size: number) => {
    const block = Math.max(2, Math.round(size))
    const { width, height } = surface.canvas
    const cols = Math.max(1, Math.floor(width / block))
    const rows = Math.max(1, Math.floor(height / block))

    if (!scratch) scratch = createSurface(cols, rows)
    else resizeSurface(scratch, cols, rows)

    if (!scratch) return

    scratch.context.imageSmoothingEnabled = false
    scratch.context.clearRect(0, 0, cols, rows)
    scratch.context.drawImage(surface.canvas, 0, 0, cols, rows)

    surface.context.imageSmoothingEnabled = false
    surface.context.clearRect(0, 0, width, height)
    surface.context.drawImage(scratch.canvas, 0, 0, cols, rows, 0, 0, width, height)
    surface.context.imageSmoothingEnabled = true
  }

  /** 合成最终滤镜：画面调节插件的 inline filter + 模糊 + 预设滤镜 */
  const buildFilter = () => {
    const fragments: string[] = []
    const base = art.video.style.filter

    if (base) fragments.push(base)
    if (effects.blur && effects.blur.radius > 0) fragments.push(`blur(${effects.blur.radius}px)`)

    if (effects.videoFilter) {
      const fragment = renderVideoFilter(effects.videoFilter.preset, effects.videoFilter.intensity)

      if (fragment) fragments.push(fragment)
    }

    return fragments.join(' ')
  }

  /** 当前画面适配方式：竖屏插件优先，其次背景模糊要留出四周，最后跟随 video 的 object-fit */
  const resolveFit = (): FrameFit => {
    const vertical = effects.vertical

    if (vertical) return vertical.fit
    // 背景模糊要露出四周，前景不能铺满
    if (effects.backgroundBlur) return 'contain'

    const inline = art.video.style.objectFit

    return inline === 'contain' || inline === 'cover' ? inline : 'fill'
  }

  const render = () => {
    if (!overlay || !output) return

    const video = art.video

    if (!video.videoWidth || !video.videoHeight) return

    const source = ensureWork(video.videoWidth, video.videoHeight)

    if (!source) return

    const { width: sourceWidth, height: sourceHeight } = source.canvas

    source.context.clearRect(0, 0, sourceWidth, sourceHeight)
    source.context.drawImage(video, 0, 0, sourceWidth, sourceHeight)

    if (effects.chromaKey) applyChromaKey(source, effects.chromaKey)
    if (effects.mosaic) applyMosaic(source, effects.mosaic.size)

    const { width, height } = syncOutputSize()

    if (!composite) composite = createSurface(width, height)
    else resizeSurface(composite, width, height)

    if (!composite) return

    const vertical = effects.vertical
    const fit: FrameFit = resolveFit()
    const rotate = vertical?.rotate ?? 0
    const filter = buildFilter()
    const background = effects.backgroundBlur

    composite.context.clearRect(0, 0, width, height)

    if (background && background.radius > 0) {
      composite.context.save()
      // 背景也吃同一套滤镜，避免前景与四周色差
      composite.context.filter = [`blur(${background.radius}px)`, filter].filter(Boolean).join(' ')
      drawFitted(composite.context, source.canvas, width, height, {
        fit: 'cover',
        rotate: 0,
        overscan: background.overscan,
      })
      composite.context.restore()
    }

    composite.context.save()

    if (filter) composite.context.filter = filter

    drawFitted(composite.context, source.canvas, width, height, { fit, rotate })
    composite.context.restore()

    output.clearRect(0, 0, width, height)
    output.drawImage(composite.canvas, 0, 0)

    const stabilizer = effects.stabilizer

    if (stabilizer && stabilizer.strength > 0 && composite) {
      if (!previous) previous = createSurface(width, height)
      else resizeSurface(previous, width, height)

      if (previous) {
        // 先画当前帧，再把上一帧按强度叠上去，结果是 `cur * (1 - s) + prev * s`
        output.globalAlpha = Math.min(0.9, Math.max(0, stabilizer.strength))
        output.drawImage(previous.canvas, 0, 0, width, height)
        output.globalAlpha = 1

        previous.context.clearRect(0, 0, width, height)
        previous.context.drawImage(composite.canvas, 0, 0)
      }
    }
  }

  const isActive = () => Object.values(effects).some(Boolean)

  const loop = () => {
    if (disposed) return

    rafId = requestAnimationFrame(loop)

    const video = art.video

    if (!overlay) return

    const ready = video.readyState >= 2 && video.videoWidth > 0

    overlay.style.visibility = ready ? 'visible' : 'hidden'

    if (!ready) return

    // 暂停且进度没变时不必重绘
    if (!art.playing && video.currentTime === lastTime) return

    lastTime = video.currentTime
    render()
  }

  const start = () => {
    ensureOverlay()

    if (overlay) overlay.style.visibility = 'hidden'

    lastTime = -1

    if (!rafId) rafId = requestAnimationFrame(loop)
  }

  const stop = () => {
    if (rafId) cancelAnimationFrame(rafId)

    rafId = 0
    lastTime = -1

    if (overlay) overlay.style.visibility = 'hidden'
  }

  const set = <K extends FrameEffectKey>(key: K, effect: FrameEffectMap[K] | null) => {
    if (disposed) return

    if (effect) store[key] = effect
    else delete store[key]

    if (isActive()) start()
    else stop()
  }

  const get = <K extends FrameEffectKey>(key: K) => effects[key] ?? null

  const pickColor = (clientX: number, clientY: number) => {
    const video = art.video

    if (!video.videoWidth || !video.videoHeight) return null

    const rect = video.getBoundingClientRect()

    if (!rect.width || !rect.height) return null

    const fit = resolveFit()
    const rotated = (effects.vertical?.rotate ?? 0) === 90
    const localX = clientX - rect.left - rect.width / 2
    const localY = clientY - rect.top - rect.height / 2

    let sourceX: number
    let sourceY: number

    if (fit === 'fill' && !rotated) {
      sourceX = (clientX - rect.left) / (rect.width / video.videoWidth)
      sourceY = (clientY - rect.top) / (rect.height / video.videoHeight)
    } else {
      const effectiveWidth = rotated ? video.videoHeight : video.videoWidth
      const effectiveHeight = rotated ? video.videoWidth : video.videoHeight
      const scale =
        fit === 'cover'
          ? Math.max(rect.width / effectiveWidth, rect.height / effectiveHeight)
          : Math.min(rect.width / effectiveWidth, rect.height / effectiveHeight)

      sourceX = (rotated ? localY : localX) / scale + video.videoWidth / 2
      sourceY = (rotated ? -localX : localY) / scale + video.videoHeight / 2
    }

    if (sourceX < 0 || sourceY < 0 || sourceX >= video.videoWidth || sourceY >= video.videoHeight) return null

    const ratio = Math.min(1, chromaKeyMaxSide / Math.max(video.videoWidth, video.videoHeight))
    const width = Math.max(1, Math.round(video.videoWidth * ratio))
    const height = Math.max(1, Math.round(video.videoHeight * ratio))

    if (!sample) sample = createSurface(width, height)
    else resizeSurface(sample, width, height)

    if (!sample) return null

    try {
      sample.context.drawImage(video, 0, 0, width, height)

      const pixel = sample.context.getImageData(Math.floor(sourceX * ratio), Math.floor(sourceY * ratio), 1, 1).data

      return toHex(pixel[0], pixel[1], pixel[2])
    } catch {
      return null
    }
  }

  const dispose = () => {
    disposed = true

    stop()

    overlay?.remove()
    overlay = undefined
    output = null
    work = null
    scratch = null
    composite = null
    previous = null
    sample = null
  }

  return { set, get, pickColor, dispose }
}
