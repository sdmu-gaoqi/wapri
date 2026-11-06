/**
 * XLSX 网格渲染：按可视区域创建单元格，支持合并、列宽、行高。
 */

import { PREVIEW_CLASS } from '../constant'
import type { XlsxMerge, XlsxSheet } from '../types/xlsx'

export interface GridViewOptions {
  colWidth: number
  rowHeight: number
  scroller: HTMLElement
}

export interface GridView {
  readonly element: HTMLElement
  readonly renderedRows: number
  render(): void
  refresh(): void
  destroy(): void
}

const keyOf = (row: number, col: number) => `${row}:${col}`

const buildOffsets = (sizes: number[]) => {
  const offsets = Array.from({ length: sizes.length + 1 }, () => 0)

  offsets[0] = 0

  for (let index = 0; index < sizes.length; index += 1) {
    offsets[index + 1] = offsets[index] + sizes[index]
  }

  return offsets
}

/** 找到满足 offsets[i] <= value 的最大下标 */
const findIndex = (offsets: number[], value: number) => {
  const last = Math.max(0, offsets.length - 2)
  let low = 0
  let high = last

  while (low < high) {
    const mid = Math.ceil((low + high) / 2)

    if (offsets[mid] <= value) {
      low = mid
    } else {
      high = mid - 1
    }
  }

  return Math.max(0, Math.min(last, low))
}

const MAX_MERGE_CELLS = 10_000
const MAX_MERGE_SIZE = 2000

export const createGridView = (sheet: XlsxSheet, options: GridViewOptions): GridView => {
  const colSizes = Array.from({ length: sheet.colCount }, (_, index) => sheet.colWidths[index] || options.colWidth)
  const rowSizes = Array.from({ length: sheet.rowCount }, (_, index) => sheet.rowHeights[index] || options.rowHeight)
  const colOffsets = buildOffsets(colSizes)
  const rowOffsets = buildOffsets(rowSizes)
  const totalWidth = colOffsets[colOffsets.length - 1] ?? 0
  const totalHeight = rowOffsets[rowOffsets.length - 1] ?? 0

  const mergeStarts = new Map<string, XlsxMerge>()
  const mergeOwners = new Map<string, XlsxMerge>()

  sheet.merges.forEach((merge) => {
    mergeStarts.set(keyOf(merge.s.r, merge.s.c), merge)

    let count = 0

    for (let row = merge.s.r; row <= merge.e.r; row += 1) {
      for (let col = merge.s.c; col <= merge.e.c; col += 1) {
        if (row === merge.s.r && col === merge.s.c) continue
        if (count >= MAX_MERGE_CELLS) return

        mergeOwners.set(keyOf(row, col), merge)
        count += 1
      }
    }
  })

  const element = document.createElement('div')

  element.className = PREVIEW_CLASS.grid
  element.style.width = `${totalWidth}px`
  element.style.height = `${totalHeight}px`

  let destroyed = false
  let renderedRows = 0

  const render = () => {
    if (destroyed) return

    const scrollTop = options.scroller.scrollTop
    const scrollLeft = options.scroller.scrollLeft
    const viewHeight = options.scroller.clientHeight
    const viewWidth = options.scroller.clientWidth

    if (sheet.rowCount === 0 || sheet.colCount === 0) {
      element.textContent = ''

      return
    }

    const rowStart = findIndex(rowOffsets, scrollTop)
    const rowEnd = Math.min(sheet.rowCount - 1, findIndex(rowOffsets, scrollTop + viewHeight) + 1)
    const colStart = findIndex(colOffsets, scrollLeft)
    const colEnd = Math.min(sheet.colCount - 1, findIndex(colOffsets, scrollLeft + viewWidth) + 1)
    const fragment = document.createDocumentFragment()
    const drawn = new Set<string>()

    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        const merge = mergeStarts.get(keyOf(row, col)) ?? mergeOwners.get(keyOf(row, col))

        if (merge) {
          const mergeKey = keyOf(merge.s.r, merge.s.c)

          if (drawn.has(mergeKey)) continue

          drawn.add(mergeKey)

          const left = colOffsets[merge.s.c] ?? 0
          const top = rowOffsets[merge.s.r] ?? 0
          const width = Math.min(MAX_MERGE_SIZE, (colOffsets[merge.e.c + 1] ?? left) - left)
          const height = Math.min(MAX_MERGE_SIZE, (rowOffsets[merge.e.r + 1] ?? top) - top)
          const cell = document.createElement('div')

          cell.className = PREVIEW_CLASS.gridCell
          cell.style.left = `${left}px`
          cell.style.top = `${top}px`
          cell.style.width = `${Math.max(1, width)}px`
          cell.style.height = `${Math.max(1, height)}px`
          cell.textContent = sheet.rows[merge.s.r]?.[merge.s.c] ?? ''
          fragment.appendChild(cell)
          continue
        }

        const left = colOffsets[col] ?? 0
        const top = rowOffsets[row] ?? 0
        const cell = document.createElement('div')

        cell.className = PREVIEW_CLASS.gridCell
        cell.style.left = `${left}px`
        cell.style.top = `${top}px`
        cell.style.width = `${Math.max(1, (colOffsets[col + 1] ?? left) - left)}px`
        cell.style.height = `${Math.max(1, (rowOffsets[row + 1] ?? top) - top)}px`
        cell.textContent = sheet.rows[row]?.[col] ?? ''
        fragment.appendChild(cell)
      }
    }

    element.textContent = ''
    element.appendChild(fragment)
    renderedRows = rowEnd - rowStart + 1
  }

  return {
    element,
    get renderedRows() {
      return renderedRows
    },
    render,
    refresh() {
      render()
    },
    destroy() {
      destroyed = true
      element.remove()
    },
  }
}
