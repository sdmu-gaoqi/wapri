<script setup lang="ts">
import { computed } from 'vue'
import type { OverlayProps } from '@vue-dnd-kit/core'

/**
 * 上传列表的拖拽浮层。
 *
 * 上传列表项的尺寸来自 `.el-upload-list--picture-card .el-upload-list__item` 这类
 * 「列表类名 + 项类名」的组合选择器，直接克隆 `<li>` 会丢掉外层列表上下文、
 * 塌成一行普通内容。这里把外层 `<ul>` 的类名一起还原，拖动过程中看到的就是原样的一项。
 */
const props = defineProps<OverlayProps>()

const snapshot = computed(() => {
  const element = props.active.element
  if (!(element instanceof HTMLLIElement)) return null

  const list = element.closest('.el-upload-list')
  if (!list) return null

  const clone = element.cloneNode(true) as HTMLLIElement
  clone.removeAttribute('data-dnd-dragging')
  clone.removeAttribute('data-dnd-placeholder')

  return {
    html: clone.outerHTML,
    listClass: list.className,
    width: Math.round(list.getBoundingClientRect().width),
  }
})
</script>

<template>
  <ul
    v-if="snapshot"
    :class="snapshot.listClass"
    :style="{ width: `${snapshot.width}px` }"
    v-html="snapshot.html"
  ></ul>
</template>
