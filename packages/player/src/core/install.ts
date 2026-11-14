import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

/** 给组件挂上 install，使其可被 `app.use(VideoPlayer)` 全局注册 */
export const withInstall = <T extends { name?: string }>(component: T): SFCWithInstall<T> => {
  const target = component as SFCWithInstall<T>

  target.install = (app: App) => {
    if (component.name) app.component(component.name, component)
  }

  return target
}
