/**
 * 文本度量与绘制：优先用 opentype.js 读取内嵌字体做精确测量，缺失时回退 Canvas measureText。
 */

import { parse as parseFont } from 'opentype.js'
import type { Font } from 'opentype.js'

export interface FontStyle {
  fontSize: number
  bold?: boolean
  italic?: boolean
}

export interface TextMetricsProvider {
  /** 文本宽度，px */
  measure(text: string, style: FontStyle): number
  /** 绘制文本，(x, y) 为基线起点 */
  draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, style: FontStyle): void
  /** 字体是否来自内嵌字体 */
  readonly hasEmbeddedFont: boolean
}

const isBoldFont = (font: Font) => {
  const name = font.names.fontSubfamily?.en ?? font.names.fullName?.en ?? ''

  return /bold|heavy|black|semibold/i.test(name)
}

const toFontString = (style: FontStyle, family: string) =>
  `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${style.fontSize}px ${family}`

/** 用 Canvas 测量，作为没有内嵌字体时的兜底 */
const createCanvasMetrics = (family: string): TextMetricsProvider => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  return {
    hasEmbeddedFont: false,
    measure(text, style) {
      if (!context) return text.length * style.fontSize * 0.6

      context.font = toFontString(style, family)

      return context.measureText(text).width
    },
    draw(ctx, text, x, y, style) {
      ctx.font = toFontString(style, family)
      ctx.fillText(text, x, y)
    },
  }
}

/**
 * 加载内嵌字体；解析失败的字体直接忽略，整体回退 Canvas 测量。
 */
export const createFontMetrics = async (
  fontBuffers: ArrayBuffer[] = [],
  family = 'sans-serif',
): Promise<TextMetricsProvider> => {
  const loaded: Array<{ font: Font; bold: boolean }> = []
  const cache = new Map<string, number>()

  for (const buffer of fontBuffers) {
    try {
      const font = parseFont(buffer)

      loaded.push({ font, bold: isBoldFont(font) })
    } catch (error) {
      console.warn('[preview] 字体解析失败，已忽略', error)
    }
  }

  if (loaded.length === 0) {
    return createCanvasMetrics(family)
  }

  const fallback = createCanvasMetrics(family)

  const pick = (style: FontStyle) => {
    const target = loaded.find((item) => item.bold === Boolean(style.bold))

    return target ?? loaded[0]
  }

  return {
    hasEmbeddedFont: true,
    measure(text, style) {
      const key = `${style.bold ? 1 : 0}|${style.fontSize}|${text}`
      const cached = cache.get(key)

      if (cached !== undefined) return cached

      const { font } = pick(style)
      let width = 0

      try {
        width = font.getAdvanceWidth(text, style.fontSize)
      } catch {
        width = fallback.measure(text, style)
      }

      if (cache.size > 5000) cache.clear()
      cache.set(key, width)

      return width
    },
    draw(ctx, text, x, y, style) {
      const { font } = pick(style)

      try {
        font.draw(ctx, text, x, y, style.fontSize)
      } catch {
        fallback.draw(ctx, text, x, y, style)
      }
    },
  }
}
