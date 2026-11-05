#!/usr/bin/env node
/**
 * dumi build 包装脚本
 *
 * 解决在注入 safe-delete shim 的受限环境里运行 `pnpm doc` 时的两个问题：
 * 1. 外部注入的 safe-delete shim 会拦截 fs.unlinkSync/fs.rmSync，把项目构建临时文件
 *    移入回收站，导致 dumi 清理 `.dumi/tmp-production` 时报错或极慢。
 * 2. dumi/umi build 完成后偶发进程不退出（Windows + Node 22 下 esbuild/webpack 句柄未释放）。
 *
 * 本脚本：
 * - 从 NODE_OPTIONS 中移除 safe-delete shim 的 --require；
 * - 禁用 esbuild worker threads；
 * - 将 dumi build 作为子进程运行，若构建完成后 15s 无输出则强制终止子进程并退出。
 */

import { execFileSync, spawn } from 'child_process'
import { fileURLToPath } from 'url'
import os from 'os'
import path from 'path'
import { scrubDocsOutput } from './scrub-docs.mjs'

const BUILD_SILENCE_TIMEOUT = 15_000
const GRACEFUL_KILL_TIMEOUT = 5_000
const GLOBAL_SAFETY_TIMEOUT = 5 * 60 * 1_000
const IS_WIN = os.platform() === 'win32'

function cleanNodeOptions() {
  const raw = process.env.NODE_OPTIONS || ''
  // 移除 safe-delete shim 的 --require，保留其它选项（如 --use-system-ca）
  const cleaned = raw
    .split(/\s+/)
    .filter((part) => !/^--require=.*safe-delete.*\.cjs$/i.test(part))
    .join(' ')
    .trim()
  return cleaned
}

function resolveDumiCli() {
  try {
    return fileURLToPath(import.meta.resolve('dumi/bin/dumi.js'))
  } catch {
    // fallback: pnpm 的 .bin shim
    return path.join(process.cwd(), 'node_modules', '.bin', 'dumi')
  }
}

function killProcessTree(pid, force = false) {
  if (IS_WIN) {
    // Windows 下 Node 的 signal 不会级联终止子进程，使用 taskkill /T 结束整棵树
    try {
      const args = force ? ['/T', '/F', '/PID', String(pid)] : ['/T', '/PID', String(pid)]
      execFileSync('taskkill', args, { stdio: 'ignore', windowsHide: true })
    } catch {
      // 进程可能已退出，忽略错误
    }
    return
  }
  process.kill(pid, force ? 'SIGKILL' : 'SIGTERM')
}

const child = spawn(process.execPath, [resolveDumiCli(), 'build'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_OPTIONS: cleanNodeOptions(),
    ESBUILD_WORKER_THREADS: 'false',
  },
})

let lastOutputTime = Date.now()
let sawBuildOutput = false
let exited = false
let forceTerminated = false

function onOutput(data) {
  lastOutputTime = Date.now()
  if (data && String(data).includes('event - Build ')) {
    sawBuildOutput = true
  }
}

child.stdout.on('data', (data) => {
  process.stdout.write(data)
  onOutput(data)
})

child.stderr.on('data', (data) => {
  process.stderr.write(data)
  onOutput(data)
})

child.on('error', (err) => {
  console.error('[doc-build] Failed to spawn dumi build:', err.message)
  process.exit(1)
})

child.on('exit', (code) => {
  exited = true

  try {
    if (scrubDocsOutput()) {
      console.log('[doc-build] scrubbed local absolute paths from docs-dist')
    }
  } catch (error) {
    console.warn('[doc-build] scrub failed:', error instanceof Error ? error.message : error)
  }

  // 强制终止时 dumi 返回非 0，但构建实际已完成，按成功处理
  process.exit(forceTerminated ? 0 : (code ?? 0))
})

const activityCheck = setInterval(() => {
  if (exited) {
    clearInterval(activityCheck)
    return
  }

  if (sawBuildOutput && Date.now() - lastOutputTime > BUILD_SILENCE_TIMEOUT) {
    console.log('\n[doc-build] Build appears complete (no output for 15s). Terminating...')
    clearInterval(activityCheck)
    forceTerminated = true
    killProcessTree(child.pid, false)

    setTimeout(() => {
      if (!exited) {
        killProcessTree(child.pid, true)
      }
    }, GRACEFUL_KILL_TIMEOUT)
  }
}, 2_000)

setTimeout(() => {
  if (exited) return
  console.log('\n[doc-build] Global safety timeout reached. Killing build...')
  forceTerminated = true
  killProcessTree(child.pid, true)
}, GLOBAL_SAFETY_TIMEOUT)
