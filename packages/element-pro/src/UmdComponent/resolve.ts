import type { UmdFramework } from './types'

/** 按点号路径读取全局对象上的值，任一层缺失都返回 `undefined`。 */
export function getGlobal(path: string): unknown {
  if (typeof globalThis === 'undefined' || !path) return undefined

  return path.split('.').reduce<unknown>(
    (current, key) => {
      if (current === null || current === undefined) return undefined
      if (typeof current !== 'object' && typeof current !== 'function') return undefined
      return (current as Record<string, unknown>)[key]
    },
    globalThis as unknown as Record<string, unknown>,
  )
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

function isReactComponent(value: unknown): boolean {
  if (typeof value === 'function') {
    const prototype = (value as { prototype?: { isReactComponent?: unknown } }).prototype
    if (prototype?.isReactComponent) return true
  }
  if (!isRecord(value)) return false

  return value.$$typeof !== undefined
}

function isVueComponent(value: unknown): boolean {
  if (!isRecord(value)) return false

  return Boolean(value.setup || value.render || value.template || value.__vccOpts || value.__name)
}

const isComponentLike = (value: unknown): boolean =>
  typeof value === 'function' || isReactComponent(value) || isVueComponent(value)

/**
 * 自动判断远程组件该用哪个框架渲染。
 *
 * 先看组件自身特征（React 的 `$$typeof` / `isReactComponent`、Vue 的 `setup` / `render`），
 * 判断不出来时再看页面上已经加载的运行时：只有 React 就按 React 处理，其余按 Vue 处理。
 */
export function detectFramework(component: unknown): UmdFramework {
  if (isReactComponent(component)) return 'react'
  if (isVueComponent(component)) return 'vue'
  if (typeof component === 'function') return getGlobal('React') ? 'react' : 'vue'

  return 'vue'
}

/** Vue 插件（只有 `install`、没有组件特征）不能直接交给 `h()` 渲染。 */
export function isVuePlugin(value: unknown): boolean {
  if (!isRecord(value)) return false

  return typeof value.install === 'function' && !isVueComponent(value)
}

/**
 * 解析全局组件路径。
 *
 * UMD 打包产物常见 `Lib.default` 形态，路径本身不像组件时回退到 `default` 导出。
 */
export function resolveComponent(path: string): unknown {
  const value = getGlobal(path)
  if (value === undefined || value === null) return undefined
  if (isComponentLike(value)) return value

  if (isRecord(value)) {
    const fallback = value.default
    if (fallback !== undefined && isComponentLike(fallback)) return fallback
  }

  return value
}
