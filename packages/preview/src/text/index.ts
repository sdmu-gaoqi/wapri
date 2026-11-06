/**
 * 文本预览：按行分块，进入视口才填充内容。
 */

import { PREVIEW_CLASS, TEXT_CHUNK_LINES } from '../constant'
import { createPreviewContext } from '../core/context'
import { LazyRenderPool } from '../core/lazy'
import { resolvePreviewSource } from '../core/source'
import type { ResolvedSource } from '../core/source'
import type { PreviewHandle, PreviewInput } from '../types/common'
import type { TextPreviewOptions } from '../types/text'

export const renderText = (source: ResolvedSource, options: TextPreviewOptions): PreviewHandle<'text'> => {
  const context = createPreviewContext(options)
  const chunkLines = Math.max(1, options.chunkLines ?? TEXT_CHUNK_LINES)

  let text = ''

  try {
    text = new TextDecoder(options.encoding ?? 'utf-8').decode(source.buffer)
  } catch (error) {
    context.fail(error)
    throw error
  }

  const lines = text.split(/\r\n|\r|\n/)
  const chunks: string[][] = []

  for (let index = 0; index < lines.length; index += chunkLines) {
    chunks.push(lines.slice(index, index + chunkLines))
  }

  const lineHeight = Math.round(context.theme.fontSize * Math.max(1, context.theme.lineHeight))
  const list = document.createElement('div')

  list.className = PREVIEW_CLASS.text
  list.style.whiteSpace = options.wrap === false ? 'pre' : 'pre-wrap'
  if (options.monoFontFamily) list.style.fontFamily = options.monoFontFamily

  const blocks: HTMLElement[] = []
  const pool = new LazyRenderPool({ root: context.viewport, keepAlive: true })

  context.onDestroy(() => pool.destroy())
  context.emitProgress({ stage: 'parsing', loaded: 0, total: chunks.length })

  chunks.forEach((chunk, index) => {
    const block = document.createElement('div')

    block.className = PREVIEW_CLASS.textChunk
    block.dataset.index = String(index)
    // 先按行数占位，保证滚动条高度稳定
    block.style.minHeight = `${chunk.length * lineHeight}px`
    list.appendChild(block)
    blocks.push(block)

    const content = chunk.join('\n')

    pool.register({
      element: block,
      render: () => {
        block.textContent = content
        block.style.minHeight = ''
      },
    })
  })

  context.viewport.appendChild(list)
  context.emitProgress({ stage: 'ready', loaded: chunks.length, total: chunks.length })

  return {
    kind: 'text',
    container: context.container,
    get unitCount() {
      return chunks.length
    },
    get renderedCount() {
      return pool.renderedCount
    },
    renderAll: () => pool.renderAll(),
    scrollTo(index) {
      blocks[index]?.scrollIntoView({ block: 'start' })
    },
    refresh() {
      // 文本没有画布，尺寸变化交给浏览器重排
    },
    destroy() {
      pool.destroy()
      context.destroy()
    },
  }
}

export const previewText = async (input: PreviewInput, options: TextPreviewOptions): Promise<PreviewHandle<'text'>> => {
  const source = await resolvePreviewSource(input)

  return renderText(source, options)
}
