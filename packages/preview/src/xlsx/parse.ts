/**
 * XLSX 解析：优先在 worker 里用 SheetJS 解析，失败时回退主线程。
 */

import { createInlineWorker, WorkerChannel } from '@wapri/gbase'
import type { XlsxMerge, XlsxWorkbook } from '../types/xlsx'
import { XLSX_WORKER_SOURCE } from './workerSource'

interface SheetLike {
  '!ref'?: string
  '!merges'?: XlsxMerge[]
  '!cols'?: Array<{ wch?: number }>
  '!rows'?: Array<{ hpt?: number }>
  [key: string]: unknown
}

interface CellLike {
  w?: string
  v?: string | number | boolean | null
}

export interface ParseXlsxOptions {
  maxCells: number
  worker?: boolean
  /** SheetJS UMD 地址，默认取包内 vendor 副本 */
  scriptUrl?: string
}

/** 用字符串拼接避免构建器把 vendor 路径当成静态资源解析 */
export const resolveXlsxScript = (): string | undefined => {
  try {
    if (typeof import.meta === 'undefined' || !import.meta.url) return undefined

    const base = import.meta.url

    // 与 pdf worker 同理：file:// 是构建机路径，浏览器与 worker 都拉不到
    if (!/^https?:\/\//i.test(base)) return undefined

    const dir = base.slice(0, base.lastIndexOf('/'))

    return `${dir}/../vendor/xlsx.full.min.js`
  } catch {
    return undefined
  }
}

const toText = (cell: CellLike | undefined): string => {
  if (!cell) return ''
  if (cell.w !== undefined && cell.w !== null) return String(cell.w)
  if (cell.v === undefined || cell.v === null) return ''

  return String(cell.v)
}

const parseInMainThread = async (buffer: ArrayBuffer, maxCells: number): Promise<XlsxWorkbook> => {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: false })

  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name] as unknown as SheetLike
    const ref = sheet['!ref']

    if (!ref) {
      return {
        name,
        rows: [],
        rowCount: 0,
        colCount: 0,
        merges: [],
        colWidths: [],
        rowHeights: [],
        truncated: false,
      }
    }

    const range = XLSX.utils.decode_range(ref)
    const totalRows = range.e.r - range.s.r + 1
    const colCount = range.e.c - range.s.c + 1
    const truncated = totalRows * colCount > maxCells
    const rowCount = truncated ? Math.max(1, Math.floor(maxCells / Math.max(1, colCount))) : totalRows
    const rows: string[][] = []

    for (let row = 0; row < rowCount; row += 1) {
      const line: string[] = []

      for (let col = 0; col < colCount; col += 1) {
        const address = XLSX.utils.encode_cell({ r: range.s.r + row, c: range.s.c + col })

        line.push(toText(sheet[address] as CellLike | undefined))
      }

      rows.push(line)
    }

    const merges = (sheet['!merges'] ?? []).map((merge) => ({
      s: { r: merge.s.r - range.s.r, c: merge.s.c - range.s.c },
      e: { r: merge.e.r - range.s.r, c: merge.e.c - range.s.c },
    }))
    const cols = sheet['!cols'] ?? []
    const colWidths = Array.from({ length: colCount }, (_, index) => {
      const info = cols[index]

      return info?.wch ? Math.max(40, Math.min(400, info.wch * 8 + 8)) : 0
    })
    const rowsMeta = sheet['!rows'] ?? []
    const rowHeights = Array.from({ length: rowCount }, (_, index) => {
      const info = rowsMeta[index]

      return info?.hpt ? Math.max(18, Math.min(200, info.hpt * 1.333)) : 0
    })

    return { name, rows, rowCount, colCount, merges, colWidths, rowHeights, truncated }
  })

  return { sheets }
}

/** 解析工作簿；worker 不可用或缺少 UMD 时自动回退主线程 */
export const parseXlsx = async (buffer: ArrayBuffer, options: ParseXlsxOptions): Promise<XlsxWorkbook> => {
  const scriptUrl = options.scriptUrl ?? resolveXlsxScript()

  if (options.worker !== false && scriptUrl && typeof Worker !== 'undefined') {
    let channel: WorkerChannel | undefined

    try {
      channel = new WorkerChannel(createInlineWorker(XLSX_WORKER_SOURCE))
      const result = await channel.request<XlsxWorkbook>(
        { type: 'parse', payload: { buffer, maxCells: options.maxCells, scriptUrl } },
        { timeout: 120_000 },
      )

      return result
    } catch (error) {
      console.warn('[preview] worker 解析 XLSX 失败，回退主线程', error)
    } finally {
      channel?.terminate()
    }
  }

  return parseInMainThread(buffer, options.maxCells)
}
