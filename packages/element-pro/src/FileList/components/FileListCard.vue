<script setup lang="ts" generic="T extends FileListItem">
import { computed } from 'vue'
import { ElIcon } from 'element-plus'
import { Delete, View } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { fileListPreviewText, fileListRemoveText } from '../../constant'
import FileCard from '../../shared/fileCard/index.vue'
import type { FileCardSource } from '../../shared/fileCard/types'
import type { FileListItem } from '../types'

const props = defineProps<{
  item: T
  previewable: boolean
  removable: boolean
  disabled: boolean
  /** 开启拖拽时，键盘的 Space / Enter 交给 @vue-dnd-kit 拾取卡片。 */
  keyboardSortable: boolean
}>()

const emit = defineEmits<{
  preview: []
  remove: []
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileListCard' })

const base = computed(() => `${prefix.value}-file-list`)

/** 泛型 `T` 由 Vue 的 props 推导保留，这里收敛到卡片真正需要的字段。 */
const cardSource = computed(() => props.item as FileCardSource)
const itemName = computed(() => props.item.name)
const previewLabel = computed(() => `${fileListPreviewText} ${itemName.value}`)
const removeLabel = computed(() => `${fileListRemoveText} ${itemName.value}`)

const handleClick = (): void => {
  if (!props.previewable) return
  emit('preview')
}

const handlePreview = (): void => {
  emit('preview')
}

const handleRemove = (): void => {
  emit('remove')
}
</script>

<template>
  <FileCard
    :source="cardSource"
    :keyboard-sortable="keyboardSortable"
    :disabled="disabled"
    role="listitem"
    :aria-label="itemName"
    @activate="handleClick"
  >
    <template #actions>
      <button
        v-if="previewable"
        type="button"
        :class="`${base}__action`"
        :aria-label="previewLabel"
        :title="fileListPreviewText"
        @click.stop="handlePreview"
      >
        <ElIcon><View /></ElIcon>
      </button>
      <button
        v-if="removable && !disabled"
        type="button"
        :class="[`${base}__action`, `${base}__action--remove`]"
        :aria-label="removeLabel"
        :title="fileListRemoveText"
        @click.stop="handleRemove"
      >
        <ElIcon><Delete /></ElIcon>
      </button>
    </template>
  </FileCard>
</template>
