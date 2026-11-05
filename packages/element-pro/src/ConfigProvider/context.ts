import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import { defaultPrefix } from '../constant'

export type ElementProSize = 'large' | 'default' | 'small'

export interface ElementProConfigContext {
  size: ComputedRef<ElementProSize>
  prefix: ComputedRef<string>
  /** 图标集脚本地址，由宿主注入；库内不内置任何图标源。 */
  iconfont: ComputedRef<string | undefined>
}

export const configProviderContextKey: InjectionKey<ElementProConfigContext> = Symbol('ElementProConfigProvider')

const defaultConfig: ElementProConfigContext = {
  size: computed(() => 'default'),
  prefix: computed(() => defaultPrefix),
  iconfont: computed(() => undefined),
}

export function useConfig(): ElementProConfigContext {
  return inject(configProviderContextKey, defaultConfig)
}
