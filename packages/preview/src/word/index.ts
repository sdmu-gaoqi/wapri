/**
 * Word 预览：mammoth 解析、opentype 排版、Canvas 分页绘制。
 */

import { PREVIEW_CLASS, WORD_PAGE_HEIGHT, WORD_PAGE_PADDING, WORD_PAGE_WIDTH } from '../constant'
import { createPreviewContext } from '../core/context'
import { LazyRenderPool } from '../core/lazy'
import { resolvePreviewSource } from '../core/source'
import type { ResolvedSource } from '../core/source'
import type { PreviewHandle, PreviewInput } from '../types/common'
import type { WordPreviewOptions, WordDocumentModel } from '../types/word'
import { createFontMetrics } from './font'
import type { TextMetricsProvider } from './font'
import { layoutDocument } from './layout'
import type { LayoutPage } from './layout'
import { parseWord } from './parse'
import { renderPageToCanvas, renderThumbnail } from './render'

const THUMBNAIL_WIDTH = 72

interface PageSlot {
  element: HTMLElement
  canvas: HTMLCanvasElement
  page: LayoutPage
}

export const renderWord = async (
  source: ResolvedSource,
  options: WordPreviewOptions,
): Promise<PreviewHandle<'word'>> => {
  const context = createPreviewContext(options)

  context.emitProgress({ stage: 'parsing', loaded: 0, total: 0 })

  let metrics: TextMetricsProvider

  try {
    metrics = await createFontMetrics(options.fonts, context.theme.fontFamily)
  } catch (error) {
    context.fail(error)
    throw error
  }

  let model: WordDocumentModel

  try {
    model = await parseWord(source.buffer, options.fontSize ?? context.theme.fontSize + 2)
  } catch (error) {
    context.fail(error)
    throw error
  }

  const baseWidth = options.pageWidth ?? WORD_PAGE_WIDTH
  const baseHeight = options.pageHeight ?? WORD_PAGE_HEIGHT
  const basePadding = options.padding ?? WORD_PAGE_PADDING
  const pixelRatio = options.maxPixelRatio ?? 2

  let slots: PageSlot[] = []
  let pool = new LazyRenderPool({ root: context.viewport, keepAlive: false, maxConcurrent: 1 })
  let thumbPool: LazyRenderPool | undefined
  let thumbBar: HTMLElement | undefined
  const paintOptions = { pixelRatio, paper: context.theme.paper, color: context.theme.color, metrics }

  const buildPages = () => {
    const availableWidth = context.viewport.clientWidth || context.container.clientWidth || 360
    const pageWidth = Math.max(240, Math.min(baseWidth, availableWidth - 24))
    const scale = pageWidth / baseWidth
    const pageHeight = baseHeight * scale
    const pages = layoutDocument(model, {
      pageWidth,
      pageHeight,
      padding: basePadding * scale,
      fontSize: model.fontSize * scale,
      lineHeight: context.theme.lineHeight,
      color: context.theme.color,
      mutedColor: context.theme.mutedColor,
      metrics,
    })

    pool.destroy()
    pool = new LazyRenderPool({ root: context.viewport, keepAlive: false, maxConcurrent: 1 })
    context.viewport.textContent = ''
    slots = pages.map((page, index) => {
      const element = document.createElement('div')
      const canvas = document.createElement('canvas')

      element.className = PREVIEW_CLASS.page
      element.style.width = `${page.width}px`
      element.style.height = `${page.height}px`
      canvas.className = PREVIEW_CLASS.pageCanvas
      element.appendChild(canvas)

      const label = document.createElement('span')

      label.className = PREVIEW_CLASS.pageLabel
      label.textContent = `${index + 1} / ${pages.length}`
      element.appendChild(label)
      context.viewport.appendChild(element)

      return { element, canvas, page }
    })

    slots.forEach((slot) => {
      pool.register({
        element: slot.element,
        render: () => renderPageToCanvas(slot.page, slot.canvas, paintOptions),
        release: () => {
          slot.canvas.width = 0
          slot.canvas.height = 0
        },
      })
    })

    buildThumbnails(pages)
    context.emitProgress({ stage: 'ready', loaded: pages.length, total: pages.length })
  }

  const buildThumbnails = (pages: LayoutPage[]) => {
    if (!options.thumbnails) return

    thumbPool?.destroy()
    thumbBar?.remove()

    const bar = document.createElement('div')

    bar.className = PREVIEW_CLASS.thumbnails
    context.root.appendChild(bar)
    thumbBar = bar
    thumbPool = new LazyRenderPool({ root: bar, keepAlive: true, maxConcurrent: 1 })

    pages.forEach((page, index) => {
      const item = document.createElement('button')
      const canvas = document.createElement('canvas')

      item.type = 'button'
      item.className = PREVIEW_CLASS.thumbnail
      item.title = `第 ${index + 1} 页`
      canvas.style.width = `${THUMBNAIL_WIDTH}px`
      item.appendChild(canvas)
      bar.appendChild(item)
      item.addEventListener('click', () => {
        slots[index]?.element.scrollIntoView({ block: 'start' })
      })

      thumbPool?.register({
        element: item,
        render: () => renderThumbnail(page, canvas, paintOptions, THUMBNAIL_WIDTH),
      })
    })
  }

  buildPages()

  context.onDestroy(() => {
    pool.destroy()
    thumbPool?.destroy()
  })

  return {
    kind: 'word',
    container: context.container,
    get unitCount() {
      return slots.length
    },
    get renderedCount() {
      return pool.renderedCount
    },
    renderAll() {
      pool.renderAll()
    },
    scrollTo(index) {
      slots[index]?.element.scrollIntoView({ block: 'start' })
    },
    refresh() {
      buildPages()
    },
    destroy() {
      context.destroy()
    },
  }
}

export const previewWord = async (input: PreviewInput, options: WordPreviewOptions): Promise<PreviewHandle<'word'>> => {
  const source = await resolvePreviewSource(input)

  return renderWord(source, options)
}
