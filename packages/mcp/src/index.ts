export { createServer } from './server.js'
export { registerTools } from './tools/register.js'
export { loadKnowledgeIndex } from './knowledge/load.js'
export type { KnowledgeIndex } from './knowledge/load.js'
export type {
  CodeMatch,
  DemoEntry,
  DocDemo,
  DocEntry,
  DocSection,
  FileEntry,
  Knowledge,
  PackageInfo,
  SymbolMatch,
  ToolText,
} from './types/index.js'
