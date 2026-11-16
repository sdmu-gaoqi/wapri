/** 快照里的包元信息。 */
export interface PackageInfo {
  /** 包名，如 `@wapri/element-pro` */
  name: string
  version: string
  description: string
  /** `packages/` 下的目录名，如 `element-pro`、`@base` */
  dir: string
  /** 包入口，如 `dist/index.mjs` */
  entry: string
}

/** 文档里引用的一个示例。 */
export interface DocDemo {
  /** demo 文件名（不含 `.vue`），如 `basic` */
  demo: string
  /** 文档里 `<code src title>` 给出的标题，可能为空串 */
  title: string
  /** 相对 `packages/` 的路径 */
  path: string
}

/** `src/**\/index.md` 对应的一篇文档。 */
export interface DocEntry {
  /** 所属包名 */
  package: string
  /** kebab 目录名，如 `drag-sort-table`；包级文档为空串 */
  name: string
  /** 文档一级标题 */
  title: string
  /** 文档站路由，如 `/element-pros/drag-sort-table` */
  route: string
  /** Markdown 原文 */
  markdown: string
  demos: DocDemo[]
}

/** `demo/*.vue` 的源码快照。 */
export interface DemoEntry {
  package: string
  /** 所属组件（文档名，包级示例为空串） */
  component: string
  demo: string
  title: string
  path: string
  code: string
}

/** 源码文件快照。 */
export interface FileEntry {
  package: string
  /** 相对 `packages/` 的路径，如 `element-pro/src/ProTable/index.vue` */
  path: string
  /** 扩展名（不含点），如 `ts` / `vue` / `scss` / `md` */
  kind: string
  lines: number
  code: string
}

/** `dist/knowledge.json` 的结构，由 `scripts/gen-knowledge.mjs` 生成。 */
export interface Knowledge {
  server: { name: string; version: string }
  /** 快照生成时间（ISO 8601） */
  generatedAt: string
  packages: PackageInfo[]
  docs: DocEntry[]
  demos: DemoEntry[]
  files: FileEntry[]
}

/** 工具的文本返回体，`register.ts` 负责转成 MCP 的 `CallToolResult`。 */
export interface ToolText {
  text: string
  isError?: boolean
}

/** 文档分段参数。 */
export type DocSection = 'all' | 'props' | 'events' | 'slots' | 'examples' | 'notes'

/** 按符号名命中的实现块。 */
export interface SymbolMatch {
  path: string
  startLine: number
  endLine: number
  code: string
}

/** 全文搜索命中的一处。 */
export interface CodeMatch {
  path: string
  line: number
  /** 命中行 + 上下文的原文 */
  snippet: string
}
