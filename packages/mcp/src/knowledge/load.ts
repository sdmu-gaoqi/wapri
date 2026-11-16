import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { knowledgeFileName, knowledgePathEnv, logPrefix } from '../constant/index.js'
import { normalizeName } from './naming.js'
import type { DocEntry, FileEntry, Knowledge, PackageInfo } from '../types/index.js'

/** 进程内的知识索引：原始快照 + 几个按名查找的映射。 */
export interface KnowledgeIndex {
  knowledge: Knowledge
  packagesByName: Map<string, PackageInfo>
  packagesByDir: Map<string, PackageInfo>
  filesByPath: Map<string, FileEntry>
  /** 归一化后的组件名 → 文档（同名组件可能出现在多个包里） */
  docsByName: Map<string, DocEntry[]>
  /** 生成时间，展示用 `YYYY-MM-DD HH:mm UTC` */
  generatedAtLabel: string
}

let cached: KnowledgeIndex | undefined

const buildIndex = (knowledge: Knowledge): KnowledgeIndex => {
  const packagesByName = new Map(knowledge.packages.map((item) => [item.name, item]))
  const packagesByDir = new Map(knowledge.packages.map((item) => [item.dir, item]))
  const filesByPath = new Map(knowledge.files.map((item) => [item.path, item]))
  const docsByName = new Map<string, DocEntry[]>()

  for (const doc of knowledge.docs) {
    const key = normalizeName(doc.name || doc.title)
    const bucket = docsByName.get(key)
    if (bucket) bucket.push(doc)
    else docsByName.set(key, [doc])
  }

  return {
    knowledge,
    packagesByName,
    packagesByDir,
    filesByPath,
    docsByName,
    generatedAtLabel: `${knowledge.generatedAt.slice(0, 16).replace('T', ' ')} UTC`,
  }
}

/**
 * 读取构建期生成的 `dist/knowledge.json`。
 *
 * 只读一次并缓存；`WAPRI_MCP_KNOWLEDGE` 可指向别的快照，方便本地调试生成脚本。
 */
export const loadKnowledgeIndex = (): KnowledgeIndex => {
  if (cached) return cached

  const file = process.env[knowledgePathEnv]
    ? process.env[knowledgePathEnv]
    : fileURLToPath(new URL(`../${knowledgeFileName}`, import.meta.url))

  let raw: string
  try {
    raw = readFileSync(file as string, 'utf8')
  } catch {
    throw new Error(
      `${logPrefix} 找不到知识快照 ${file}。在仓库里请先执行 pnpm --filter @wapri/mcp build 生成 dist/${knowledgeFileName}。`,
    )
  }

  cached = buildIndex(JSON.parse(raw) as Knowledge)
  return cached
}
