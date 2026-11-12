<script setup lang="ts">
import { shallowRef, useId, watch } from 'vue'
import { makeSortableList, type MaybeElement } from '@vue-dnd-kit/core'
import type { UploadUserFile } from 'element-plus'
import SortableItemRegistrar from '../../shared/dnd/SortableItemRegistrar.vue'
import SortableFileOverlay from './SortableFileOverlay.vue'

/**
 * 上传列表的拖拽排序。
 *
 * `ElUpload` 的列表项由它自己渲染，外面拿不到 ref，所以这里用「按序号取 DOM」的方式注册：
 * 列表项顺序与 `files` 顺序一致，拖完把新顺序交回父级写进 `file-list`。
 */
interface Props {
  /** 当前上传列表，顺序即展示顺序 */
  files: UploadUserFile[]
  /** 上传列表容器 `.el-upload-list` */
  getListElement: () => MaybeElement
  /** 按顺序取第 index 个列表项 */
  getItemElement: (index: number) => MaybeElement
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'sort-end': [files: UploadUserFile[]]
}>()

const rows = shallowRef<UploadUserFile[]>(props.files)
const sortableId = useId()

watch(
  () => props.files,
  (files) => {
    rows.value = files
  },
)

makeSortableList<UploadUserFile>(() => props.getListElement() ?? undefined, {
  id: sortableId,
  items: rows,
  getKey: (file) => file.uid ?? file.name,
  overlay: SortableFileOverlay,
  // 图片墙是网格铺开的，按 grid 策略计算落点；
  // 拖到列表外（比如拖到触发卡片上）不做任何事。
  strategy: 'grid',
  dropOutside: 'cancel',
  onDrop: (event) => {
    const next = event.result.get(sortableId)
    if (!next) return
    // 写回交给父级：受控用法要通知 v-model，非受控用法更新内部列表。
    event.preventDefault()
    rows.value = next
    emit('sort-end', next)
  },
})
</script>

<template>
  <SortableItemRegistrar
    v-for="(file, index) in rows"
    :key="file.uid"
    :item="file"
    :target="() => getItemElement(index)"
    :disabled="disabled"
  />
</template>
