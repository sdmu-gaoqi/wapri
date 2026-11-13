<script setup lang="ts">
import { computed } from 'vue'
import type { OverlayProps } from '@vue-dnd-kit/core'
import { useConfig } from '../../ConfigProvider/context'

/**
 * 拖动浮层：克隆当前卡片，按原卡片尺寸展示。
 * 直接克隆 DOM 可以保留缩略图、文件名省略和操作按钮的状态。
 */
const props = defineProps<OverlayProps>()

const { prefix } = useConfig()

const snapshot = computed(() => {
  const element = props.active.element
  if (!(element instanceof HTMLElement)) return null

  const clone = element.cloneNode(true) as HTMLElement
  clone.removeAttribute('data-dnd-dragging')
  clone.removeAttribute('data-dnd-placeholder')
  clone.style.width = '100%'

  return {
    html: clone.outerHTML,
    width: Math.round(element.getBoundingClientRect().width),
  }
})
</script>

<template>
  <div
    v-if="snapshot"
    :class="`${prefix}-file-list__overlay`"
    :style="{ width: `${snapshot.width}px` }"
    v-html="snapshot.html"
  ></div>
</template>
