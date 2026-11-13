<script setup lang="ts" generic="T extends FileListItem">
import { computed, ref, watch } from 'vue'
import { ElIcon } from 'element-plus'
import { Delete, Document, VideoPlay, View } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { fileListPreviewText, fileListRemoveText } from '../../constant'
import { getFileMediaType } from '../../shared/media'
import { getItemThumb } from '../utils'
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

/** 缩略图加载失败时降级为文件图标，避免卡片一片空白。 */
const thumbFailed = ref(false)

watch(
  () => props.item.abbreviateUrl,
  () => {
    thumbFailed.value = false
  },
)

const mediaType = computed(() => getFileMediaType(props.item))
const thumb = computed(() => getItemThumb(props.item))
const showThumb = computed(() => Boolean(thumb.value) && !thumbFailed.value)
const itemName = computed(() => props.item.name)
const previewLabel = computed(() => `${fileListPreviewText} ${itemName.value}`)
const removeLabel = computed(() => `${fileListRemoveText} ${itemName.value}`)

const handleClick = (): void => {
  if (!props.previewable) return
  emit('preview')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (props.keyboardSortable) return
  if (event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  handleClick()
}

const handlePreview = (): void => {
  emit('preview')
}

const handleRemove = (): void => {
  emit('remove')
}
</script>

<template>
  <div
    :class="[`${base}__card`, { [`${base}__card--disabled`]: disabled }]"
    role="listitem"
    tabindex="0"
    :aria-label="itemName"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div :class="`${base}__thumb`">
      <img
        v-if="showThumb"
        :class="`${base}__thumb-image`"
        :src="thumb"
        :alt="itemName"
        loading="lazy"
        @error="thumbFailed = true"
      />
      <span
        v-else
        :class="`${base}__thumb-fallback`"
      >
        <ElIcon><Document /></ElIcon>
      </span>

      <span
        v-if="mediaType === 'video'"
        :class="`${base}__badge`"
      >
        <ElIcon><VideoPlay /></ElIcon>
      </span>

      <div
        v-if="previewable || (removable && !disabled)"
        :class="`${base}__actions`"
      >
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
      </div>
    </div>

    <p
      :class="`${base}__name`"
      :title="itemName"
    >
      {{ itemName }}
    </p>
  </div>
</template>
