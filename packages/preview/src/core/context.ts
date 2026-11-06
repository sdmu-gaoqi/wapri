/**
 * 预览上下文：解析容器、合并主题、注入样式、统一销毁。
 */

import type { BasePreviewOptions, PreviewProgress, PreviewTheme } from '../types/common'
import { DEFAULT_THEME, PREVIEW_CLASS } from '../constant'
import { ensurePreviewStyles } from './style'

export interface PreviewContext {
  readonly container: HTMLElement
  readonly root: HTMLElement
  readonly viewport: HTMLElement
  readonly theme: Required<PreviewTheme>
  readonly options: BasePreviewOptions
  /** 注册销毁回调，按注册顺序逆序执行 */
  onDestroy(callback: () => void): void
  /** 汇报进度 */
  emitProgress(progress: PreviewProgress): void
  /** 渲染错误态 */
  fail(error: unknown): void
  /** 释放容器与全部副作用 */
  destroy(): void
}

export const resolveContainer = (target: HTMLElement | string): HTMLElement => {
  if (typeof target !== 'string') return target

  const element = document.querySelector<HTMLElement>(target)

  if (!element) {
    throw new Error(`[preview] 找不到容器：${target}`)
  }

  return element
}

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error

  return '预览失败'
}

export const createPreviewContext = (options: BasePreviewOptions): PreviewContext => {
  ensurePreviewStyles()

  const container = resolveContainer(options.container)
  const theme: Required<PreviewTheme> = { ...DEFAULT_THEME, ...options.theme }
  const callbacks: Array<() => void> = []

  const root = document.createElement('div')

  root.className = [PREVIEW_CLASS.root, options.className].filter(Boolean).join(' ')
  root.style.setProperty('--wa-preview-color', theme.color)
  root.style.setProperty('--wa-preview-muted', theme.mutedColor)
  root.style.setProperty('--wa-preview-background', theme.background)
  root.style.setProperty('--wa-preview-paper', theme.paper)
  root.style.setProperty('--wa-preview-accent', theme.accent)
  root.style.setProperty('--wa-preview-font-family', theme.fontFamily)
  root.style.setProperty('--wa-preview-font-size', `${theme.fontSize}px`)
  root.style.setProperty('--wa-preview-line-height', String(theme.lineHeight))

  const viewport = document.createElement('div')

  viewport.className = PREVIEW_CLASS.viewport
  root.appendChild(viewport)
  container.appendChild(root)

  let destroyed = false

  const context: PreviewContext = {
    container,
    root,
    viewport,
    theme,
    options,
    onDestroy(callback) {
      callbacks.push(callback)
    },
    emitProgress(progress) {
      options.onProgress?.(progress)
    },
    fail(error) {
      const message = toErrorMessage(error)
      const box = document.createElement('div')

      box.className = PREVIEW_CLASS.error
      box.textContent = message
      viewport.innerHTML = ''
      viewport.appendChild(box)
    },
    destroy() {
      if (destroyed) return

      destroyed = true
      while (callbacks.length > 0) {
        callbacks.pop()?.()
      }
      root.remove()
    },
  }

  return context
}
