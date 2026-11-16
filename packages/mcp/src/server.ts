import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { serverInstructions } from './constant/index.js'
import { loadKnowledgeIndex } from './knowledge/load.js'
import { registerTools } from './tools/register.js'

/**
 * 创建 MCP Server 实例（不绑定 transport）。
 *
 * `cli.ts` 负责接 stdio；测试或二次封装可以直接拿到实例自己接 transport。
 * 知识快照在这里加载：文件缺失会在创建阶段就抛出明确错误，而不是等第一次调用工具。
 */
export const createServer = (): McpServer => {
  const index = loadKnowledgeIndex()
  const server = new McpServer(
    { name: index.knowledge.server.name, version: index.knowledge.server.version },
    { instructions: serverInstructions },
  )
  registerTools(server, index)
  return server
}
