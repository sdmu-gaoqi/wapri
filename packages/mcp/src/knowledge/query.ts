import { defaultSearchLimit, maxSearchLimit, maxSymbolMatches, searchContextLines } from '../constant/index.js'
import { commonPrefixLength, getBaseName, normalizeName, toKebab } from './naming.js'
import type { KnowledgeIndex } from './load.js'
import type { CodeMatch, DemoEntry, DocEntry, FileEntry, PackageInfo, SymbolMatch } from '../types/index.js'

/** 组件名 / 包名解析结果：`doc` 为空时要给用户候选。 */
export interface DocLookup {
  doc?: DocEntry
  candidates: DocEntry[]
}

/** 文件读取结果：路径越界或不存在时 `error` 有值，同时给出候选路径。 */
export interface FileLookup {
  file?: FileEntry
  error?: string
  candidates: string[]
}

/** 行区间截取结果。 */
export interface CodeSlice {
  code: string
  startLine: number
  endLine: number
  totalLines: number
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 包名 / 目录名 / 简写都能解析到包：`@wapri/element-pro`、`element-pro`、`@base`。 */
export const resolvePackage = (index: KnowledgeIndex, value: string): PackageInfo | undefined => {
  const target = value.trim()
  const direct = index.packagesByName.get(target) ?? index.packagesByDir.get(target)
  if (direct) return direct
  return index.knowledge.packages.find((item) => item.name.endsWith(`/${target}`))
}

/** 在全部文档里解析组件：kebab、PascalCase、中文标题、包名都支持。 */
export const lookupDoc = (index: KnowledgeIndex, input: string, packageName?: string): DocLookup => {
  const target = input.trim()
  const scopedPackage = packageName ? resolvePackage(index, packageName) : undefined
  const pool = scopedPackage
    ? index.knowledge.docs.filter((doc) => doc.package === scopedPackage.name)
    : index.knowledge.docs

  const packageDoc = pool.find((doc) => !doc.name && index.packagesByName.get(doc.package)?.name === target)
  if (packageDoc) return { doc: packageDoc, candidates: [packageDoc] }

  const kebab = toKebab(target)
  const normalized = normalizeName(target)
  const tiers = [
    pool.filter((doc) => doc.name === kebab),
    pool.filter((doc) => doc.name && normalizeName(doc.name) === normalized),
    pool.filter((doc) => doc.route.endsWith(`/${kebab}`)),
    pool.filter((doc) => normalizeName(doc.title).includes(normalized)),
  ]
  const hit = tiers.find((tier) => tier.length > 0)
  if (hit) return { doc: hit[0], candidates: hit }

  return {
    doc: undefined,
    candidates: pool.filter((doc) => doc.name && normalizeName(doc.name).includes(normalized.slice(0, 3))).slice(0, 8),
  }
}

/** 组件目录的真实路径前缀（大小写取自文件清单，Windows 上也不受盘符影响）。 */
export const componentPrefix = (index: KnowledgeIndex, doc: DocEntry): string => {
  const dir = index.packagesByName.get(doc.package)?.dir ?? ''
  if (!doc.name) return `${dir}/src/`
  const folder = index.knowledge.files
    .filter((file) => file.path.startsWith(`${dir}/src/`))
    .map((file) => file.path.split('/')[2])
    .find((segment) => segment && toKebab(segment) === doc.name)
  return `${dir}/src/${folder ?? doc.name}/`
}

/** 组件目录下的全部源码文件。 */
export const filesOf = (index: KnowledgeIndex, doc: DocEntry): FileEntry[] => {
  const prefix = componentPrefix(index, doc)
  return index.knowledge.files.filter((file) => file.path.startsWith(prefix))
}

/** 某个组件的示例（按文档归属，而不是按目录猜）。 */
export const demosOf = (index: KnowledgeIndex, doc: DocEntry): DemoEntry[] =>
  index.knowledge.demos.filter((item) => item.package === doc.package && item.component === doc.name)

/** 统一成「相对 `packages/`」的写法：去掉 `packages/` 前缀、开头的斜杠与反斜杠。 */
export const normalizeRequestPath = (raw: string): string =>
  raw
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/^packages\//, '')

/** 读取快照里的源码文件，越界路径与不存在的路径都走 `error` + 候选。 */
export const readFileEntry = (index: KnowledgeIndex, rawPath: string): FileLookup => {
  const normalized = normalizeRequestPath(rawPath)
  if (!normalized) {
    return { error: '路径为空，请传相对 packages/ 的路径，例如 element-pro/src/ProTable/index.vue', candidates: [] }
  }
  if (normalized.split('/').includes('..') || normalized.startsWith('/')) {
    return { error: '只允许 packages/ 下的相对路径，路径里不能出现 .. 或以 / 开头。', candidates: [] }
  }

  const file = index.filesByPath.get(normalized)
  if (file) return { file, candidates: [] }

  const baseName = getBaseName(normalized)
  const sameName = index.knowledge.files.filter((item) => getBaseName(item.path) === baseName)
  // 拼错文件名时（utils.ts → utls.ts）按「同扩展名 + 公共前缀」给候选，比只回一句「不存在」有用
  const extension = baseName.includes('.') ? baseName.slice(baseName.lastIndexOf('.')) : ''
  const pool = sameName.length
    ? sameName
    : index.knowledge.files.filter((item) => !extension || item.path.endsWith(extension))
  const candidates = [...pool]
    .sort((a, b) => commonPrefixLength(b.path, normalized) - commonPrefixLength(a.path, normalized))
    .slice(0, 5)
    .map((item) => item.path)

  return { error: `快照里没有 ${normalized}。`, candidates }
}

/** 按行区间截取源码，行号从 1 开始，越界自动收敛。 */
export const sliceLines = (file: FileEntry, startLine?: number, endLine?: number): CodeSlice => {
  const lines = file.code.split('\n')
  const total = lines.length
  const start = Math.min(Math.max(startLine ?? 1, 1), total)
  const end = Math.min(Math.max(endLine ?? total, start), total)
  return { code: lines.slice(start - 1, end).join('\n'), startLine: start, endLine: end, totalLines: total }
}

/** 从声明位置往后找块体结束：优先按大括号配平，没有块体则到分号或行尾。 */
const findBlockEnd = (code: string, from: number): number => {
  const brace = code.indexOf('{', from)
  const semicolon = code.indexOf(';', from)
  if (brace === -1 || (semicolon !== -1 && semicolon < brace)) {
    if (semicolon !== -1) return semicolon + 1
    const newline = code.indexOf('\n', from)
    return newline === -1 ? code.length : newline
  }

  let depth = 0
  let quote: string | null = null
  for (let cursor = brace; cursor < code.length; cursor += 1) {
    const char = code[cursor]
    if (quote) {
      if (char === '\\') {
        cursor += 1
        continue
      }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }
    if (char === '/' && code[cursor + 1] === '/') {
      const newline = code.indexOf('\n', cursor)
      if (newline === -1) return code.length
      cursor = newline
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return cursor + 1
    }
  }
  return code.length
}

const symbolPattern = (name: string): RegExp =>
  new RegExp(
    String.raw`(?:^|\n)[ \t]*(?:export[ \t]+)?(?:declare[ \t]+)?(?:default[ \t]+)?(?:async[ \t]+)?(?:function|const|let|var|class|interface|type|enum)[ \t]+${escapeRegExp(name)}(?![A-Za-z0-9_$])`,
  )

/** 按符号名找声明块（函数 / 常量 / 类 / 接口 / 类型 / 枚举）。 */
export const findSymbols = (index: KnowledgeIndex, name: string, packageName?: string): SymbolMatch[] => {
  const scopedPackage = packageName ? resolvePackage(index, packageName) : undefined
  const pool = scopedPackage
    ? index.knowledge.files.filter((file) => file.package === scopedPackage.name)
    : index.knowledge.files

  const pattern = symbolPattern(name)
  const matches: SymbolMatch[] = []

  for (const file of pool) {
    if (matches.length >= maxSymbolMatches) break
    const found = pattern.exec(file.code)
    if (!found) continue

    const from = found.index + found[0].length
    const end = findBlockEnd(file.code, from)
    const startLine = file.code.slice(0, found.index).split('\n').length
    const endLine = file.code.slice(0, end).split('\n').length
    matches.push({
      path: file.path,
      startLine,
      endLine,
      code: file.code
        .split('\n')
        .slice(startLine - 1, endLine)
        .join('\n'),
    })
  }

  return matches
}

const toMatcher = (query: string): RegExp => {
  const asRegex = /^\/(.+)\/([gimsuy]*)$/.exec(query)
  if (asRegex) return new RegExp(asRegex[1], asRegex[2].replace('g', ''))
  return new RegExp(escapeRegExp(query), 'i')
}

/** 全文搜索：默认不区分大小写的子串匹配，`/正则/` 写法按正则处理。 */
export const searchCode = (
  index: KnowledgeIndex,
  query: string,
  packageName?: string,
  limit?: number,
): { matches: CodeMatch[]; truncated: boolean; matcher: string } => {
  const cap = Math.min(Math.max(limit ?? defaultSearchLimit, 1), maxSearchLimit)
  const scopedPackage = packageName ? resolvePackage(index, packageName) : undefined
  const pool = scopedPackage
    ? index.knowledge.files.filter((file) => file.package === scopedPackage.name)
    : index.knowledge.files

  let matcher: RegExp
  try {
    matcher = toMatcher(query)
  } catch {
    return { matches: [], truncated: false, matcher: query }
  }

  const matches: CodeMatch[] = []
  let truncated = false

  for (const file of pool) {
    if (truncated) break
    const lines = file.code.split('\n')
    let lastMatchedLine = -Infinity
    for (let cursor = 0; cursor < lines.length; cursor += 1) {
      if (!matcher.test(lines[cursor])) continue
      // 连续几行都命中时合并成一条，否则一个 prop 的声明 + 使用会刷满结果
      if (cursor + 1 - lastMatchedLine <= searchContextLines) continue
      if (matches.length >= cap) {
        truncated = true
        break
      }
      lastMatchedLine = cursor + 1
      const from = Math.max(cursor - searchContextLines, 0)
      const to = Math.min(cursor + searchContextLines, lines.length - 1)
      matches.push({
        path: file.path,
        line: cursor + 1,
        snippet: lines
          .slice(from, to + 1)
          .map((text, offset) => `${from + offset + 1 === cursor + 1 ? '>' : ' '} ${text}`)
          .join('\n'),
      })
    }
  }

  return { matches, truncated, matcher: matcher.source }
}
