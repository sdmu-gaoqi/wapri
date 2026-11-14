<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { Loading, Upload } from '@element-plus/icons-vue'
import { toCssSize } from '@wapri/gutils'
import { useConfig } from '../ConfigProvider/context'
import { fileUploadActionText, fileUploadLoadingText, fileUploadTip, fileUploadTitle } from '../constant'
import { splitByAccept } from './utils'
import type { FileUploadEmits, FileUploadExpose, FileUploadProps, FileUploadSlots } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<FileUploadProps>(), {
  accept: undefined,
  multiple: false,
  disabled: false,
  loading: false,
  title: fileUploadTitle,
  loadingText: fileUploadLoadingText,
  tip: fileUploadTip,
  showUploadButton: true,
  uploadText: fileUploadActionText,
  clickToPick: true,
})

const emit = defineEmits<FileUploadEmits>()

defineSlots<FileUploadSlots>()

defineOptions({ name: 'FileUpload' })

const { prefix } = useConfig()

const base = computed(() => `${prefix.value}-file-upload`)

const inputRef = ref<HTMLInputElement | null>(null)

/** 拖拽计数：经过子节点会不停触发 dragleave，用计数避免高亮闪烁。 */
const dragDepth = ref(0)

const interactive = computed(() => !props.disabled && !props.loading)

const dragover = computed(() => dragDepth.value > 0)

const titleText = computed(() => (props.loading ? props.loadingText : props.title))

/** 宽度默认值由样式给出，只有显式传 `width` 时才写行内样式覆盖。 */
const rootStyle = computed(() => (props.width === undefined ? undefined : { width: toCssSize(props.width) }))

/** 打开文件选择框；禁用与上传中不响应。 */
const open = (): void => {
  if (!interactive.value) {
    return
  }
  inputRef.value?.click()
}

const emitFiles = (files: File[]): void => {
  if (!files.length) {
    return
  }
  const { accepted, rejected } = splitByAccept(files, props.accept)
  if (rejected.length) {
    emit('reject', rejected)
  }
  if (accepted.length) {
    emit('select', props.multiple ? accepted : accepted.slice(0, 1))
  }
}

/** 面板空白处点击等价于「直接上传」，按钮区的点击会被容器拦下。 */
const onRootClick = (): void => {
  if (props.clickToPick) {
    open()
  }
}

const onInputChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  emitFiles(files)
}

const onDragEnter = (): void => {
  if (interactive.value) {
    dragDepth.value += 1
  }
}

const onDragOver = (): void => {
  if (interactive.value && dragDepth.value === 0) {
    dragDepth.value = 1
  }
}

const onDragLeave = (): void => {
  dragDepth.value = Math.max(dragDepth.value - 1, 0)
}

const onDrop = (event: DragEvent): void => {
  dragDepth.value = 0
  if (!interactive.value) {
    return
  }
  emitFiles(Array.from(event.dataTransfer?.files ?? []))
}

defineExpose<FileUploadExpose>({ open })
</script>

<template>
  <div
    :class="[
      base,
      {
        [`${base}--disabled`]: disabled,
        [`${base}--loading`]: loading,
        [`${base}--dragover`]: dragover,
      },
    ]"
    :role="clickToPick && interactive ? 'button' : undefined"
    :tabindex="clickToPick && interactive ? 0 : undefined"
    :aria-disabled="!interactive"
    :style="rootStyle"
    @click="onRootClick"
    @keydown.enter.self.prevent="open"
    @keydown.space.self.prevent="open"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div :class="`${base}__head`">
      <ElIcon :class="[`${base}__icon`, { [`${base}__icon--loading`]: loading }]">
        <slot name="icon">
          <Loading v-if="loading" />
          <Upload v-else />
        </slot>
      </ElIcon>
      <span :class="`${base}__title`">{{ titleText }}</span>
      <span :class="`${base}__tip`">{{ tip }}</span>
    </div>

    <div
      v-if="showUploadButton || $slots.actions"
      :class="`${base}__actions`"
      @click.stop
    >
      <slot
        name="actions"
        :open="open"
      >
        <ElButton
          type="primary"
          size="small"
          :disabled="!interactive"
          @click="open"
        >
          {{ uploadText }}
        </ElButton>
      </slot>
    </div>

    <input
      ref="inputRef"
      :class="`${base}__file`"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="onInputChange"
      @click.stop
    />
  </div>
</template>
