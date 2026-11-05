import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

const installComponent = (app: App, comp: unknown): void => {
  const c = comp as { name?: string }
  if (c?.name) {
    app.component(c.name, c)
  }
}

/**
 * 给组件挂载 install 方法，使其可被 `app.use(Comp)` 全局注册。
 * 额外子组件会随主组件一并注册，并挂载到主组件上（如 ElButton.ButtonGroup）。
 */
export const withInstall = <T, E extends Record<string, unknown>>(main: T, extra?: E): SFCWithInstall<T> & E => {
  ;(main as SFCWithInstall<T>).install = (app: App): void => {
    installComponent(app, main)
    for (const comp of Object.values(extra ?? {})) {
      installComponent(app, comp)
    }
  }

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as Record<string, unknown>)[key] = comp
    }
  }

  return main as SFCWithInstall<T> & E
}

/** 无额外注册逻辑的组件，install 为空操作（对齐 element-plus 的 withNoopInstall）。 */
export const withNoopInstall = <T>(component: T): SFCWithInstall<T> => {
  ;(component as SFCWithInstall<T>).install = () => {}
  return component as SFCWithInstall<T>
}
