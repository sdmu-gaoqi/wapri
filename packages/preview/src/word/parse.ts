/**
 * Word（docx）解析：mammoth 转 HTML，再归一化成块模型。
 */

import mammoth from 'mammoth'
import type { WordBlock, WordDocumentModel, WordTableCell, WordTextRun } from '../types/word'

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])

interface InlineStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

const collectRuns = (node: Node, style: InlineStyle = {}): WordTextRun[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''

    return text ? [{ text, ...style }] : []
  }

  if (!(node instanceof HTMLElement)) return []

  if (node.tagName === 'BR') {
    return [{ text: '\n', ...style }]
  }

  const next: InlineStyle = { ...style }

  if (node.tagName === 'STRONG' || node.tagName === 'B') next.bold = true
  if (node.tagName === 'EM' || node.tagName === 'I') next.italic = true
  if (node.tagName === 'U') next.underline = true

  return Array.from(node.childNodes).flatMap((child) => collectRuns(child, next))
}

const loadImageSize = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const image = new Image()

    image.onload = () => resolve({ width: image.naturalWidth || 320, height: image.naturalHeight || 240 })
    image.onerror = () => resolve({ width: 320, height: 240 })
    image.src = src
  })

const toBlocks = async (element: Element): Promise<WordBlock[]> => {
  const tag = element.tagName

  if (HEADING_TAGS.has(tag)) {
    return [{ type: 'paragraph', runs: collectRuns(element), heading: Number(tag.slice(1)) }]
  }

  if (tag === 'P' || tag === 'DIV') {
    const image = element.querySelector('img')

    if (image?.src) {
      const size = await loadImageSize(image.src)

      return [{ type: 'image', src: image.src, width: size.width, height: size.height }]
    }

    const runs = collectRuns(element)

    return runs.length > 0 ? [{ type: 'paragraph', runs }] : []
  }

  if (tag === 'UL' || tag === 'OL') {
    const blocks: WordBlock[] = []
    const items = Array.from(element.children).filter((child) => child.tagName === 'LI')

    for (const [index, item] of items.entries()) {
      const inlineRuns = Array.from(item.childNodes)
        .filter((child) => !(child instanceof HTMLElement && (child.tagName === 'UL' || child.tagName === 'OL')))
        .flatMap((child) => collectRuns(child))

      if (inlineRuns.length > 0) {
        blocks.push({
          type: 'paragraph',
          runs: inlineRuns,
          listLevel: 1,
          listIndex: tag === 'OL' ? index + 1 : 0,
        })
      }

      for (const child of Array.from(item.children)) {
        if (child.tagName !== 'UL' && child.tagName !== 'OL') continue

        const nested = await toBlocks(child)

        blocks.push(...nested.map((block) => (block.type === 'paragraph' ? { ...block, listLevel: 2 } : block)))
      }
    }

    return blocks
  }

  if (tag === 'TABLE') {
    const rows: WordTableCell[][] = Array.from(element.querySelectorAll('tr')).map((row) =>
      Array.from(row.querySelectorAll('th,td')).map((cell) => ({
        runs: collectRuns(cell),
        header: cell.tagName === 'TH',
      })),
    )

    return rows.length > 0 ? [{ type: 'table', rows }] : []
  }

  if (tag === 'IMG') {
    const source = (element as HTMLImageElement).src

    if (!source) return []

    const size = await loadImageSize(source)

    return [{ type: 'image', src: source, width: size.width, height: size.height }]
  }

  const children = Array.from(element.children)
  const blocks: WordBlock[] = []

  for (const child of children) {
    blocks.push(...(await toBlocks(child)))
  }

  return blocks
}

/** 解析 docx 为块模型，图片尺寸在主线程预读 */
export const parseWord = async (buffer: ArrayBuffer, fontSize = 16): Promise<WordDocumentModel> => {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  const document = new DOMParser().parseFromString(result.value, 'text/html')
  const blocks: WordBlock[] = []

  for (const child of Array.from(document.body.children)) {
    blocks.push(...(await toBlocks(child)))
  }

  return { blocks, fontSize }
}
