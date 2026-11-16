/** 知识快照文件名，由 `scripts/gen-knowledge.mjs` 生成到 `dist/` 下。 */
export const knowledgeFileName = 'knowledge.json'
/** 可用环境变量覆盖快照路径，便于本地调试。 */
export const knowledgePathEnv = 'WAPRI_MCP_KNOWLEDGE'
/** 日志前缀，所有日志只写 stderr，避免污染 stdio 协议流。 */
export const logPrefix = '[wapri-mcp]'
/** 全文搜索默认返回条数。 */
export const defaultSearchLimit = 20
/** 全文搜索最多返回条数。 */
export const maxSearchLimit = 100
/** 全文搜索命中行上下各带的上下文行数。 */
export const searchContextLines = 2
/** 按符号查实现时最多返回的命中块数。 */
export const maxSymbolMatches = 5
/** 文档分段时最多回落的候选标题数。 */
export const maxSectionCandidates = 6
/** 路径参数统一相对仓库的 `packages/` 目录。 */
export const pathPrefixHint = 'packages/'
/** `engines.node` 的下限主版本，低于此版本直接退出。 */
export const minNodeMajor = 20
/** 工具返回里「下一步」提示的统一前缀。 */
export const nextStepHint = '下一步可调用'
/** 文档分段关键词：`section` 对应标题里可能出现的关键词。 */
export const docSectionKeywords = {
  props: ['props', '属性', 'api', '参数'],
  events: ['events', '事件'],
  slots: ['slots', '插槽'],
  examples: ['用法', '示例', 'demo', '基础'],
  notes: ['说明', '注意', '限制', '常见问题', 'faq'],
} as const

/**
 * Server 级说明（MCP `initialize` 的 instructions）。
 * 客户端会把这段文字直接塞进模型上下文，写清「先查再写」的顺序，避免模型凭记忆臆造 API。
 */
export const serverInstructions = [
  'wapri 组件库（@wapri/*）的离线知识库，只读。',
  '回答用法前：先 list_components 确认组件名，再用 get_component_document 读文档、get_component_demo 看示例源码；',
  '需要实现细节时用 get_component_files / get_file_code / get_function_code / search_code。',
  '返回结果都带包名与版本：若与项目 package.json 里的版本不一致，请提醒用户知识可能滞后。',
  '不要臆造文档里没有的 props、事件或插槽。',
].join(' ')
