/**
 * PDF 预览：pdf.js 渲染到 canvas，按页进入视口才渲染，缩略图同样懒渲染。
 */

import { PDF_THUMBNAIL_WIDTH, PREVIEW_CLASS } from '../constant'
import { createPreviewContext } from '../core/context'
import { LazyRenderPool } from '../core/lazy'
import { resolvePreviewSource } from '../core/source'
import type { ResolvedSource } from '../core/source'
import type { PreviewHandle, PreviewInput } from '../types/common'
import type { PdfPreviewOptions } from '../types/pdf'
import { loadPdfJs, getPdfjsConfig } from './load'
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'

interface PageSlot {
  element: HTMLElement
  page: PDFPageProxy
  baseWidth: number
  baseHeight: number
  scale: number
  canvas?: HTMLCanvasElement
}

const applySlotSize = (slot: PageSlot) => {
  slot.element.style.width = `${Math.floor(slot.baseWidth * slot.scale)}px`
  slot.element.style.height = `${Math.floor(slot.baseHeight * slot.scale)}px`
}

const renderSlot = async (slot: PageSlot, tasks: Set<RenderTask>) => {
  const viewport = slot.page.getViewport({ scale: slot.scale })
  const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')

  canvas.className = PREVIEW_CLASS.pageCanvas
  canvas.width = Math.floor(viewport.width * ratio)
  canvas.height = Math.floor(viewport.height * ratio)
  canvas.style.width = `${Math.floor(viewport.width)}px`
  canvas.style.height = `${Math.floor(viewport.height)}px`

  const context2d = canvas.getContext('2d')

  if (!context2d) {
    throw new Error('[preview] 当前环境不支持 Canvas 2D')
  }

  const task = slot.page.render({
    canvasContext: context2d,
    viewport,
    transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
  })

  tasks.add(task)

  try {
    await task.promise
    slot.canvas?.remove()
    slot.canvas = canvas
    slot.element.appendChild(canvas)
  } catch (error) {
    canvas.remove()
    // 取消渲染属于正常流程，不往上抛
    if ((error as { name?: string } | null)?.name === 'RenderingCancelledException') return

    throw error
  } finally {
    tasks.delete(task)
  }
}

export const renderPdf = async (source: ResolvedSource, options: PdfPreviewOptions): Promise<PreviewHandle<'pdf'>> => {
  const context = createPreviewContext(options)
  const pdfjs = await loadPdfJs(options.pdfjs)
  const { workerSrc } = getPdfjsConfig()

  if (!workerSrc) {
    const error = new Error(
      '[preview] 未找到 pdf.js worker：请调用 configurePdfjs({ workerSrc }) 指定可访问的 pdf.worker.min.mjs 地址',
    )

    context.fail(error)
    throw error
  }

  const config = options.pdfjs ?? {}
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(source.buffer),
    cMapUrl: config.cMapUrl,
    cMapPacked: true,
    standardFontDataUrl: config.standardFontDataUrl,
    isEvalSupported: false,
  })
  let pdfDocument: PDFDocumentProxy | undefined

  try {
    context.emitProgress({ stage: 'parsing', loaded: 0, total: 0 })

    pdfDocument = await loadingTask.promise

    const pageCount = pdfDocument.numPages
    const pages: PDFPageProxy[] = []

    for (let index = 0; index < pageCount; index += 1) {
      pages.push(await pdfDocument.getPage(index + 1))
    }

    const containerWidth = context.viewport.clientWidth || context.container.clientWidth || 360
    const maxScale = options.maxScale ?? 3
    const firstViewport = pages[0]?.getViewport({ scale: 1 })
    const autoScale = firstViewport ? Math.min(maxScale, Math.max(0.1, (containerWidth - 24) / firstViewport.width)) : 1
    const scale = options.scale ?? autoScale

    const tasks = new Set<RenderTask>()
    const slots: PageSlot[] = pages.map((page, index) => {
      const size = page.getViewport({ scale: 1 })
      const element = document.createElement('div')

      element.className = PREVIEW_CLASS.page
      element.dataset.page = String(index + 1)

      const label = document.createElement('span')

      label.className = PREVIEW_CLASS.pageLabel
      label.textContent = `${index + 1} / ${pageCount}`
      element.appendChild(label)

      const slot: PageSlot = {
        element,
        page,
        baseWidth: size.width,
        baseHeight: size.height,
        scale,
      }

      applySlotSize(slot)
      context.viewport.appendChild(element)

      return slot
    })

    const pool = new LazyRenderPool({ root: context.viewport, keepAlive: true, maxConcurrent: 1 })

    context.onDestroy(() => {
      pool.destroy()
      tasks.forEach((task) => task.cancel())
      tasks.clear()
      void loadingTask.destroy()
    })

    slots.forEach((slot) => {
      pool.register({
        element: slot.element,
        render: () => renderSlot(slot, tasks),
        release: () => {
          slot.canvas?.remove()
          slot.canvas = undefined
        },
      })
    })

    if (options.thumbnails) {
      attachThumbnails(context, slots, tasks)
    }

    context.emitProgress({ stage: 'ready', loaded: pageCount, total: pageCount })

    const handle: PreviewHandle<'pdf'> = {
      kind: 'pdf',
      container: context.container,
      get unitCount() {
        return slots.length
      },
      get renderedCount() {
        return pool.renderedCount
      },
      renderAll: () => pool.renderAll(),
      scrollTo(index) {
        slots[index]?.element.scrollIntoView({ block: 'start' })
      },
      refresh() {
        const width = context.viewport.clientWidth || containerWidth

        if (!firstViewport || options.scale) return

        const nextScale = Math.min(maxScale, Math.max(0.1, (width - 24) / firstViewport.width))

        slots.forEach((slot) => {
          slot.scale = nextScale
          applySlotSize(slot)
        })
        pool.reset()
      },
      destroy() {
        pool.destroy()
        context.destroy()
      },
    }

    return handle
  } catch (error) {
    await loadingTask.destroy()
    context.fail(error)
    throw error
  }
}

const attachThumbnails = (
  context: ReturnType<typeof createPreviewContext>,
  slots: PageSlot[],
  tasks: Set<RenderTask>,
) => {
  const bar = document.createElement('div')
  const thumbPool = new LazyRenderPool({ root: bar, keepAlive: true, maxConcurrent: 1 })

  bar.className = PREVIEW_CLASS.thumbnails
  context.root.appendChild(bar)
  context.onDestroy(() => thumbPool.destroy())

  slots.forEach((slot, index) => {
    const item = document.createElement('button')
    const canvas = document.createElement('canvas')

    item.type = 'button'
    item.className = PREVIEW_CLASS.thumbnail
    item.title = `第 ${index + 1} 页`
    canvas.width = PDF_THUMBNAIL_WIDTH
    canvas.height = Math.max(1, Math.round((PDF_THUMBNAIL_WIDTH * slot.baseHeight) / slot.baseWidth))
    item.appendChild(canvas)
    bar.appendChild(item)
    item.addEventListener('click', () => {
      slot.element.scrollIntoView({ block: 'start' })
    })

    thumbPool.register({
      element: item,
      render: async () => {
        const thumbScale = PDF_THUMBNAIL_WIDTH / slot.baseWidth
        const viewport = slot.page.getViewport({ scale: thumbScale })
        const context2d = canvas.getContext('2d')

        if (!context2d) return

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)

        const task = slot.page.render({ canvasContext: context2d, viewport })

        tasks.add(task)

        try {
          await task.promise
        } catch (error) {
          if ((error as { name?: string } | null)?.name !== 'RenderingCancelledException') {
            console.warn('[preview] 缩略图渲染失败', error)
          }
        } finally {
          tasks.delete(task)
        }
      },
    })
  })
}

export const previewPdf = async (input: PreviewInput, options: PdfPreviewOptions): Promise<PreviewHandle<'pdf'>> => {
  const source = await resolvePreviewSource(input)

  return renderPdf(source, options)
}
