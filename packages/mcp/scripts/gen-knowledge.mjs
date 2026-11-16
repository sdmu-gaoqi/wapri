#!/usr/bin/env node
/**
 * 生成 MCP 的知识快照：`dist/knowledge.json`。
 *
 * MCP Server 发布后跑在业务项目里，读不到本仓库的 `packages/`，所以要在构建期把
 * 文档（`src/**\/index.md`）、示例（`demo/*.vue`）和源码一起快照进 `dist`，随包发布。
 * 这样 `npx @wapri/mcp` 在任何机器上都能离线应答，知识与发布版本一一对应。
 *
 * 输出结构见 `src/types/index.ts` 的 `Knowledge`。
 */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../../..')
const packagesDir = path.join(repoRoot, 'packages')
const outFile = path.resolve(import.meta.dirname, '../dist/knowledge.json')
const selfPackage = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf8'))

/** 收进快照的源码类型：组件、脚本、样式与文档。图片等二进制不进。 */
const sourceExtensions = new Set(['.ts', '.tsx', '.vue', '.scss', '.md'])
/** 这些目录里的内容不进快照。 */
const ignoredDirs = new Set(['node_modules', 'dist', '.turbo', '__tests__', 'coverage'])

const toPosix = (value) => value.split(path.sep).join('/')

const kebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()

/** dumi 按 `atomDirs.type` 复数化路由：结尾已有 s 的原样，其余加 s。 */
const pluralize = (type) => (type.endsWith('s') ? type : `${type}s`)

/** `packages/@base` 的文档路由类型是 `base`，其余与目录同名。 */
const docTypeOf = (dirName) => (dirName === '@base' ? 'base' : dirName)

const countLines = (code) => (code ? code.split('\n').length : 0)

const walk = (dir, visit) => {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      if (!ignoredDirs.has(item.name)) walk(full, visit)
      continue
    }
    visit(full)
  }
}

const readTitle = (markdown, fallback) => {
  const heading = /^#\s+(.+)$/m.exec(markdown)
  return heading ? heading[1].trim() : fallback
}

/** 从文档里的 `<code src="./demo/x.vue" title="…">` 解析示例标题。 */
const readDemoTitles = (markdown) => {
  const titles = new Map()
  const pattern = /<code\s+src="\.\/demo\/([^"]+)"(?:\s+title="([^"]*)")?/g
  for (const match of markdown.matchAll(pattern)) {
    titles.set(match[1], match[2] ?? '')
  }
  return titles
}

const packages = []
const docs = []
const demos = []
const files = []

for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue

  const dirName = entry.name
  const packageDir = path.join(packagesDir, dirName)
  const srcDir = path.join(packageDir, 'src')

  let manifest
  try {
    manifest = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
  } catch {
    continue
  }
  try {
    if (!statSync(srcDir).isDirectory()) continue
  } catch {
    continue
  }

  packages.push({
    name: manifest.name,
    version: manifest.version ?? '0.0.0',
    description: manifest.description ?? '',
    dir: dirName,
    entry: manifest.module ?? manifest.main ?? 'dist/index.js',
  })

  const routeBase = pluralize(docTypeOf(dirName))
  /** 文档目录（相对 `src`，`.` 表示包根）到文档条目的映射，供示例归组。 */
  const docByDir = new Map()
  const sourceEntries = []

  walk(srcDir, (fullPath) => {
    if (!sourceExtensions.has(path.extname(fullPath))) return
    sourceEntries.push({ fullPath, inSrc: toPosix(path.relative(srcDir, fullPath)) })
  })

  // 第一遍：源码快照 + 文档
  for (const { fullPath, inSrc } of sourceEntries) {
    const code = readFileSync(fullPath, 'utf8')
    files.push({
      package: manifest.name,
      path: `${dirName}/src/${inSrc}`,
      kind: path.extname(fullPath).slice(1),
      lines: countLines(code),
      code,
    })

    const isIndexDoc = inSrc === 'index.md' || inSrc.endsWith('/index.md')
    if (!isIndexDoc) continue

    const docDir = path.posix.dirname(inSrc)
    const isPackageDoc = docDir === '.'
    const name = isPackageDoc ? '' : kebabCase(path.posix.basename(docDir))
    const doc = {
      package: manifest.name,
      name,
      title: readTitle(code, isPackageDoc ? manifest.name : name),
      route: isPackageDoc ? `/${routeBase}` : `/${routeBase}/${name}`,
      markdown: code,
      demos: [],
    }
    docByDir.set(docDir, doc)
    docs.push(doc)
  }

  // 第二遍：示例文件按所属文档目录归组
  for (const { fullPath, inSrc } of sourceEntries) {
    const segments = inSrc.split('/')
    const demoIndex = segments.indexOf('demo')
    if (demoIndex === -1 || path.extname(fullPath) !== '.vue') continue

    const doc = docByDir.get(demoIndex === 0 ? '.' : segments.slice(0, demoIndex).join('/'))
    if (!doc) continue

    const fileName = segments[segments.length - 1]
    const demoName = fileName.replace(/\.vue$/, '')
    const demoPath = `${dirName}/src/${inSrc}`
    const title = readDemoTitles(doc.markdown).get(fileName) ?? ''

    demos.push({
      package: doc.package,
      component: doc.name,
      demo: demoName,
      title,
      path: demoPath,
      code: readFileSync(fullPath, 'utf8'),
    })
    doc.demos.push({ demo: demoName, title, path: demoPath })
  }
}

packages.sort((a, b) => a.dir.localeCompare(b.dir))
docs.sort((a, b) => `${a.package}/${a.name}`.localeCompare(`${b.package}/${b.name}`))
demos.sort((a, b) => `${a.package}/${a.component}/${a.demo}`.localeCompare(`${b.package}/${b.component}/${b.demo}`))

const knowledge = {
  server: { name: selfPackage.name, version: selfPackage.version },
  generatedAt: new Date().toISOString(),
  packages,
  docs,
  demos,
  files,
}

mkdirSync(path.dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(knowledge))

const sizeMb = (statSync(outFile).size / 1024 / 1024).toFixed(2)
console.log(
  `[gen-knowledge] ${packages.length} 个包 / ${docs.length} 篇文档 / ${demos.length} 个示例 / ${files.length} 个文件 -> ${path.relative(repoRoot, outFile)} (${sizeMb} MB)`,
)
