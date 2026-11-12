<script setup lang="ts">
import { computed } from 'vue'
import type { OverlayProps } from '@vue-dnd-kit/core'
import { useConfig } from '../../ConfigProvider/context'

/**
 * 拖拽浮层：把起拖那一行 `<tr>` 连同 `<colgroup>` 一起克隆进一张独立表格。
 *
 * 默认浮层是「元素克隆」直接塞进一个 div，`<tr>` 脱离表格上下文后列宽与边框都会丢；
 * 这里还原出 table/colgroup 结构，拖动过程中看到的就是原样的那一行。
 */
const props = defineProps<OverlayProps>()

const { prefix } = useConfig()

const snapshot = computed(() => {
  const element = props.active.element
  if (!(element instanceof HTMLTableRowElement)) return null
  const table = element.closest('table')
  if (!table) return null

  const clone = element.cloneNode(true) as HTMLTableRowElement
  clone.removeAttribute('data-dnd-dragging')
  clone.removeAttribute('data-dnd-placeholder')

  return {
    row: clone.outerHTML,
    columns: table.querySelector('colgroup')?.outerHTML ?? '',
    width: Math.round(table.getBoundingClientRect().width),
  }
})
</script>

<template>
  <table
    v-if="snapshot"
    :class="[`${prefix}-drag-sort-table__overlay`, 'el-table']"
    :style="{ width: `${snapshot.width}px` }"
  >
    <colgroup v-html="snapshot.columns"></colgroup>
    <tbody v-html="snapshot.row"></tbody>
  </table>
</template>
