<script setup lang="ts" generic="T extends FileListItem">
import { computed, ref } from 'vue'
import { useConfig } from '../../ConfigProvider/context'
import { getItemKey } from '../utils'
import FileListCard from './FileListCard.vue'
import type { FileListItem, FileListRowKey } from '../types'

const props = defineProps<{
  data: T[]
  columns: number
  previewable: boolean
  removable: boolean
  disabled: boolean
  keyboardSortable: boolean
  emptyText: string
  rowKey?: FileListRowKey<T>
}>()

const emit = defineEmits<{
  preview: [item: T, index: number]
  remove: [item: T, index: number]
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileListGrid' })

const base = computed(() => `${prefix.value}-file-list`)
const rootRef = ref<HTMLElement>()

/** 拖拽注册需要拿到网格根元素与每个卡片的 DOM。 */
const getRootElement = (): HTMLElement | undefined => rootRef.value

const getItemElement = (index: number): HTMLElement | undefined => {
  const element = rootRef.value?.children[index]
  return element instanceof HTMLElement ? element : undefined
}

defineExpose({ getRootElement, getItemElement })
</script>

<template>
  <div
    v-if="data.length"
    ref="rootRef"
    :class="`${base}__grid`"
    :style="{ '--wa-ui-file-list-columns': String(columns) }"
    role="list"
  >
    <FileListCard
      v-for="(item, index) in data"
      :key="getItemKey(item, index, rowKey)"
      :item="item"
      :previewable="previewable"
      :removable="removable"
      :disabled="disabled"
      :keyboard-sortable="keyboardSortable"
      @preview="emit('preview', item, index)"
      @remove="emit('remove', item, index)"
    />
  </div>
  <p
    v-else
    :class="`${base}__empty`"
  >
    {{ emptyText }}
  </p>
</template>
