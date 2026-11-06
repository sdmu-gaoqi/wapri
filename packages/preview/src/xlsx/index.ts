/**
 * XLSX 预览：解析后渲染虚拟表格，多 sheet 用底部/顶部标签切换。
 */

import { PREVIEW_CLASS, XLSX_DEFAULT_COL_WIDTH, XLSX_DEFAULT_ROW_HEIGHT, XLSX_MAX_CELLS } from '../constant'
import { createPreviewContext } from '../core/context'
import { resolvePreviewSource } from '../core/source'
import type { ResolvedSource } from '../core/source'
import type { PreviewHandle, PreviewInput } from '../types/common'
import type { XlsxPreviewOptions, XlsxSheet, XlsxWorkbook } from '../types/xlsx'
import { parseXlsx } from './parse'
import { createGridView } from './render'
import type { GridView } from './render'

const resolveSheetIndex = (sheets: XlsxSheet[], sheet?: string | number): number => {
  if (typeof sheet === 'number') {
    return Math.max(0, Math.min(sheets.length - 1, Math.floor(sheet)))
  }

  if (typeof sheet === 'string') {
    const index = sheets.findIndex((item) => item.name === sheet)

    if (index >= 0) return index
  }

  return 0
}

export const renderXlsx = async (
  source: ResolvedSource,
  options: XlsxPreviewOptions,
): Promise<PreviewHandle<'xlsx'>> => {
  const context = createPreviewContext(options)
  const maxCells = options.maxCells ?? XLSX_MAX_CELLS

  context.emitProgress({ stage: 'parsing', loaded: 0, total: 0 })

  let workbook: XlsxWorkbook

  try {
    workbook = await parseXlsx(source.buffer, {
      maxCells,
      worker: options.worker,
      scriptUrl: options.workerScript,
    })
  } catch (error) {
    context.fail(error)
    throw error
  }

  if (workbook.sheets.length === 0) {
    const error = new Error('[preview] 工作簿里没有可预览的工作表')

    context.fail(error)
    throw error
  }

  const tabs = document.createElement('div')

  tabs.className = PREVIEW_CLASS.sheetTabs
  context.root.insertBefore(tabs, context.viewport)

  let activeIndex = resolveSheetIndex(workbook.sheets, options.sheet)
  let grid: GridView | undefined
  let frame = 0

  const updateTabs = () => {
    Array.from(tabs.children).forEach((child, index) => {
      child.classList.toggle(PREVIEW_CLASS.sheetTabActive, index === activeIndex)
    })
  }

  const mount = (index: number) => {
    activeIndex = index
    grid?.destroy()
    context.viewport.textContent = ''
    context.viewport.scrollTop = 0
    context.viewport.scrollLeft = 0

    const sheet = workbook.sheets[index]

    if (!sheet) return

    grid = createGridView(sheet, {
      colWidth: options.colWidth ?? XLSX_DEFAULT_COL_WIDTH,
      rowHeight: options.rowHeight ?? XLSX_DEFAULT_ROW_HEIGHT,
      scroller: context.viewport,
    })
    context.viewport.appendChild(grid.element)
    grid.render()
    updateTabs()
    context.emitProgress({ stage: 'ready', loaded: sheet.rowCount, total: sheet.rowCount })
  }

  workbook.sheets.forEach((sheet, index) => {
    const tab = document.createElement('button')

    tab.type = 'button'
    tab.className = PREVIEW_CLASS.sheetTab
    tab.textContent = sheet.name
    tab.addEventListener('click', () => mount(index))
    tabs.appendChild(tab)
  })

  const onScroll = () => {
    if (frame) return

    frame = requestAnimationFrame(() => {
      frame = 0
      grid?.render()
    })
  }

  context.viewport.addEventListener('scroll', onScroll, { passive: true })
  context.onDestroy(() => {
    context.viewport.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    grid?.destroy()
  })

  mount(activeIndex)
  // 首次挂载时容器可能还没完成布局，下一帧再算一次可视区域
  requestAnimationFrame(() => grid?.render())

  return {
    kind: 'xlsx',
    container: context.container,
    get unitCount() {
      return workbook.sheets[activeIndex]?.rowCount ?? 0
    },
    get renderedCount() {
      return grid?.renderedRows ?? 0
    },
    renderAll() {
      grid?.refresh()
    },
    scrollTo(row) {
      const sheet = workbook.sheets[activeIndex]
      const rowHeight = options.rowHeight ?? XLSX_DEFAULT_ROW_HEIGHT

      if (!sheet) return

      context.viewport.scrollTop = Math.max(0, Math.min(sheet.rowCount, row) * rowHeight)
      grid?.render()
    },
    refresh() {
      grid?.refresh()
    },
    destroy() {
      context.destroy()
    },
  }
}

export const previewXlsx = async (input: PreviewInput, options: XlsxPreviewOptions): Promise<PreviewHandle<'xlsx'>> => {
  const source = await resolvePreviewSource(input)

  return renderXlsx(source, options)
}
