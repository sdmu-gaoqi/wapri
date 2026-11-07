/** 远程 UMD 组件所属的渲染框架。 */
export type UmdFramework = 'vue' | 'react'

/** `framework` 的取值；`auto` 表示按组件特征自动判断。 */
export type UmdFrameworkOption = UmdFramework | 'auto'

/** 远程组件的加载状态。 */
export type UmdComponentStatus = 'idle' | 'loading' | 'ready' | 'error'

/** 透传给远程组件的 props。 */
export type UmdComponentPropValues = Record<string, unknown>

/** `UmdComponent` 的 props。 */
export interface UmdComponentProps {
  /**
   * UMD 脚本地址，按数组顺序串行加载。
   * React 需要先加载 react / react-dom 的 UMD，再加载业务组件本身。
   */
  url: string | string[]
  /** 远程组件在全局对象上的路径，支持点号，如 `WaUmdDemo.ReactCounter`。 */
  name: string
  /** 远程组件所属框架；`auto` 时先看组件特征，再看页面上已存在的运行时。 */
  framework?: UmdFrameworkOption
  /** 透传给远程组件的 props；事件（React / Vue 的 `onXxx`）也放在这里。 */
  componentProps?: UmdComponentPropValues
  /** 需要一并注入的样式表地址，按数组顺序串行加载；地址需以 `.css` 结尾。 */
  css?: string | string[]
  /** 资源加载超时时间（毫秒），`0` 表示不限制。 */
  timeout?: number
  /** 根节点标签名。 */
  tag?: string
}

/** `load` 事件的回调参数。 */
export interface UmdComponentLoadPayload {
  /** 实际使用的框架。 */
  framework: UmdFramework
  /** 从全局对象上解析到的组件。 */
  component: unknown
}

/** `error` 事件的回调参数。 */
export interface UmdComponentErrorPayload {
  /** 失败原因。 */
  error: Error
  /** 本次加载涉及的资源地址（样式表在前、脚本在后）。 */
  url: string[]
}

/** 通过 ref 暴露的实例能力。 */
export interface UmdComponentExpose {
  /** 重新加载资源并重新解析组件。 */
  reload: () => Promise<void>
  /** 当前解析到的远程组件。 */
  component: unknown
  /** 当前生效的框架。 */
  framework: UmdFramework | undefined
}

/** 远程组件的挂载句柄。 */
export interface UmdMountHandle {
  /** 用新的 props 重新渲染。 */
  update: (props: UmdComponentPropValues) => void
  /** 卸载远程组件并清理挂载点。 */
  destroy: () => void
}
