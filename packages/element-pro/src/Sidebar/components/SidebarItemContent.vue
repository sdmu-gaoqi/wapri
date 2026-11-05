<script setup lang="ts">
import SidebarIcon from './SidebarIcon.vue'
import type { SidebarIconRender } from '../types'

defineProps<{
  /** 图标名称 */
  icon?: string
  /** 菜单标题 */
  title?: string
  /** 自定义图标渲染函数 */
  renderIcon?: SidebarIconRender
}>()
</script>

<template>
  <SidebarIcon
    :icon="icon"
    :render-icon="renderIcon"
  />
  <span
    v-if="title"
    class="wa-ui-sidebar__item-title"
    :title="title"
  >
    {{ title }}
  </span>
</template>
