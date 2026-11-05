#!/usr/bin/env node
/**
 * 清空当前包的 dist 目录。
 *
 * father / vite 构建时不会删除输出目录里已不存在的旧文件，源码删掉的模块会继续留在 dist，
 * 并被 `files: ["dist"]` 一起发到 npm。每个包的 build 脚本都先跑这个脚本，保证产物只包含当前源码。
 */

import { rmSync } from 'node:fs'
import path from 'node:path'

const distDir = path.join(process.cwd(), 'dist')

rmSync(distDir, { recursive: true, force: true })
console.log(`[clean-dist] removed ${distDir}`)
