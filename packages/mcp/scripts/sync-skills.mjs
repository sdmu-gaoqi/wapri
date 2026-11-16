#!/usr/bin/env node
/**
 * 把文档站的技能包同步进本包。
 *
 * 技能文案的唯一来源是仓库根的 `public/skills/wapri-design/`：
 * - 文档站 `/mcps` 的「添加到我的项目」面板直接从站点静态目录读取，写进用户项目；
 * - npm 包在构建时把它拷贝一份到 `skills/`，随包发布（`files` 里已声明）。
 * 这样面板和 npm 包不会各维护一份文案。
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../../..')
const source = path.join(repoRoot, 'public/skills/wapri-design')
const target = path.resolve(import.meta.dirname, '../skills/wapri-design')

if (!existsSync(source)) {
  console.error(`[sync-skills] 找不到技能目录 ${source}`)
  process.exit(1)
}

const dirName = path.basename(target)
const parent = path.dirname(target)

rmSync(parent, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })
console.log(`[sync-skills] public/skills/${dirName} -> skills/${dirName}`)
