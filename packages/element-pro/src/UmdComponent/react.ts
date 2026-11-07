import { getGlobal } from './resolve'
import type { UmdComponentPropValues, UmdMountHandle } from './types'

/** 只声明本组件用到的 React 成员，避免把 react 变成依赖。 */
interface ReactRuntime {
  createElement: (type: unknown, props?: UmdComponentPropValues | null) => unknown
}

interface ReactRoot {
  render: (node: unknown) => void
  unmount: () => void
}

interface ReactDomRuntime {
  createRoot?: (container: Element) => ReactRoot
  /** React 17 及以下 */
  render?: (node: unknown, container: Element) => unknown
  unmountComponentAtNode?: (container: Element) => boolean
}

export interface ReactMountHandle extends UmdMountHandle {
  /** 当前挂载点，用于判断是否需要重新挂载。 */
  target: HTMLElement
  /** 当前渲染的组件，用于判断是否需要重新挂载。 */
  component: unknown
}

const getReactRuntime = (): ReactRuntime | undefined => {
  const runtime = getGlobal('React')

  return runtime && typeof (runtime as ReactRuntime).createElement === 'function'
    ? (runtime as ReactRuntime)
    : undefined
}

const getReactDomRuntime = (): ReactDomRuntime | undefined => {
  const runtime = getGlobal('ReactDOM')

  return runtime && typeof runtime === 'object' ? (runtime as ReactDomRuntime) : undefined
}

/** 渲染前确认全局 React / ReactDOM 就绪，缺失时给出可执行的提示。 */
export function assertReactRuntime(): void {
  if (!getReactRuntime()) {
    throw new Error('[element-pro] 未找到全局 React，请先加载 react 的 UMD 脚本')
  }
  if (!getReactDomRuntime()) {
    throw new Error('[element-pro] 未找到全局 ReactDOM，请先加载 react-dom 的 UMD 脚本')
  }
}

/**
 * 把远程 React 组件挂载到指定容器。
 *
 * React 18 走 `createRoot`，React 17 及以下回退 `render`；重复渲染复用同一个根实例。
 */
export function mountReactComponent(
  target: HTMLElement,
  component: unknown,
  props: UmdComponentPropValues,
): ReactMountHandle {
  assertReactRuntime()

  const React = getReactRuntime() as ReactRuntime
  const ReactDOM = getReactDomRuntime() as ReactDomRuntime
  const createElement = (next: UmdComponentPropValues): unknown => React.createElement(component, next)

  if (typeof ReactDOM.createRoot === 'function') {
    const root = ReactDOM.createRoot(target)
    root.render(createElement(props))

    return {
      target,
      component,
      update: (next) => root.render(createElement(next)),
      destroy: () => root.unmount(),
    }
  }

  const render = ReactDOM.render
  if (typeof render === 'function') {
    render(createElement(props), target)

    return {
      target,
      component,
      update: (next) => render(createElement(next), target),
      destroy: () => {
        ReactDOM.unmountComponentAtNode?.(target)
      },
    }
  }

  throw new Error('[element-pro] 当前 ReactDOM 同时缺少 createRoot 与 render，无法渲染远程组件')
}
