/**
 * Word 精简排版引擎：断行、表格布局、分页，产出可绘制到 Canvas 的盒模型。
 *
 * 字体度量来自 opentype.js（内嵌字体）或 Canvas measureText，两者都通过 TextMetricsProvider 抽象。
 */

import type { WordBlock, WordDocumentModel, WordTextRun } from '../types/word'
import type { FontStyle, TextMetricsProvider } from './font'

export interface TextBox {
  type: 'text'
  x: number
  y: number
  width: number
  height: number
  text: string
  fontSize: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  color?: string
}

export interface ImageBox {
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  src: string
}

export interface RectBox {
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
  stroke?: string
  fill?: string
  lineWidth?: number
}

export type LayoutBox = TextBox | ImageBox | RectBox

export interface LayoutPage {
  width: number
  height: number
  boxes: LayoutBox[]
}

export interface LayoutConfig {
  pageWidth: number
  pageHeight: number
  padding: number
  fontSize: number
  lineHeight: number
  color: string
  mutedColor: string
  metrics: TextMetricsProvider
}

interface StyledChar {
  char: string
  run: WordTextRun
  style: FontStyle
}

const HEADING_SCALE: Record<number, number> = { 1: 2, 2: 1.6, 3: 1.4, 4: 1.2, 5: 1.1, 6: 1 }

const isCjk = (char: string) => /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char)

class Pager {
  readonly pages: LayoutPage[] = []
  readonly contentWidth: number
  y: number
  private boxes: LayoutBox[] = []

  constructor(private readonly config: LayoutConfig) {
    this.contentWidth = config.pageWidth - config.padding * 2
    this.y = config.padding
  }

  get x() {
    return this.config.padding
  }

  get bottom() {
    return this.config.pageHeight - this.config.padding
  }

  add(box: LayoutBox) {
    this.boxes.push(box)
  }

  ensure(height: number) {
    if (this.y + height <= this.bottom) return
    if (this.boxes.length === 0) return

    this.newPage()
  }

  newPage() {
    this.pages.push({ width: this.config.pageWidth, height: this.config.pageHeight, boxes: this.boxes })
    this.boxes = []
    this.y = this.config.padding
  }

  finish(): LayoutPage[] {
    if (this.boxes.length > 0) {
      this.pages.push({ width: this.config.pageWidth, height: this.config.pageHeight, boxes: this.boxes })
      this.boxes = []
    }

    if (this.pages.length === 0) {
      return [{ width: this.config.pageWidth, height: this.config.pageHeight, boxes: [] }]
    }

    return this.pages
  }
}

const styleOf = (run: WordTextRun, baseSize: number): FontStyle => ({
  fontSize: run.fontSize ?? baseSize,
  bold: run.bold,
  italic: run.italic,
})

const wrapRuns = (
  runs: WordTextRun[],
  maxWidth: number,
  baseSize: number,
  metrics: TextMetricsProvider,
): StyledChar[][] => {
  const chars: StyledChar[] = []
  const widthCache = new Map<string, number>()

  runs.forEach((run) => {
    const style = styleOf(run, baseSize)

    for (const char of run.text) {
      chars.push({ char, run, style })
    }
  })

  const charWidth = (item: StyledChar) => {
    const key = `${item.style.fontSize}|${item.style.bold ? 1 : 0}|${item.char}`
    const cached = widthCache.get(key)

    if (cached !== undefined) return cached

    const width = metrics.measure(item.char, item.style)

    widthCache.set(key, width)

    return width
  }

  const lines: StyledChar[][] = []
  let current: StyledChar[] = []
  let width = 0
  let lastSpace = -1

  for (const item of chars) {
    if (item.char === '\n') {
      lines.push(current)
      current = []
      width = 0
      lastSpace = -1
      continue
    }

    const itemWidth = charWidth(item)

    if (width + itemWidth > maxWidth && current.length > 0) {
      if (lastSpace > 0 && !isCjk(item.char)) {
        const head = current.slice(0, lastSpace)
        const rest = current.slice(lastSpace + 1)

        lines.push(head)
        current = rest
        width = rest.reduce((sum, next) => sum + charWidth(next), 0)
      } else {
        lines.push(current)
        current = []
        width = 0
      }

      lastSpace = -1
    }

    current.push(item)
    width += itemWidth

    if (item.char === ' ') lastSpace = current.length - 1
  }

  if (current.length > 0) lines.push(current)

  return lines.length > 0 ? lines : [[]]
}

const lineWidth = (line: StyledChar[], metrics: TextMetricsProvider) =>
  line.reduce((sum, item) => sum + metrics.measure(item.char, item.style), 0)

/** 把一行按样式切分成多个 text box */
const pushLine = (
  pager: Pager,
  line: StyledChar[],
  x: number,
  maxWidth: number,
  lineHeight: number,
  metrics: TextMetricsProvider,
  align: 'left' | 'center' | 'right' | 'justify' = 'left',
) => {
  if (line.length === 0) return

  const total = lineWidth(line, metrics)
  let cursor = x

  if (align === 'center') cursor += Math.max(0, (maxWidth - total) / 2)
  if (align === 'right') cursor += Math.max(0, maxWidth - total)

  let buffer = ''
  let style = line[0].style
  let run = line[0].run

  const flush = () => {
    if (!buffer) return

    const width = metrics.measure(buffer, style)

    pager.add({
      type: 'text',
      x: cursor,
      y: pager.y,
      width,
      height: lineHeight,
      text: buffer,
      fontSize: style.fontSize,
      bold: style.bold,
      italic: style.italic,
      underline: run.underline,
    })
    cursor += width
    buffer = ''
  }

  for (const item of line) {
    if (item.run !== run || item.style !== style) {
      flush()
      run = item.run
      style = item.style
    }

    buffer += item.char
  }

  flush()
}

const layoutParagraph = (pager: Pager, block: Extract<WordBlock, { type: 'paragraph' }>, config: LayoutConfig) => {
  const headingScale = block.heading ? (HEADING_SCALE[block.heading] ?? 1) : 1
  const fontSize = config.fontSize * headingScale
  const lineHeight = fontSize * (block.heading ? 1.35 : config.lineHeight)
  const listLevel = block.listLevel ?? 0
  const indent = listLevel > 0 ? 18 * listLevel : 0
  const prefix = listLevel > 0 ? (block.listIndex ? `${block.listIndex}. ` : '• ') : ''
  const prefixWidth = prefix ? config.metrics.measure(prefix, { fontSize, bold: Boolean(block.heading) }) : 0
  const textWidth = pager.contentWidth - indent - prefixWidth

  if (block.heading) {
    pager.y += fontSize * 0.4
  }

  const lines = wrapRuns(block.runs, Math.max(40, textWidth), fontSize, config.metrics)

  lines.forEach((line, index) => {
    pager.ensure(lineHeight)

    if (index === 0 && prefix) {
      pager.add({
        type: 'text',
        x: pager.x + indent,
        y: pager.y,
        width: prefixWidth,
        height: lineHeight,
        text: prefix,
        fontSize,
        bold: Boolean(block.heading),
      })
    }

    pushLine(pager, line, pager.x + indent + prefixWidth, textWidth, lineHeight, config.metrics, block.align ?? 'left')
    pager.y += lineHeight
  })

  pager.y += block.heading ? fontSize * 0.3 : 6
}

const layoutTable = (pager: Pager, block: Extract<WordBlock, { type: 'table' }>, config: LayoutConfig) => {
  const colCount = Math.max(...block.rows.map((row) => row.length), 1)
  const cellPadding = 6
  const fontSize = config.fontSize
  const lineHeight = fontSize * config.lineHeight
  const colWidth = pager.contentWidth / colCount

  const prepared = block.rows.map((row) => {
    const cells = Array.from({ length: colCount }, (_, index) => row[index] ?? { runs: [] })
    const wrapped = cells.map((cell) => {
      const runs = cell.header ? cell.runs.map((run) => ({ ...run, bold: true })) : cell.runs

      return wrapRuns(runs, Math.max(20, colWidth - cellPadding * 2), fontSize, config.metrics)
    })
    const height = Math.max(1, ...wrapped.map((lines) => lines.length)) * lineHeight + cellPadding * 2

    return { wrapped, height }
  })

  prepared.forEach((row) => {
    pager.ensure(row.height)

    const top = pager.y

    for (let index = 0; index < colCount; index += 1) {
      pager.add({
        type: 'rect',
        x: pager.x + index * colWidth,
        y: top,
        width: colWidth,
        height: row.height,
        stroke: '#d0d5dd',
        lineWidth: 1,
      })
    }

    row.wrapped.forEach((lines, columnIndex) => {
      const cellX = pager.x + columnIndex * colWidth + cellPadding

      pager.y = top + cellPadding
      lines.forEach((line) => {
        pushLine(pager, line, cellX, colWidth - cellPadding * 2, lineHeight, config.metrics)
        pager.y += lineHeight
      })
    })

    pager.y = top + row.height
  })

  pager.y += 8
}

const layoutImage = (pager: Pager, block: Extract<WordBlock, { type: 'image' }>) => {
  const maxWidth = pager.contentWidth
  const scale = Math.min(1, maxWidth / Math.max(1, block.width))
  const width = block.width * scale
  const height = block.height * scale

  pager.ensure(height)

  pager.add({
    type: 'image',
    x: pager.x + Math.max(0, (maxWidth - width) / 2),
    y: pager.y,
    width,
    height,
    src: block.src,
  })
  pager.y += height + 8
}

/** 把文档模型排版成页面盒模型 */
export const layoutDocument = (model: WordDocumentModel, config: LayoutConfig): LayoutPage[] => {
  const pager = new Pager(config)

  for (const block of model.blocks) {
    if (block.type === 'paragraph') {
      layoutParagraph(pager, block, config)
    } else if (block.type === 'table') {
      layoutTable(pager, block, config)
    } else {
      layoutImage(pager, block)
    }
  }

  return pager.finish()
}
