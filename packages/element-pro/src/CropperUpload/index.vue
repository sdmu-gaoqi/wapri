<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import type { UploadHooks, UploadInstance, UploadRawFile, UploadUserFile } from 'element-plus'
import CropperDialog from './CropperDialog.vue'
import { useConfig } from '../ConfigProvider/context'
import { inheritUid, isImageFile } from './utils'
import type { CropperUploadEmits, CropperUploadProps } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<CropperUploadProps>(), {
  cropper: true,
  aspectRatio: 1,
  ratios: () => [1, 4 / 3, 16 / 9, 9 / 16],
  cropperOptions: () => ({}),
  preview: true,
  circle: false,
  canvasHeight: '420px',
  title: '裁剪图片',
  confirmText: '确定',
  cancelText: '取消',
  reselectText: '重新选择',
})

const emit = defineEmits<CropperUploadEmits>()

defineOptions({ name: 'CropperUpload', inheritAttrs: false })

const { prefix } = useConfig()
const base = computed(() => `${prefix.value}-cropper-upload`)

const attrs = useAttrs()
const uploadRef = ref<UploadInstance>()

/** 「重新选择」跟随 ElUpload 的 accept，未传时只选图片 */
const accept = computed(() => (attrs.accept as string | undefined) ?? 'image/*')

const visible = ref(false)
const rawFile = ref<File>()
/** 等待用户确认的裁剪结果，null 表示取消 */
let resolveCrop: ((file: File | null) => void) | undefined

/**
 * 用户未受控时由组件维护列表。
 * ElUpload 创建列表项早于 beforeUpload，缩略图取的是原图，
 * 必须拿到同一份列表才能在裁剪后把缩略图换掉。
 */
const internalFileList = ref<UploadUserFile[]>([])
const userFileList = computed(() => attrs.fileList as UploadUserFile[] | undefined)
const fileList = computed(() => userFileList.value ?? internalFileList.value)

const handleUpdateFileList = (files: UploadUserFile[]) => {
  if (!userFileList.value) internalFileList.value = files
}

/** 打开裁剪弹窗并等待用户确认 */
const crop = (file: File): Promise<File | null> => {
  rawFile.value = file
  visible.value = true
  return new Promise<File | null>((resolve) => {
    resolveCrop = resolve
  })
}

const settle = (file: File | null) => {
  visible.value = false
  resolveCrop?.(file)
  resolveCrop = undefined
}

/**
 * 弹窗内「重新选择」：只替换待裁剪的图片，上传列表项与 uid 仍沿用最初选中的文件，
 * 因此换图后确认，列表里展示的依旧是裁剪结果。
 */
const handleReselect = (file: File) => {
  if (!resolveCrop) return
  rawFile.value = file
  emit('reselect', file)
}

const handleConfirm = (file: File) => {
  const source = rawFile.value
  settle(file)
  if (source) emit('crop', file, source)
}

/**
 * 关闭弹窗统一按取消处理。
 * ElDialog 在离场动画开始时都会触发 close（包括确认后由父级把 visible 置为 false），
 * 这里以「裁剪结果还没落地」为条件，避免确认后又补发一次 cancel。
 */
const handleCancel = () => {
  if (!resolveCrop) return
  const source = rawFile.value
  settle(null)
  if (source) emit('cancel', source)
}

const handleError = (error: Error) => {
  ElMessage.error(error.message)
  emit('error', error)
  settle(null)
}

/** 把列表项的缩略图、文件名与 raw 换成实际要上传的文件 */
const replaceListItem = (uid: number, file: File) => {
  const list = fileList.value
  const item = list.find((row) => row.uid === uid)
  if (!item) return
  if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url)
  item.name = file.name
  item.size = file.size
  item.raw = item.raw ? inheritUid(file, item.raw) : (file as UploadRawFile)
  item.url = URL.createObjectURL(file)
  // 非受控场景换引用，触发 ElUpload 重新渲染列表
  handleUpdateFileList([...list])
}

/**
 * 裁剪放在 ElUpload 的 beforeUpload 阶段：
 * 取消时返回 false，ElUpload 会移除该文件并终止上传，
 * 不会把原图留在列表里；确认时返回裁剪结果作为实际上传的文件。
 *
 * 注意 ElUpload 已先用原图创建了列表项，这里同步替换缩略图。
 * 用户自定义的 beforeUpload 在裁剪之后执行，拿到的是裁剪结果。
 */
const handleBeforeUpload: UploadHooks['beforeUpload'] = async (file) => {
  const uid = file.uid
  let result: UploadRawFile = file

  if (props.cropper && isImageFile(file)) {
    const cropped = await crop(file)
    if (!cropped) return false
    result = inheritUid(cropped, file)
    replaceListItem(uid, cropped)
  }

  if (props.beforeUpload) {
    const userResult = await props.beforeUpload(result)
    if (userResult === false || userResult === null || userResult === undefined) return false
    if (userResult instanceof Blob) {
      const replaced =
        userResult instanceof File ? userResult : new File([userResult], result.name, { type: result.type })
      result = inheritUid(replaced, result)
      replaceListItem(uid, replaced)
    }
  }

  return result
}

defineExpose({ uploadRef })
</script>

<template>
  <ElUpload
    ref="uploadRef"
    v-bind="$attrs"
    :class="[base, { [`${base}--circle`]: circle }]"
    :file-list="fileList"
    :before-upload="handleBeforeUpload"
    @update:file-list="handleUpdateFileList"
  >
    <slot></slot>
    <template
      v-if="$slots.trigger"
      #trigger="scope"
    >
      <slot
        name="trigger"
        v-bind="scope"
      ></slot>
    </template>
    <template
      v-if="$slots.tip"
      #tip
    >
      <slot name="tip"></slot>
    </template>
  </ElUpload>

  <CropperDialog
    :visible="visible"
    :file="rawFile"
    :ratios="ratios"
    :ratio-labels="ratioLabels"
    :aspect-ratio="aspectRatio"
    :cropper-options="cropperOptions"
    :accept="accept"
    :preview="preview"
    :output-width="outputWidth"
    :circle="circle"
    :canvas-height="canvasHeight"
    :title="title"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :reselect-text="reselectText"
    @confirm="handleConfirm"
    @reselect="handleReselect"
    @cancel="handleCancel"
    @error="handleError"
  />
</template>
