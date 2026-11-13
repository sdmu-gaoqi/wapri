<script setup lang="ts" generic="T extends FileListItem">
import { computed, ref, useId } from 'vue'
import { makeSortableList } from '@vue-dnd-kit/core'
import FileListGrid from './FileListGrid.vue'
import FileListOverlay from './FileListOverlay.vue'
import SortableItemRegistrar from '../../shared/dnd/SortableItemRegistrar.vue'
import { getItemKey } from '../utils'
import type { Key } from '../../shared/field/types'
import type { FileListItem, FileListRowKey } from '../types'

/**
 * 拖动排序容器：必须渲染在 `DnDProvider` 内。
 * `FileListGrid` 负责 DOM，本组件只注册可排序列表与每个卡片。
 */
const props = defineProps<{
  data: T[]
  columns: number
  previewable: boolean
  removable: boolean
  disabled: boolean
  emptyText: string
  rowKey?: FileListRowKey<T>
}>()

const emit = defineEmits<{
  preview: [item: T, index: number]
  remove: [item: T, index: number]
  sort: [data: T[], oldIndex: number, newIndex: number]
}>()

defineOptions({ name: 'FileListSortable' })

interface FileListGridInstance {
  getRootElement: () => HTMLElement | undefined
  getItemElement: (index: number) => HTMLElement | undefined
}

const gridRef = ref<FileListGridInstance>()
const sortableId = useId()

/** 拖动过程中按对象引用取 key，顺序变化不影响映射。 */
const keyMap = computed(() => {
  const map = new Map<T, Key>()
  props.data.forEach((item, index) => map.set(item, getItemKey(item, index, props.rowKey)))
  return map
})

const list = makeSortableList<T>(() => gridRef.value?.getRootElement(), {
  id: sortableId,
  items: () => props.data,
  getKey: (item) => keyMap.value.get(item) ?? 0,
  overlay: FileListOverlay,
  strategy: 'grid',
  dropOutside: 'cancel',
  onDrop: (event) => {
    const next = event.result.get(sortableId)
    if (!next) return
    // 数据由外层受控维护，这里只把新顺序抛出去。
    event.preventDefault()
    emit('sort', next, event.from.index, event.to.index)
  },
})

const handlePreview = (item: T, index: number): void => {
  emit('preview', item, index)
}

const handleRemove = (item: T, index: number): void => {
  emit('remove', item, index)
}
</script>

<template>
  <FileListGrid
    ref="gridRef"
    :data="list.items.value"
    :columns="columns"
    :previewable="previewable"
    :removable="removable"
    :disabled="disabled"
    :keyboard-sortable="!disabled"
    :empty-text="emptyText"
    :row-key="rowKey"
    @preview="handlePreview"
    @remove="handleRemove"
  />

  <SortableItemRegistrar
    v-for="(item, index) in list.items.value"
    :key="getItemKey(item, index, rowKey)"
    :item="item"
    :target="() => gridRef?.getItemElement(index)"
    :disabled="disabled"
  />
</template>
