<script setup lang="ts" generic="T extends FileModalAsset">
import { computed, ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import CropperDialog from '../../CropperUpload/CropperDialog.vue'
import { useConfig } from '../../ConfigProvider/context'
import { resolveCropperRatios } from '../utils'
import type { FileModalAsset, FileModalUpload } from '../types'

/** 文件大类的中文名，仅用于类型校验失败时的提示文案 */
const KIND_LABELS: Record<string, string> = { image: '图片', video: '视频', audio: '音频' }

const props = defineProps<{
  /** 上传回调，未传时不渲染按钮 */
  upload?: FileModalUpload<T>
  /** 当前分组 id，随上传一起回传 */
  groupId?: string
  text: string
  /**
   * 可选的裁剪比例，**空数组表示不裁剪**。
   * 非空时才打开裁剪弹窗，`0` 表示「自定义」——按图片本身的宽高等比裁剪。
   * 只支持 9:16 时传 `[9 / 16]`，同时支持 9:16 与 16:9 时传 `[9 / 16, 16 / 9]`。
   */
  ratios: number[]
  /** 与 `ratios` 一一对应的按钮文案，缺省项按比例自动生成 */
  ratioLabels: string[]
  title: string
  /** 可选的文件类型，同时决定要求的文件大类（如 `image/*`、`video/*`） */
  accept: string
}>()

const emit = defineEmits<{
  uploaded: [asset: T]
  error: [error: Error]
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalUploadButton' })

const base = computed(() => `${prefix.value}-file-modal`)

const fileInputRef = ref<HTMLInputElement>()
/** 裁剪弹窗只处理图片，视频等其它类型选完直接上传 */
const cropperVisible = ref(false)
const rawFile = ref<File>()
const uploading = ref(false)

/** 打开裁剪弹窗前按当前图片算好的比例与文案 */
const dialogRatios = ref<number[]>([1])
const dialogLabels = ref<string[]>([])
const dialogAspectRatio = ref(1)

/** 读取图片真实宽高比；读不出来时退回 1:1，保证裁剪器仍可用 */
const readImageRatio = (file: File): Promise<number> =>
  new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1
      resolve(ratio)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(1)
    }
    image.src = url
  })

/**
 * 比例配置里的 `0` 是「自定义」，要按这张图片自身的宽高比展开后再交给裁剪器。
 * 转换放在打开弹窗前完成，避免弹窗打开期间改 `ratios` 而裁剪框不重建。
 */
const buildDialogRatios = async (file: File): Promise<void> => {
  const imageRatio = await readImageRatio(file)
  const resolved = resolveCropperRatios(props.ratios, props.ratioLabels, imageRatio)
  dialogRatios.value = resolved.ratios
  dialogLabels.value = resolved.labels
  // 默认选中第一项，配合「自定义」放在首位即可实现「默认按图片原比例裁剪」
  dialogAspectRatio.value = dialogRatios.value[0] ?? 1
}

const pick = (): void => {
  if (uploading.value) return
  fileInputRef.value?.click()
}

/** 是否启用裁剪：`ratios` 为空表示不裁剪，选完直接上传原图 */
const cropperEnabled = computed(() => props.ratios.length > 0)

/** `accept` 里声明的文件大类，如 `image/*` 取 image；未按 `类型/*` 声明时不做类型校验 */
const acceptKind = computed(() => /^(\w+)\/\*$/.exec(props.accept.trim())?.[1])

/** 真正发起上传，裁剪与不裁剪两条路径共用 */
const submitUpload = async (file: File): Promise<void> => {
  if (!props.upload) return
  uploading.value = true
  try {
    const asset = await props.upload(file, { groupId: props.groupId })
    emit('uploaded', asset)
  } catch (error: unknown) {
    const reason = error instanceof Error ? error : new Error(String(error))
    ElMessage.error(reason.message)
    emit('error', reason)
  } finally {
    uploading.value = false
  }
}

const handleFileChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // 清空 value，允许再次选择同一个文件
  input.value = ''
  if (!file) return
  const kind = file.type.split('/')[0] || ''
  if (acceptKind.value && kind !== acceptKind.value) {
    ElMessage.warning(`请选择${KIND_LABELS[acceptKind.value] ?? acceptKind.value}文件`)
    return
  }
  // 只有图片参与裁剪，视频等其它类型原文件直传
  if (kind !== 'image' || !cropperEnabled.value) {
    await submitUpload(file)
    return
  }
  await buildDialogRatios(file)
  rawFile.value = file
  cropperVisible.value = true
}

const handleConfirm = async (file: File): Promise<void> => {
  cropperVisible.value = false
  rawFile.value = undefined
  await submitUpload(file)
}

const handleCancel = (): void => {
  cropperVisible.value = false
  rawFile.value = undefined
}

const handleReselect = async (file: File): Promise<void> => {
  await buildDialogRatios(file)
  rawFile.value = file
}

const handleCropperError = (error: Error): void => {
  ElMessage.error(error.message)
  emit('error', error)
  cropperVisible.value = false
  rawFile.value = undefined
}

defineExpose({ pick, uploading })
</script>

<template>
  <span :class="`${base}__upload`">
    <ElButton
      type="primary"
      :icon="Upload"
      :loading="uploading"
      @click="pick"
    >
      {{ text }}
    </ElButton>
    <input
      ref="fileInputRef"
      :class="`${base}__file`"
      type="file"
      :accept="accept"
      @change="handleFileChange"
    />
  </span>

  <CropperDialog
    :visible="cropperVisible"
    :file="rawFile"
    :ratios="dialogRatios"
    :ratio-labels="dialogLabels"
    :aspect-ratio="dialogAspectRatio"
    :preview="true"
    :circle="false"
    :title="title"
    confirm-text="确定"
    cancel-text="取消"
    reselect-text="重新选择"
    canvas-height="360px"
    :accept="accept"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @reselect="handleReselect"
    @error="handleCropperError"
  />
</template>
