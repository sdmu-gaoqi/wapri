<script setup lang="ts" generic="T extends object">
import { computed, isVNode, type VNodeChild } from 'vue'
import { ElIcon } from 'element-plus'
import { Sort } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'

/**
 * 拖拽把手（只负责展示）。
 *
 * 行的拖拽注册放在 `DragSortTableBody` 里做：`ElTable` 会把列插槽额外渲染一份到
 * `.hidden-columns`，在把手内部注册会让同一行被注册两次，所以这里只画 UI。
 */
const props = defineProps<{
  record: T
  index: number
  /** 自定义把手内容，支持 VNode 与字符串 */
  render?: (record: T, index: number) => VNodeChild
  disabled?: boolean
}>()

const { prefix } = useConfig()
const base = computed(() => `${prefix.value}-drag-sort-table__handle`)

const content = computed(() => props.render?.(props.record, props.index))
</script>

<template>
  <span
    :class="[base, disabled && `${base}--disabled`]"
    role="button"
    title="拖动排序"
    aria-label="拖动排序"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <template v-if="render">
      <component
        :is="content"
        v-if="isVNode(content)"
      />
      <template v-else>{{ content }}</template>
    </template>
    <ElIcon v-else>
      <Sort />
    </ElIcon>
  </span>
</template>
