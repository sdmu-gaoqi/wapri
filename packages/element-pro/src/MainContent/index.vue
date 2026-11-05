<script setup lang="ts">
import { computed } from 'vue'
import type { MainContentProps } from './types'

const props = withDefaults(defineProps<MainContentProps>(), {
  mode: 'classic',
  collapse: false,
  sidebarHide: false,
  mobile: false,
  withoutAnimation: false,
  hasTagsView: false,
})

defineOptions({ name: 'MainContent' })

const rootClass = computed(() => ({
  'is-grouped': props.mode === 'grouped',
  'is-collapsed': props.collapse,
  'is-mobile': props.mobile,
  'is-sidebar-hidden': props.sidebarHide,
  'without-animation': props.withoutAnimation,
  'has-tags-view': props.hasTagsView,
}))
</script>

<template>
  <div
    class="wa-ui-main-content"
    :class="rootClass"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" src="./styles/index.scss" />
