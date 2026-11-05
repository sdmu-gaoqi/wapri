/**
 * 清理文档站产物里的本机绝对路径。
 *
 * dumi 会把 demo 文件的绝对路径写进产物（`meta__packages.*.async.js`），
 * 直接把构建机的目录结构发到公网。这里统一替换成空串，产物里只保留仓库内的相对结构。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const TEXT_EXTENSIONS = ['.html', '.js', '.json', '.css', '.txt']

/** 收集需要替换的路径写法：正反斜杠、双反斜杠转义、盘符大小写。 */
export function buildPathReplacements(cwd = process.cwd()) {
  const bases = [cwd, cwd.replace(/\\/g, '/'), cwd.replace(/\\/g, '\\\\')]
  const variants = new Set(bases)

  for (const value of bases) {
    if (/^[a-zA-Z]:/.test(value)) variants.add(value[0].toLowerCase() + value.slice(1))
  }

  return [...variants].sort((a, b) => b.length - a.length)
}

export function scrubAbsolutePaths(dir, replacements = buildPathReplacements()) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      scrubAbsolutePaths(full, replacements)
      continue
    }

    if (!TEXT_EXTENSIONS.some((ext) => full.endsWith(ext))) continue

    const raw = readFileSync(full, 'utf8')
    let next = raw

    for (const from of replacements) {
      next = next.split(from).join('')
    }

    if (next !== raw) writeFileSync(full, next)
  }
}

/** 清理整个文档站产物目录；目录不存在时直接返回。 */
export function scrubDocsOutput(dir = path.join(process.cwd(), 'docs-dist')) {
  if (!existsSync(dir)) return 0

  scrubAbsolutePaths(dir, buildPathReplacements())

  return 1
}
