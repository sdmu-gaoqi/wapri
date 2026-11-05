<script setup lang="ts">
import { computed, type Component } from 'vue'
import { isExternalPath } from '../utils'
import type { SidebarLinkTarget } from '../types'

const props = withDefaults(
  defineProps<{
    /** 跳转目标 */
    to: SidebarLinkTarget
    /** 是否渲染为外链，不传时按 `to` 自动判断 */
    external?: boolean
    /** 内部链接使用的组件，默认 `router-link` */
    linkComponent?: string | Component
  }>(),
  {
    external: undefined,
    linkComponent: 'router-link',
  },
)

const isExternal = computed(() => props.external ?? (typeof props.to === 'string' && isExternalPath(props.to)))
const externalHref = computed(() => (typeof props.to === 'string' ? props.to : props.to.path))
</script>

<template>
  <a
    v-if="isExternal"
    :href="externalHref"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot></slot>
  </a>
  <component
    :is="linkComponent"
    v-else
    :to="to"
  >
    <slot></slot>
  </component>
</template>
