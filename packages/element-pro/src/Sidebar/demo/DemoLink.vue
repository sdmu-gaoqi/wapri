<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SidebarLinkTarget } from '@wapri/element-pro'

const props = defineProps<{
  /** 跳转目标 */
  to: SidebarLinkTarget
}>()

/** 演示用的跳转回调，由 demo 通过 provide 注入，用于模拟路由跳转 */
const navigate = inject<(path: string) => void>('demoNavigate', () => {})

const href = computed(() => (typeof props.to === 'string' ? props.to : props.to.path))
</script>

<template>
  <a
    :href="href"
    @click.prevent="navigate(href)"
  >
    <slot />
  </a>
</template>
