<script setup lang="ts" generic="T extends FileListItem">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { ElAlert, ElDialog, ElImageViewer, vLoading } from 'element-plus'
import { DnDProvider } from '@vue-dnd-kit/core'
import { useConfig } from '../ConfigProvider/context'
import {
  fileListDefaultColumns,
  fileListEmptyText,
  fileListPreviewDialogWidth,
  fileListPreviewErrorText,
  fileListPreviewLoadingText,
  fileListVideoDialogWidth,
} from '../constant'
import { getFileMediaType, type FileMediaType } from '../shared/media'
import FileListGrid from './components/FileListGrid.vue'
import FileListSortable from './components/FileListSortable.vue'
import { collectImageItems, getItemPreviewUrl, resolveImageIndex } from './utils'
import type { FileListEmits, FileListExpose, FileListItem, FileListProps, FileListSlots } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<FileListProps<T>>(), {
  columns: fileListDefaultColumns,
  sortable: true,
  removable: true,
  previewable: true,
  emptyText: fileListEmptyText,
  disabled: false,
})

const emit = defineEmits<FileListEmits<T>>()

defineSlots<FileListSlots<T>>()

const { prefix } = useConfig()

defineOptions({ name: 'FileList' })

const base = computed(() => `${prefix.value}-file-list`)

/** 内部副本：业务用 v-model 时由 watch 同步，不用 v-model 时删除 / 排序也能即时生效。 */
const rows = shallowRef<T[]>([...props.data])

watch(
  () => props.data,
  (next) => {
    rows.value = [...(next ?? [])]
  },
  { deep: true },
)

type PreviewKind = 'image' | 'video' | 'other'

const previewVisible = ref(false)
const previewKind = ref<PreviewKind>('image')
const previewSrc = ref('')
const previewTitle = ref('')
const imageUrls = ref<string[]>([])
const imageIndex = ref(0)

const documentLoading = ref(false)
const documentError = ref('')
const documentContainer = ref<HTMLElement>()
const pendingDocument = shallowRef<T>()

/** 预览库句柄与并发令牌：关闭 / 切换时让上一次异步加载失效。 */
let documentHandle: { destroy: () => void } | undefined
let previewToken = 0

const imageVisible = computed(() => previewVisible.value && previewKind.value === 'image')
const videoVisible = computed(() => previewVisible.value && previewKind.value === 'video')
const otherVisible = computed(() => previewVisible.value && previewKind.value === 'other')

const releaseDocumentHandle = (): void => {
  documentHandle?.destroy()
  documentHandle = undefined
  if (documentContainer.value) documentContainer.value.innerHTML = ''
}

const closePreview = (): void => {
  previewToken += 1
  previewVisible.value = false
  previewKind.value = 'image'
  previewSrc.value = ''
  previewTitle.value = ''
  documentLoading.value = false
  documentError.value = ''
  pendingDocument.value = undefined
  releaseDocumentHandle()
}

const loadDocumentPreview = async (item: T): Promise<void> => {
  const token = ++previewToken
  documentLoading.value = true
  documentError.value = ''

  try {
    const { previewFile } = await import('@wapri/preview')
    if (token !== previewToken) return

    const container = documentContainer.value
    if (!container) return

    releaseDocumentHandle()
    const handle = await previewFile({ url: getItemPreviewUrl(item), fileName: item.name }, { container })
    if (token !== previewToken) {
      handle.destroy()
      return
    }
    documentHandle = handle
  } catch (cause) {
    if (token !== previewToken) return
    const error = cause instanceof Error ? cause : new Error(String(cause))
    documentError.value = fileListPreviewErrorText
    emit('error', error)
  } finally {
    if (token === previewToken) documentLoading.value = false
  }
}

const openPreview = (index: number): void => {
  const item = rows.value[index]
  if (!item || !props.previewable) return

  const mediaType: FileMediaType = getFileMediaType(item)
  previewTitle.value = item.name
  emit('preview', item, index, mediaType)

  if (mediaType === 'image') {
    imageUrls.value = collectImageItems(rows.value).map(getItemPreviewUrl)
    imageIndex.value = resolveImageIndex(rows.value, index)
    previewKind.value = 'image'
    previewVisible.value = true
    return
  }

  previewSrc.value = getItemPreviewUrl(item)
  previewKind.value = mediaType
  previewVisible.value = true

  if (mediaType === 'other') {
    // 等弹窗渲染出容器后再交给 preview 库，避免拿不到 DOM。
    pendingDocument.value = item
  }
}

/** 文档弹窗完全打开后再加载，此时容器 ref 一定存在。 */
const handleDocumentOpened = (): void => {
  const item = pendingDocument.value
  if (!item || previewKind.value !== 'other') return
  void nextTick(() => {
    void loadDocumentPreview(item)
  })
}

const handleVisibleChange = (value: boolean): void => {
  if (!value) closePreview()
}

const handlePreview = (_item: T, index: number): void => {
  openPreview(index)
}

const handleRemove = (item: T, index: number): void => {
  if (!props.removable || props.disabled) return
  const next = [...rows.value]
  next.splice(index, 1)
  rows.value = next
  emit('update:data', next)
  emit('remove', item, index)
}

const handleSort = (next: T[], oldIndex: number, newIndex: number): void => {
  rows.value = next
  emit('update:data', next)
  emit('sort', next, oldIndex, newIndex)
}

onBeforeUnmount(closePreview)

defineExpose<FileListExpose<T>>({
  preview: openPreview,
  closePreview,
  getData: () => [...rows.value],
})
</script>

<template>
  <DnDProvider v-if="sortable">
    <FileListSortable
      :data="rows"
      :columns="columns"
      :width="width"
      :previewable="previewable"
      :removable="removable"
      :disabled="disabled"
      :empty-text="emptyText"
      :row-key="rowKey"
      @preview="handlePreview"
      @remove="handleRemove"
      @sort="handleSort"
    >
      <template
        v-if="$slots.append"
        #append="scope"
      >
        <slot
          name="append"
          v-bind="scope"
        ></slot>
      </template>
    </FileListSortable>
  </DnDProvider>
  <FileListGrid
    v-else
    :data="rows"
    :columns="columns"
    :width="width"
    :previewable="previewable"
    :removable="removable"
    :disabled="disabled"
    :keyboard-sortable="false"
    :empty-text="emptyText"
    :row-key="rowKey"
    @preview="handlePreview"
    @remove="handleRemove"
  >
    <template
      v-if="$slots.append"
      #append="scope"
    >
      <slot
        name="append"
        v-bind="scope"
      ></slot>
    </template>
  </FileListGrid>

  <ElImageViewer
    v-if="imageVisible"
    :url-list="imageUrls"
    :initial-index="imageIndex"
    teleported
    @close="closePreview"
  />

  <ElDialog
    :class="`${base}__video-dialog`"
    :model-value="videoVisible"
    :title="previewTitle"
    :width="fileListVideoDialogWidth"
    append-to-body
    destroy-on-close
    @update:model-value="handleVisibleChange"
  >
    <video
      :class="`${base}__video`"
      :src="previewSrc"
      controls
      autoplay
    ></video>
  </ElDialog>

  <ElDialog
    :class="`${base}__document-dialog`"
    :model-value="otherVisible"
    :title="previewTitle"
    :width="fileListPreviewDialogWidth"
    append-to-body
    destroy-on-close
    @opened="handleDocumentOpened"
    @update:model-value="handleVisibleChange"
  >
    <div :class="`${base}__document`">
      <ElAlert
        v-if="documentError"
        :title="documentError"
        type="error"
        :closable="false"
        show-icon
      />
      <div
        v-show="!documentError"
        ref="documentContainer"
        v-loading="documentLoading"
        :class="`${base}__document-body`"
        :element-loading-text="fileListPreviewLoadingText"
      ></div>
    </div>
  </ElDialog>
</template>
