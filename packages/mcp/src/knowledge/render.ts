import {
  docSectionKeywords,
  maxSectionCandidates,
  maxSymbolMatches,
  nextStepHint,
  searchContextLines,
} from '../constant/index.js'
import type { KnowledgeIndex } from './load.js'
import {
  demosOf,
  filesOf,
  findSymbols,
  lookupDoc,
  readFileEntry,
  searchCode,
  sliceLines,
  componentPrefix,
  resolvePackage,
} from './query.js'
import type { DocEntry, PackageInfo, ToolText } from '../types/index.js'

const codeFence = (kind: string): string => (kind === 'md' ? 'md' : kind)

/** 结果头部：快照时间 + 相关包版本，方便 AI 判断知识是否与项目版本一致。 */
const stamp = (index: KnowledgeIndex, packageNames: string[] = []): string => {
  const names = [...new Set(packageNames)]
  const packages = names
    .map((name) => index.packagesByName.get(name))
    .filter((item): item is PackageInfo => Boolean(item))
    .map((item) => `${item.name}@${item.version}`)

  const scope = packages.length ? ` · ${packages.join(' · ')}` : ''
  return `wapri 知识快照（${index.generatedAtLabel}）${scope}`
}

const unknownDoc = (index: KnowledgeIndex, input: string, candidates: DocEntry[]): ToolText => {
  const names = candidates.map((doc) => (doc.name ? `${doc.name}（${doc.title}）` : doc.package))
  return {
    isError: true,
    text: [
      `没找到组件「${input}」。`,
      names.length ? `可能是这些之一：${names.join('、')}` : '可以先调用 list_components 看全部组件。',
    ].join('\n'),
  }
}

/** `list_components`：按包分组的组件总览。 */
export const renderComponentList = (index: KnowledgeIndex, keyword?: string, packageName?: string): ToolText => {
  const resolved = packageName ? resolvePackage(index, packageName) : undefined
  const scoped = packageName ? (resolved ? [resolved] : []) : index.knowledge.packages

  if (!scoped.length) {
    return {
      isError: true,
      text: `没有这个包：${packageName}。可用的包：${index.knowledge.packages.map((item) => item.name).join('、')}`,
    }
  }

  const needle = keyword?.trim().toLowerCase()
  const sections: string[] = []
  let matched = 0

  for (const pkg of scoped) {
    const docs = index.knowledge.docs.filter((doc) => {
      if (doc.package !== pkg.name || !doc.name) return false
      if (!needle) return true
      return doc.name.includes(needle) || doc.title.toLowerCase().includes(needle)
    })
    if (!docs.length) continue

    matched += docs.length
    const lines = docs.map((doc) => {
      const demoCount = demosOf(index, doc).length
      return `- ${doc.name} · ${doc.title} · ${doc.route} · ${demoCount} 个示例`
    })
    sections.push([`## ${pkg.name}@${pkg.version}`, pkg.description, ...lines].filter(Boolean).join('\n'))
  }

  if (!matched) {
    return {
      isError: true,
      text: `没有匹配「${keyword}」的组件。可以先不传 keyword 列出全部组件，或用 search_code 按代码内容搜索。`,
    }
  }

  return {
    text: [
      `${stamp(index)} · 共 ${index.knowledge.packages.length} 个包 / ${index.knowledge.docs.length} 篇文档`,
      '',
      ...sections,
      '',
      `${nextStepHint} get_component_document({ name }) 读文档，get_component_demo({ name, demo }) 读示例源码。`,
    ].join('\n'),
  }
}

/** 按 `## ` 二级标题切分文档，选出 `section` 对应的小节。 */
const pickSections = (markdown: string, section: string): { text: string; matchedTitles: string[] } => {
  const keywords = docSectionKeywords[section as keyof typeof docSectionKeywords] ?? []
  const blocks = markdown.split(/\n(?=##\s)/)
  const matched = blocks.filter((block) => {
    const heading = /^##\s+(.+)$/m.exec(block)?.[1]?.toLowerCase() ?? ''
    return keywords.some((word) => heading.includes(word))
  })
  return {
    text: matched.join('\n\n'),
    matchedTitles: matched.map((block) => /^##\s+(.+)$/m.exec(block)?.[1] ?? ''),
  }
}

/** `get_component_document`：组件文档正文，可只取某一段。 */
export const renderDocument = (
  index: KnowledgeIndex,
  input: string,
  section?: string,
  packageName?: string,
): ToolText => {
  const { doc, candidates } = lookupDoc(index, input, packageName)
  if (!doc) return unknownDoc(index, input, candidates)

  const header = [
    stamp(index, [doc.package]),
    `文档：${doc.title}${doc.name ? `（${doc.name}）` : '（包级文档）'}`,
    `路由：${doc.route}`,
  ].join('\n')

  const wantSection = section && section !== 'all' ? section : undefined
  let body = doc.markdown
  let note = ''

  if (wantSection) {
    const picked = pickSections(doc.markdown, wantSection)
    if (picked.text.trim()) {
      body = picked.text
    } else {
      const headings = [...doc.markdown.matchAll(/^##\s+(.+)$/gm)].map((item) => item[1])
      note = `文档里没有「${wantSection}」小节，以下为全文。可用的小节：${headings.slice(0, maxSectionCandidates).join('、')}`
    }
  }

  const demoList = doc.demos.length
    ? [
        '## 示例文件',
        ...doc.demos.map((item) => `- ${item.demo}${item.title ? ` · ${item.title}` : ''} · ${item.path}`),
        `${nextStepHint} get_component_demo({ name: "${doc.name}", demo: "${doc.demos[0].demo}" }) 读取示例源码。`,
      ]
    : ['该文档没有配套示例文件。']

  const blocks = [header, note ? `> ${note}` : undefined, body.trim(), ...demoList].filter((block): block is string =>
    Boolean(block),
  )

  return { text: blocks.join('\n\n') }
}

/** `get_component_demo`：不传 `demo` 时列清单，传了给完整源码。 */
export const renderDemo = (index: KnowledgeIndex, input: string, demo?: string, packageName?: string): ToolText => {
  const { doc, candidates } = lookupDoc(index, input, packageName)
  if (!doc) return unknownDoc(index, input, candidates)

  const demos = demosOf(index, doc)
  if (!demos.length) {
    return {
      isError: true,
      text: `${doc.title}（${doc.name || doc.package}）没有示例文件。可以改用 get_component_document 读文档，或 get_component_files 看源码结构。`,
    }
  }

  if (!demo) {
    return {
      text: [
        `${stamp(index, [doc.package])} · ${doc.title} 的示例`,
        '',
        ...demos.map((item) => `- ${item.demo}${item.title ? ` · ${item.title}` : ''} · ${item.path}`),
        '',
        `${nextStepHint} get_component_demo({ name: "${doc.name}", demo: "${demos[0].demo}" }) 读取完整源码。`,
      ].join('\n'),
    }
  }

  const target = demos.find((item) => item.demo === demo) ?? demos.find((item) => item.demo.includes(demo))
  if (!target) {
    return {
      isError: true,
      text: `没有示例「${demo}」。${doc.title} 可用的示例：${demos.map((item) => item.demo).join('、')}`,
    }
  }

  return {
    text: [
      `${stamp(index, [doc.package])} · ${doc.title}${target.title ? ` · ${target.title}` : ''}`,
      `文件：${target.path}`,
      '',
      '```vue',
      target.code.trim(),
      '```',
    ].join('\n'),
  }
}

/** `get_component_files`：组件目录的文件树。 */
export const renderComponentFiles = (index: KnowledgeIndex, input: string, packageName?: string): ToolText => {
  const { doc, candidates } = lookupDoc(index, input, packageName)
  if (!doc) return unknownDoc(index, input, candidates)

  const files = filesOf(index, doc)
  if (!files.length) {
    return { isError: true, text: `${doc.title} 目录下没有可读的源码文件。` }
  }

  const prefix = componentPrefix(index, doc)
  return {
    text: [
      `${stamp(index, [doc.package])} · ${doc.title}`,
      `目录：${prefix}（${files.length} 个文件）`,
      '',
      ...files.map((file) => `- ${file.path} · ${file.kind} · ${file.lines} 行`),
      '',
      `${nextStepHint} get_file_code({ path: "${files[0].path}" }) 读取文件内容，get_function_code({ name }) 按符号名查实现。`,
    ].join('\n'),
  }
}

const missingFile = (path: string, error: string, candidates: string[]): ToolText => ({
  isError: true,
  text: [
    error,
    candidates.length ? `最相近的路径：${candidates.join('、')}` : '可以用 get_component_files 先看目录结构。',
  ].join('\n'),
})

/** `get_file_code`：按路径读源码，可截取行区间。 */
export const renderFileCode = (index: KnowledgeIndex, path: string, startLine?: number, endLine?: number): ToolText => {
  const lookup = readFileEntry(index, path)
  if (!lookup.file) return missingFile(path, lookup.error ?? '读取失败。', lookup.candidates)

  const file = lookup.file
  const sliced = sliceLines(file, startLine, endLine)
  const range = `第 ${sliced.startLine}-${sliced.endLine} 行 / 共 ${sliced.totalLines} 行`

  return {
    text: [
      `${stamp(index, [file.package])}`,
      `文件：${file.path} · ${file.kind} · ${range}`,
      '',
      `\`\`\`${codeFence(file.kind)}`,
      sliced.code,
      '```',
    ].join('\n'),
  }
}

/** `get_function_code`：按符号名找声明块。 */
export const renderSymbols = (index: KnowledgeIndex, name: string, packageName?: string): ToolText => {
  const matches = findSymbols(index, name, packageName)
  if (!matches.length) {
    return {
      isError: true,
      text: [
        `没有找到符号「${name}」的声明（支持 function / const / class / interface / type / enum）。`,
        `可以改用 search_code({ query: "${name}" }) 全文搜索，或 get_component_document 先定位组件。`,
      ].join('\n'),
    }
  }

  const blocks = matches.map((match) =>
    [`### ${match.path} · 第 ${match.startLine}-${match.endLine} 行`, '', '```ts', match.code, '```'].join('\n'),
  )

  return {
    text: [
      `${stamp(index)} · 符号 ${name} 命中 ${matches.length} 处${matches.length >= maxSymbolMatches ? `（最多返回 ${maxSymbolMatches} 处）` : ''}`,
      '',
      ...blocks,
    ].join('\n'),
  }
}

/** `search_code`：全文搜索，带行号与上下文。 */
export const renderSearch = (index: KnowledgeIndex, query: string, packageName?: string, limit?: number): ToolText => {
  const { matches, truncated, matcher } = searchCode(index, query, packageName, limit)
  if (!matches.length) {
    return {
      isError: true,
      text: [
        `没有命中「${query}」。`,
        '可以只传组件名调用 list_components，或换个更短的关键词；`/正则/` 写法按正则处理。',
      ].join('\n'),
    }
  }

  const blocks = matches.map((match) =>
    [`### ${match.path}:${match.line}`, '', '```ts', match.snippet, '```'].join('\n'),
  )

  return {
    text: [
      `${stamp(index)} · 关键词 ${matcher} 命中 ${matches.length} 处${truncated ? '（已截断，可调大 limit 或加 packageName）' : ''}`,
      `上下文：命中行上下各 ${searchContextLines} 行，命中行以 > 标记`,
      '',
      ...blocks,
    ].join('\n'),
  }
}
