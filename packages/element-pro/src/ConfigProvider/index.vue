<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { defaultPrefix } from '../constant'
import { configProviderContextKey, type ElementProSize } from './context'

export interface ConfigProviderProps {
  size?: ElementProSize
  prefix?: string
  /** 图标集脚本地址，供子树里的 `SvgIcon` 使用；库内不内置任何图标源。 */
  iconfont?: string
}

const props = defineProps<ConfigProviderProps>()

defineOptions({ name: 'ConfigProvider' })

const parentConfig = inject(configProviderContextKey, undefined)

provide(configProviderContextKey, {
  size: computed(() => props.size ?? parentConfig?.size.value ?? 'default'),
  prefix: computed(() => props.prefix ?? parentConfig?.prefix.value ?? defaultPrefix),
  iconfont: computed(() => props.iconfont ?? parentConfig?.iconfont.value),
})
</script>

<template>
  <slot></slot>
</template>
