/**
 * SheetJS 解析 worker 源码（classic worker）。
 *
 * 以字符串形式内联，避免要求消费方额外暴露 worker 入口；SheetJS 用 importScripts 加载 UMD，
 * 地址由主线程传入，包内不写死 CDN。
 */

export const XLSX_WORKER_SOURCE = `
function toText(cell) {
  if (!cell) return ''
  if (cell.w !== undefined && cell.w !== null) return String(cell.w)
  if (cell.v === undefined || cell.v === null) return ''
  return String(cell.v)
}

function parseSheet(name, ws, maxCells) {
  var ref = ws && ws['!ref']
  var empty = {
    name: name,
    rows: [],
    rowCount: 0,
    colCount: 0,
    merges: [],
    colWidths: [],
    rowHeights: [],
    truncated: false
  }

  if (!ref) return empty

  var range = self.XLSX.utils.decode_range(ref)
  var totalRows = range.e.r - range.s.r + 1
  var colCount = range.e.c - range.s.c + 1
  var rowCount = totalRows
  var truncated = false

  if (rowCount * colCount > maxCells) {
    truncated = true
    rowCount = Math.max(1, Math.floor(maxCells / Math.max(1, colCount)))
  }

  var rows = []
  for (var r = 0; r < rowCount; r += 1) {
    var row = []
    for (var c = 0; c < colCount; c += 1) {
      var cell = ws[self.XLSX.utils.encode_cell({ r: range.s.r + r, c: range.s.c + c })]
      row.push(toText(cell))
    }
    rows.push(row)
  }

  var merges = (ws['!merges'] || []).map(function (merge) {
    return {
      s: { r: merge.s.r - range.s.r, c: merge.s.c - range.s.c },
      e: { r: merge.e.r - range.s.r, c: merge.e.c - range.s.c }
    }
  })

  var cols = ws['!cols'] || []
  var colWidths = []
  for (var i = 0; i < colCount; i += 1) {
    var col = cols[i]
    colWidths.push(col && col.wch ? Math.max(40, Math.min(400, col.wch * 8 + 8)) : 0)
  }

  var rowsMeta = ws['!rows'] || []
  var rowHeights = []
  for (var j = 0; j < rowCount; j += 1) {
    var meta = rowsMeta[j]
    rowHeights.push(meta && meta.hpt ? Math.max(18, Math.min(200, meta.hpt * 1.333)) : 0)
  }

  return {
    name: name,
    rows: rows,
    rowCount: rowCount,
    colCount: colCount,
    merges: merges,
    colWidths: colWidths,
    rowHeights: rowHeights,
    truncated: truncated
  }
}

self.onmessage = function (event) {
  var data = event.data || {}

  if (data.type !== 'parse') return

  try {
    var payload = data.payload || {}

    if (!self.XLSX) {
      if (!payload.scriptUrl) throw new Error('缺少 SheetJS 脚本地址')
      importScripts(payload.scriptUrl)
    }

    var workbook = self.XLSX.read(new Uint8Array(payload.buffer), {
      type: 'array',
      cellDates: false,
      cellHTML: false,
      cellNF: false,
      cellStyles: false
    })
    var sheets = workbook.SheetNames.map(function (name) {
      return parseSheet(name, workbook.Sheets[name], payload.maxCells || 200000)
    })

    self.postMessage({ id: data.id, type: 'result', payload: { sheets: sheets } })
  } catch (error) {
    self.postMessage({
      id: data.id,
      type: 'error',
      error: (error && error.message) || String(error)
    })
  }
}
`
