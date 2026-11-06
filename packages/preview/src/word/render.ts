/**
 * 把排版后的页面盒模型绘制到 Canvas。
 */

import type { ImageBox, LayoutPage, TextBox, RectBox } from './layout'
import type { TextMetricsProvider } from './font'

export interface PaintOptions {
  pixelRatio: number
  paper: string
  color: string
  metrics: TextMetricsProvider
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

const loadImage = (src: string) => {
  const cached = imageCache.get(src)

  if (cached) return cached

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('[preview] 图片加载失败'))
    image.src = src
  })

  imageCache.set(src, promise)

  return promise
}

const drawText = (ctx: CanvasRenderingContext2D, box: TextBox, options: PaintOptions) => {
  const baseline = box.y + box.fontSize * 0.82

  ctx.fillStyle = box.color ?? options.color
  options.metrics.draw(ctx, box.text, box.x, baseline, {
    fontSize: box.fontSize,
    bold: box.bold,
    italic: box.italic,
  })

  if (!box.underline) return

  ctx.strokeStyle = box.color ?? options.color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(box.x, baseline + 2)
  ctx.lineTo(box.x + box.width, baseline + 2)
  ctx.stroke()
}

const drawRect = (ctx: CanvasRenderingContext2D, box: RectBox) => {
  if (box.fill) {
    ctx.fillStyle = box.fill
    ctx.fillRect(box.x, box.y, box.width, box.height)
  }

  if (box.stroke) {
    ctx.strokeStyle = box.stroke
    ctx.lineWidth = box.lineWidth ?? 1
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, Math.max(0, box.width - 1), Math.max(0, box.height - 1))
  }
}

const drawImage = async (ctx: CanvasRenderingContext2D, box: ImageBox) => {
  try {
    const image = await loadImage(box.src)

    ctx.drawImage(image, box.x, box.y, box.width, box.height)
  } catch (error) {
    console.warn('[preview] Word 图片绘制失败', error)
  }
}

/** 在已设置好坐标系与背景的 ctx 上绘制一页 */
export const paintPage = async (page: LayoutPage, ctx: CanvasRenderingContext2D, options: PaintOptions) => {
  ctx.fillStyle = options.paper
  ctx.fillRect(0, 0, page.width, page.height)

  for (const box of page.boxes) {
    if (box.type === 'text') {
      drawText(ctx, box, options)
    } else if (box.type === 'rect') {
      drawRect(ctx, box)
    } else {
      await drawImage(ctx, box)
    }
  }
}

/** 渲染到指定 canvas，按设备像素比缩放 */
export const renderPageToCanvas = async (page: LayoutPage, canvas: HTMLCanvasElement, options: PaintOptions) => {
  const ratio = Math.max(1, Math.min(options.pixelRatio, 2))

  canvas.width = Math.floor(page.width * ratio)
  canvas.height = Math.floor(page.height * ratio)
  canvas.style.width = `${page.width}px`
  canvas.style.height = `${page.height}px`

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  await paintPage(page, ctx, options)
}

/** 生成缩略图，按目标宽度等比绘制 */
export const renderThumbnail = async (
  page: LayoutPage,
  canvas: HTMLCanvasElement,
  options: PaintOptions,
  targetWidth: number,
) => {
  const scale = targetWidth / page.width

  canvas.width = Math.floor(page.width * scale)
  canvas.height = Math.floor(page.height * scale)

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  await paintPage(page, ctx, options)
}
