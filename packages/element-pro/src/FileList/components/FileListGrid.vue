<script setup lang="ts" generic="T extends FileListItem">
import { computed, ref } from 'vue'
import { toCssSize } from '@wapri/gutils'
import { useConfig } from '../../ConfigProvider/context'
import { getItemKey } from '../utils'
import FileListCard from './FileListCard.vue'
import type { FileListItem, FileListRowKey } from '../types'

const props = defineProps<{
  data: T[]
  columns: number
  width?: number | string
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

/** 卡片固定宽度；非法值（0、空字符串）回退到 `columns` 布局。 */
const fixedWidth = computed(() => {
  const { width } = props
  if (typeof width === 'number') return width > 0 ? toCssSize(width) : ''
  return width?.trim() ? width : ''
})

const gridStyle = computed(() =>
  fixedWidth.value
    ? { '--wa-ui-file-list-width': fixedWidth.value }
    : { '--wa-ui-file-list-columns': String(props.columns) },
)

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
    v-if="data.length || $slots.append"
    ref="rootRef"
    :class="[`${base}__grid`, { [`${base}__grid--fixed`]: fixedWidth }]"
    :style="gridStyle"
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
    <div
      v-if="$slots.append"
      :class="`${base}__append`"
      role="listitem"
    >
      <slot
        name="append"
        :data="data"
        :count="data.length"
      ></slot>
    </div>
  </div>
  <p
    v-else
    :class="`${base}__empty`"
  >
    {{ emptyText }}
  </p>
</template>
