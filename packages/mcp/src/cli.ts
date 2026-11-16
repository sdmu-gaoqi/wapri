#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { logPrefix, minNodeMajor } from './constant/index.js'
import { createServer } from './server.js'

const nodeMajor = Number(process.versions.node.split('.')[0])

if (nodeMajor < minNodeMajor) {
  console.error(`${logPrefix} 需要 Node >= ${minNodeMajor}，当前是 ${process.versions.node}，请升级后重试。`)
  process.exit(1)
}

/**
 * stdio 模式下 stdout 就是 MCP 协议流，任何业务日志都必须走 stderr，
 * 否则客户端会解析到非 JSON 内容并断开连接。
 */
const main = async (): Promise<void> => {
  const server = createServer()
  await server.connect(new StdioServerTransport())
  console.error(`${logPrefix} ready · stdio · 7 个只读工具`)
}

process.on('uncaughtException', (error) => {
  console.error(`${logPrefix} uncaughtException:`, error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error(`${logPrefix} unhandledRejection:`, reason)
  process.exit(1)
})

main().catch((error: unknown) => {
  console.error(`${logPrefix} 启动失败：${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
