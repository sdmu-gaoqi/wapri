#!/usr/bin/env node
/**
 * dumi build 包装脚本：构建完成后主动退出。
 *
 * 背景：dumi(umi) 把 `event - Build xxx.html` 全部输出完之后，进程不会自己退出
 * （bundler / worker 的句柄没有释放），本地 `pnpm doc` 与 GitHub Actions 都会一直挂住。
 * 这里在「docs-dist 文件数连续稳定」且「输出已静止」之后认定构建完成，结束子进程并按成功退出；
 * 构建真失败时子进程会以非 0 退出，照常透传。
 *
 * 用法：pnpm doc（等价于 node scripts/doc-build.mjs）
 */

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

/** 产物目录，与 .dumirc.ts 的 outputPath 保持一致 */
const OUTPUT_DIR = path.join(process.cwd(), 'docs-dist')
/** 文件数连续不变多久算写完 */
const STABLE_MS = 15_000
/** 多久没有新输出算构建静止 */
const QUIET_MS = 5_000
/** 兜底超时，超时按失败退出 */
const TIMEOUT_MS = 15 * 60_000
/** 优雅结束后多久强杀 */
const KILL_GRACE_MS = 5_000

const require = createRequire(import.meta.url)

/** 定位 dumi 的 bin，找不到时退回 pnpm 的 .bin shim */
function resolveDumiBin() {
  try {
    const pkgPath = require.resolve('dumi/package.json')
    const { bin } = require(pkgPath)
    const entry = typeof bin === 'string' ? bin : bin?.dumi

    if (entry) return path.resolve(path.dirname(pkgPath), entry)
  } catch {
    // 依赖未安装或结构非标准，走下面的 fallback
  }

  return path.join(process.cwd(), 'node_modules', '.bin', 'dumi')
}

/** 递归统计产物文件数，用来判断构建是否已经写完 */
function countFiles(dir) {
  if (!existsSync(dir)) return 0

  let total = 0

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1
  }

  return total
}

/** 结束子进程树：POSIX 走进程组，Windows 走 taskkill /T */
function killTree(pid, force) {
  if (!pid) return

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/PID', String(pid), '/T', ...(force ? ['/F'] : [])], {
        stdio: 'ignore',
        windowsHide: true,
      })
    } catch {
      // 进程可能已经退出
    }

    return
  }

  try {
    process.kill(-pid, force ? 'SIGKILL' : 'SIGTERM')
  } catch {
    // 进程组可能已经退出
  }
}

const startedAt = Date.now()

/** 先清空产物：上一次构建遗留的文件会让「文件数稳定」的判定提前成立 */
rmSync(OUTPUT_DIR, { recursive: true, force: true })

const child = spawn(process.execPath, [resolveDumiBin(), 'build'], {
  cwd: process.cwd(),
  detached: process.platform !== 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
})

let exited = false
/** 判完「构建完成」后进入收尾，此时子进程被主动结束，退出码不再代表失败 */
let finishing = false
let lastOutputAt = Date.now()
let lastCount = -1
let stableSince = 0
let sawBuildEvent = false

const elapsed = () => ((Date.now() - startedAt) / 1000).toFixed(1)

function onOutput(data) {
  lastOutputAt = Date.now()
  if (String(data).includes('event - Build ')) sawBuildEvent = true
}

child.stdout.on('data', (data) => {
  process.stdout.write(data)
  onOutput(data)
})

child.stderr.on('data', (data) => {
  process.stderr.write(data)
  onOutput(data)
})

child.on('error', (error) => {
  console.error(`[doc-build] 无法启动 dumi：${error.message}`)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  exited = true

  if (finishing) {
    console.log(`[doc-build] 构建完成，用时 ${elapsed()}s，产物 ${countFiles(OUTPUT_DIR)} 个文件`)
    process.exit(0)
  }

  if (code === 0) {
    console.log(`[doc-build] 构建完成，用时 ${elapsed()}s，产物 ${countFiles(OUTPUT_DIR)} 个文件`)
    process.exit(0)
  }

  console.error(`[doc-build] 构建失败：code=${code} signal=${signal}，用时 ${elapsed()}s`)
  process.exit(code ?? 1)
})

/** 每秒检查一次：文件数不再增长 + 输出静止，就认为构建已经写完 */
const timer = setInterval(() => {
  if (exited || finishing) return

  if (Date.now() - startedAt > TIMEOUT_MS) {
    console.error(`[doc-build] 超过 ${TIMEOUT_MS / 60_000} 分钟仍未完成，终止构建`)
    killTree(child.pid, true)
    return
  }

  const count = countFiles(OUTPUT_DIR)

  if (count > 0 && count === lastCount) {
    stableSince ||= Date.now()
  } else {
    stableSince = 0
  }

  lastCount = count

  const stableFor = stableSince ? Date.now() - stableSince : 0
  const quietFor = Date.now() - lastOutputAt

  if (!sawBuildEvent || count === 0 || stableFor < STABLE_MS || quietFor < QUIET_MS) return

  finishing = true
  clearInterval(timer)
  console.log(
    `\n[doc-build] 产物 ${count} 个文件已稳定 ${(stableFor / 1000).toFixed(0)}s，dumi 进程未自行退出（已知句柄未释放），主动结束并按成功处理`,
  )
  killTree(child.pid, false)

  setTimeout(() => {
    killTree(child.pid, true)
    process.exit(0)
  }, KILL_GRACE_MS)
}, 1_000)

/** Ctrl+C 时连带结束 dumi，避免留下孤儿进程 */
process.on('SIGINT', () => {
  killTree(child.pid, true)
  process.exit(130)
})
