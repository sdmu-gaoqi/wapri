import { inject, type ComputedRef, type CSSProperties, type InjectionKey } from 'vue'

/**
 * 侧栏主题变量的样式对象。
 * 折叠态浮层（分组浮层、经典子菜单浮层）会被 teleport 到 body，脱离侧栏根节点，
 * 需要把同一份 CSS 变量挂到浮层根节点上，浮层内的配色才能与侧栏保持一致。
 */
export const sidebarThemeStyleKey: InjectionKey<ComputedRef<CSSProperties>> = Symbol('WaSidebarThemeStyle')

/** 取侧栏主题变量样式对象，用于浮层根节点；不在 Sidebar 内使用时返回 undefined */
export function useSidebarThemeStyle(): ComputedRef<CSSProperties> | undefined {
  return inject(sidebarThemeStyleKey, undefined)
}
