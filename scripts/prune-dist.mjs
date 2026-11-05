#!/usr/bin/env node
/**
 * 删除构建产物里的示例目录。
 *
 * father 会把 src 下的 demo 目录原样拷进 dist，而 package.json 的 files 只写了 dist，
 * 这些示例就会一起发到 npm。示例只服务文档站（dumi 直接读 src），所以在打包前统一清掉。
 *
 * 用法：
 * - 在某个包目录里执行：只清理该包的 dist；
 * - 在仓库根目录执行：清理 packages 下所有包的 dist。
 */

import { existsSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

function prune(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const full = path.join(dir, entry.name)

    if (entry.name === 'demo') {
      rmSync(full, { recursive: true, force: true })
      continue
    }

    prune(full)
  }
}

function pruneDist(packageDir) {
  const distDir = path.join(packageDir, 'dist')

  if (!existsSync(distDir)) return

  prune(distDir)
  console.log(`[prune-dist] pruned ${path.relative(process.cwd(), distDir) || 'dist'}`)
}

const cwd = process.cwd()
const workspaceDir = path.join(cwd, 'packages')

if (existsSync(path.join(cwd, 'dist'))) {
  pruneDist(cwd)
} else if (existsSync(workspaceDir)) {
  for (const entry of readdirSync(workspaceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    pruneDist(path.join(workspaceDir, entry.name))
  }
}
