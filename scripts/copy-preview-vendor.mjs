/**
 * 把 pdf.js worker 与 SheetJS UMD 复制进 dist/vendor。
 *
 * 预览包不把这两个大文件打进 npm 入口，但仍需随包发布，方便默认情况下无需额外配置即可工作。
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const vendorDir = path.join(root, 'dist', 'vendor')

const VENDOR_FILES = [
  ['node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
  ['node_modules/xlsx/dist/xlsx.full.min.js', 'xlsx.full.min.js'],
]

mkdirSync(vendorDir, { recursive: true })

for (const [from, to] of VENDOR_FILES) {
  const source = path.join(root, from)

  if (!existsSync(source)) {
    console.warn(`[preview] 跳过缺失的 vendor 文件：${from}`)
    continue
  }

  cpSync(source, path.join(vendorDir, to))
  console.log(`[preview] vendor 已复制：${to}`)
}
