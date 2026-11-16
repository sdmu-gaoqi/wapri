import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { loadKnowledgeIndex, type KnowledgeIndex } from '../knowledge/load.js'
import {
  renderComponentFiles,
  renderComponentList,
  renderDemo,
  renderDocument,
  renderFileCode,
  renderSearch,
  renderSymbols,
} from '../knowledge/render.js'
import type { ToolText } from '../types/index.js'

const toResult = (result: ToolText): CallToolResult => ({
  content: [{ type: 'text', text: result.text }],
  ...(result.isError ? { isError: true } : {}),
})

/** 工具内部异常不外抛：转成 AI 能读懂的 isError 文本，协议层保持安静。 */
const run = (exec: () => ToolText): CallToolResult => {
  try {
    return toResult(exec())
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return toResult({ isError: true, text: `工具执行出错：${message}` })
  }
}

/** 全部工具都是只读的，把 annotations 统一声明出来，客户端据此判断可安全并发调用。 */
const readOnly = { readOnlyHint: true, openWorldHint: false } as const

const nameArg = z.string().min(1).describe('组件名，kebab / PascalCase / 文档标题都可以，例如 drag-sort-table')
const packageArg = z.string().optional().describe('限定包，例如 @wapri/element-pro，也可以简写 element-pro')

/**
 * 注册全部只读工具。
 *
 * 工具名与参数是 AI 侧的「公共 API」，改名等于破坏兼容：新增能力优先加可选参数，不要重命名。
 */
export const registerTools = (server: McpServer, index: KnowledgeIndex = loadKnowledgeIndex()): void => {
  server.registerTool(
    'list_components',
    {
      title: '列出组件',
      description:
        '列出 wapri 组件库的全部组件：包名与版本、组件名（kebab-case）、标题、文档路由、示例数量。查任何组件前先调它确认名字；也可按关键词或包筛选。',
      inputSchema: {
        keyword: z.string().optional().describe('按组件名或标题过滤，不区分大小写，例如 table'),
        packageName: packageArg,
      },
      annotations: readOnly,
    },
    ({ keyword, packageName }) => run(() => renderComponentList(index, keyword, packageName)),
  )

  server.registerTool(
    'get_component_document',
    {
      title: '读取组件文档',
      description:
        '读取组件文档正文（Props / Events / Slots / 用法 / 注意事项）。文档末尾会附示例文件清单，示例源码用 get_component_demo 取。',
      inputSchema: {
        name: nameArg,
        section: z
          .enum(['all', 'props', 'events', 'slots', 'examples', 'notes'])
          .optional()
          .describe('只取文档的某一段，默认 all；没有匹配的小节时返回全文并提示可用小节'),
        packageName: packageArg,
      },
      annotations: readOnly,
    },
    ({ name, section, packageName }) => run(() => renderDocument(index, name, section, packageName)),
  )

  server.registerTool(
    'get_component_demo',
    {
      title: '读取组件示例',
      description:
        '读取组件示例。只传 name 时列出示例清单（文件名与文档标题）；再传 demo 时返回完整 .vue 源码。示例通常比文档更能说明真实用法。',
      inputSchema: {
        name: nameArg,
        demo: z.string().optional().describe('示例文件名（不含 .vue），例如 basic；省略则只列清单'),
        packageName: packageArg,
      },
      annotations: readOnly,
    },
    ({ name, demo, packageName }) => run(() => renderDemo(index, name, demo, packageName)),
  )

  server.registerTool(
    'get_component_files',
    {
      title: '列出组件源码文件',
      description:
        '列出组件目录下的源码文件（相对 packages/ 的路径、类型、行数），用于了解组件结构与实现位置，再配合 get_file_code 读具体文件。',
      inputSchema: {
        name: nameArg,
        packageName: packageArg,
      },
      annotations: readOnly,
    },
    ({ name, packageName }) => run(() => renderComponentFiles(index, name, packageName)),
  )

  server.registerTool(
    'get_file_code',
    {
      title: '读取源码文件',
      description:
        '按路径读取源码文件，路径相对仓库的 packages/ 目录，例如 element-pro/src/ProTable/index.vue。可用 startLine / endLine 只取片段；越界路径会被拒绝。',
      inputSchema: {
        path: z.string().min(1).describe('相对 packages/ 的路径，例如 element-pro/src/DragSortTable/index.vue'),
        startLine: z.number().int().min(1).optional().describe('起始行（从 1 开始），默认第 1 行'),
        endLine: z.number().int().min(1).optional().describe('结束行（含），默认文件末尾'),
      },
      annotations: readOnly,
    },
    ({ path, startLine, endLine }) => run(() => renderFileCode(index, path, startLine, endLine)),
  )

  server.registerTool(
    'get_function_code',
    {
      title: '按符号名查实现',
      description:
        '按符号名（function / const / class / interface / type / enum）查完整实现，返回文件路径、行号和代码块。适合已知函数名、类型名时直接读实现。',
      inputSchema: {
        name: z.string().min(1).describe('符号名，例如 getRecordKey'),
        packageName: packageArg,
      },
      annotations: readOnly,
    },
    ({ name, packageName }) => run(() => renderSymbols(index, name, packageName)),
  )

  server.registerTool(
    'search_code',
    {
      title: '全文搜索源码',
      description:
        '在所有源码里全文搜索，返回「路径:行号」与上下文。适合按关键词定位实现（某个 prop、事件名、样式类名前缀）。默认不区分大小写；用 /正则/ 写法按正则匹配。',
      inputSchema: {
        query: z.string().min(1).describe('关键词或 /正则/，例如 dragSortKey'),
        packageName: packageArg,
        limit: z.number().int().min(1).max(100).optional().describe('返回条数上限，默认 20，最多 100'),
      },
      annotations: readOnly,
    },
    ({ query, packageName, limit }) => run(() => renderSearch(index, query, packageName, limit)),
  )
}
