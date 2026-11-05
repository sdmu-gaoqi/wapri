<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { VueCropper } from 'vue-cropper'
import { ElButton, ElButtonGroup, ElDialog, ElMessage, ElTooltip } from 'element-plus'
import { Refresh, RefreshLeft, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import 'vue-cropper/dist/index.css'
import { useConfig } from '../ConfigProvider/context'
import {
  blobToCanvas,
  blobToFile,
  canvasToFile,
  clipEllipseCanvas,
  formatRatio,
  getOutputFormat,
  isImageFile,
  parseRatio,
  resizeCanvas,
  splitRatio,
} from './utils'
import type { CropperDialogEmits, CropperDialogProps, CropperInstance, CropperPreview } from './types'
import './styles/index.scss'

const props = defineProps<CropperDialogProps>()
const emit = defineEmits<CropperDialogEmits>()

defineOptions({ name: 'CropperDialog' })

/** 每次点击缩放按钮的相对步长，与原 vue-advanced-cropper 的 0.1 保持一致 */
const ZOOM_STEP = 0.1
/** 裁剪框占图片可用区域的占比，留一点边距方便拖动 */
const CROP_COVERAGE = 0.9
/** 右侧预览区的最大绘制尺寸，预览按比例缩放到这个范围内 */
const PREVIEW_WIDTH = 180
const PREVIEW_HEIGHT = 260

const { prefix } = useConfig()
const base = computed(() => `${prefix.value}-cropper-upload`)

const cropperRef = shallowRef<CropperInstance>()
const fileInputRef = ref<HTMLInputElement>()
/** 图片加载完成前不允许确认，避免裁剪到空白画布 */
const ready = ref(false)
const confirming = ref(false)
const ratioIndex = ref(0)
const source = ref('')
/** vue-cropper 实时回传的预览数据 */
const previewData = ref<CropperPreview>()

/** objectURL 只在文件变化时创建，切换或卸载时释放，避免泄漏与重复解码 */
const setSource = (file?: File) => {
  if (source.value) URL.revokeObjectURL(source.value)
  source.value = file ? URL.createObjectURL(file) : ''
  // 换图后旧预览与就绪状态失效，等新图加载完成再恢复
  ready.value = false
  previewData.value = undefined
}

watch(
  () => props.file,
  (file) => {
    setSource(file)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  setSource()
})

/** aspectRatio 允许以 4/3、"4/3" 形式传入，这里统一转成数字 */
const initialRatio = computed(() => parseRatio(props.aspectRatio))

/** 打开时按 aspectRatio 定位初始比例，未匹配则取第一项 */
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    ready.value = false
    confirming.value = false
    const matched = props.ratios.findIndex((ratio) => ratio === initialRatio.value)
    ratioIndex.value = matched === -1 ? 0 : matched
  },
)

/** 比例列表只保留合法项，空列表时退回自由比例 */
const ratios = computed(() => props.ratios.filter((ratio) => ratio >= 0))
const showRatios = computed(() => ratios.value.length > 1)
const currentRatio = computed(() => ratios.value[ratioIndex.value] ?? 0)

/**
 * vue-cropper 用 `fixed` + `fixedNumber` 锁定裁剪框比例：
 * `fixed` 关闭时裁剪框可任意拉伸，即自由比例。
 */
const fixed = computed(() => currentRatio.value > 0)
const fixedNumber = computed(() => splitRatio(currentRatio.value))

/** 透传配置，未传的字段使用 vue-cropper 的默认行为 */
const options = computed(() => props.cropperOptions ?? {})

/** 输出格式：圆形裁剪固定 png 保留透明四角，其余跟随原图 */
const outputFormat = computed(() => {
  if (props.circle) return 'png'
  return props.file ? getOutputFormat(props.file) : 'png'
})

/** 带预览时弹窗更宽，预览关闭时保持原来的紧凑宽度 */
const dialogWidth = computed(() => (props.preview ? '900px' : '680px'))

/**
 * 按当前比例在图片范围内生成裁剪框。
 *
 * vue-cropper 的自动裁剪默认取容器的 80%，图片居中留白或放大后
 * 裁剪框会越出图片边界，把画布背景裁进结果；这里改用图片的显示尺寸换算，
 * 保证裁剪框始终落在图片内部（`centerBox` 只约束拖动，不约束自动裁剪）。
 */
const applyCrop = async () => {
  await nextTick()
  const cropper = cropperRef.value
  if (!cropper) return
  const scale = cropper.scale || 1
  const displayWidth = (cropper.trueWidth || 0) * scale
  const displayHeight = (cropper.trueHeight || 0) * scale
  if (!displayWidth || !displayHeight) {
    cropper.goAutoCrop()
    return
  }
  const ratio = currentRatio.value
  const baseWidth = ratio > 0 ? Math.min(displayWidth, displayHeight * ratio) : displayWidth
  const baseHeight = ratio > 0 ? baseWidth / ratio : displayHeight
  cropper.goAutoCrop(baseWidth * CROP_COVERAGE, baseHeight * CROP_COVERAGE)
}

/**
 * vue-cropper 的 img-load 会回传 'success' / 'error' 或 Error，
 * 这里统一转成 ready 状态与对外错误事件。
 */
const handleImageLoad = (status: string | Error) => {
  if (status === 'success') {
    ready.value = true
    void applyCrop()
    return
  }
  ready.value = false
  emit('error', status instanceof Error ? status : new Error('图片加载失败，请更换图片后重试'))
}

const handleRealTime = (payload: CropperPreview) => {
  previewData.value = payload
}

/** 预览框按裁剪框比例等比缩放，图片沿用 vue-cropper 给出的 transform */
const previewScale = computed(() => {
  const data = previewData.value
  if (!data?.w || !data?.h) return 1
  return Math.min(PREVIEW_WIDTH / data.w, PREVIEW_HEIGHT / data.h)
})

const previewFrameStyle = computed(() => {
  const data = previewData.value
  if (!data?.w || !data?.h) {
    // 图片还没加载完时先按比例占位，避免面板跳动
    const ratio = currentRatio.value || 1
    return { width: `${Math.round(PREVIEW_HEIGHT * ratio)}px`, height: `${PREVIEW_HEIGHT}px` }
  }
  return {
    width: `${Math.round(data.w * previewScale.value)}px`,
    height: `${Math.round(data.h * previewScale.value)}px`,
  }
})

const previewInnerStyle = computed(() => {
  const data = previewData.value
  if (!data?.w || !data?.h) return undefined
  return { width: `${data.w}px`, height: `${data.h}px`, transform: `scale(${previewScale.value})` }
})

/** 固定输出宽度，非法值按未设置处理 */
const targetWidth = computed(() => {
  const width = Number(props.outputWidth ?? 0)
  return Number.isFinite(width) && width > 0 ? Math.round(width) : 0
})

/** 固定输出高度：按当前裁剪框比例换算，只有 width/height 都可用时才有值 */
const targetHeight = computed(() => {
  const data = previewData.value
  if (!targetWidth.value || !data?.w || !data?.h) return 0
  return Math.round(targetWidth.value / (data.w / data.h))
})

/**
 * 输出尺寸：配置了 `outputWidth` 时按固定宽度等比换算，
 * 否则与 vue-cropper 的导出算法保持一致（`enlarge` 优先，其次按 dpr 输出高清图）。
 */
const exportSize = computed(() => {
  const data = previewData.value
  if (!data?.w || !data?.h) return ''
  if (targetWidth.value) {
    return `${targetWidth.value} × ${targetHeight.value}`
  }
  const enlarge = Number(options.value.enlarge ?? 1)
  const pixelRatio = options.value.high === false ? 1 : window.devicePixelRatio || 1
  const factor = enlarge !== 1 ? Math.abs(enlarge) : pixelRatio
  return `${Math.round(data.w * factor)} × ${Math.round(data.h * factor)}`
})

const sizeHint = computed(() => {
  const ratioText = currentRatio.value > 0 ? `固定 ${formatRatio(currentRatio.value)}` : '自由比例'
  return exportSize.value ? `${ratioText}，确认后输出 ${exportSize.value}` : ratioText
})

/**
 * vue-cropper 的 changeScale 以 `coe = 20 / 图片短边` 换算步长，
 * 直接传 1 会让大图每次只缩放零点几个百分点，
 * 这里按图片短边反推系数，保证每次点击固定缩放 10%，与图片尺寸无关。
 */
const handleZoom = (direction: 1 | -1) => {
  const cropper = cropperRef.value
  if (!cropper) return
  const shortSide = Math.min(cropper.trueWidth || 0, cropper.trueHeight || 0)
  if (!shortSide) {
    cropper.changeScale(direction)
    return
  }
  cropper.changeScale((direction * ZOOM_STEP * (cropper.scale || 1) * shortSide) / 20)
}

const handleRotate = (clockwise: boolean) => {
  if (clockwise) cropperRef.value?.rotateRight()
  else cropperRef.value?.rotateLeft()
}

/** 切换比例后按新比例重建裁剪框，选中项不变时不重复重建 */
const handleRatioChange = (index: number) => {
  if (index === ratioIndex.value) return
  ratioIndex.value = index
  // applyCrop 内部等 fixed / fixedNumber 同步到子组件后再重建裁剪框
  void applyCrop()
}

/** 打开系统文件选择框换图，不关闭弹窗 */
const openFilePicker = () => {
  if (confirming.value) return
  fileInputRef.value?.click()
}

/**
 * 重新选择的文件交给父级替换当前待裁剪文件，
 * 父级更新 file 后这里会重新生成图片地址并重置预览。
 */
const handleReselectChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // 清空 value，允许再次选择同一张图
  input.value = ''
  if (!file) return
  if (!isImageFile(file)) {
    ElMessage.warning('请选择图片文件')
    return
  }
  emit('reselect', file)
}

/**
 * 裁剪结果二次加工：按 `outputWidth` 锁定输出尺寸（高度与提示同源，避免四舍五入后差 1px），
 * 圆形裁剪再裁掉四角，只有 png 能保留透明区域。
 */
const buildOutputCanvas = async (blob: Blob): Promise<HTMLCanvasElement> => {
  const source = await blobToCanvas(blob)
  const width = targetWidth.value || source.width
  const height = targetWidth.value
    ? targetHeight.value || Math.round(width / (source.width / source.height))
    : source.height
  const sized = targetWidth.value ? resizeCanvas(source, width, height) : source
  return props.circle ? clipEllipseCanvas(sized) : sized
}

const handleConfirm = async () => {
  const cropper = cropperRef.value
  if (!cropper || !props.file || confirming.value) return
  confirming.value = true
  try {
    const blob = await new Promise<Blob | null>((resolve) => cropper.getCropBlob(resolve))
    if (!blob) throw new Error('裁剪失败，未能生成图片')
    // 未固定输出宽度、也非圆形裁剪时直接复用 blob，避免多一次重编码
    const file =
      props.circle || targetWidth.value
        ? await canvasToFile(await buildOutputCanvas(blob), props.file, props.circle ? 'image/png' : undefined)
        : blobToFile(blob, props.file)
    emit('confirm', file)
  } catch (error) {
    emit('error', error instanceof Error ? error : new Error(String(error)))
  } finally {
    confirming.value = false
  }
}

/**
 * 点击关闭按钮、按 ESC 等由 ElDialog 主动关闭时触发，
 * 与「取消」按钮一起按取消处理；这里不拦截关闭动画，父组件只需把 visible 置为 false。
 */
const handleClose = () => {
  emit('cancel')
}
</script>

<template>
  <ElDialog
    class="wa-ui-cropper-upload__dialog"
    :model-value="visible"
    :title="title"
    :width="dialogWidth"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div :class="`${base}-panel`">
      <div :class="`${base}-main`">
        <div
          class="wa-ui-cropper-upload__canvas"
          :class="{ 'wa-ui-cropper-upload__canvas--circle': circle }"
          :style="{ '--wa-ui-cropper-upload-canvas-height': canvasHeight }"
        >
          <VueCropper
            v-if="visible"
            ref="cropperRef"
            class="wa-ui-cropper-upload__cropper"
            :img="source"
            :output-type="outputFormat"
            :output-size="options.outputSize ?? 1"
            auto-crop
            :fixed="fixed"
            :fixed-number="fixedNumber"
            :can-move="options.canMove ?? true"
            :can-move-box="options.canMoveBox ?? true"
            :can-scale="options.canScale ?? true"
            :fixed-box="options.fixedBox ?? false"
            :center-box="options.centerBox ?? true"
            :info="options.info ?? true"
            :mode="options.mode ?? 'contain'"
            :high="options.high ?? true"
            :enlarge="options.enlarge ?? 1"
            :max-img-size="options.maxImgSize ?? 4096"
            :fill-color="options.fillColor ?? ''"
            @img-load="handleImageLoad"
            @real-time="handleRealTime"
          />
        </div>

        <div :class="`${base}-toolbar`">
          <ElButton
            :disabled="confirming"
            @click="openFilePicker"
          >
            {{ reselectText }}
          </ElButton>

          <ElButtonGroup>
            <ElTooltip
              content="缩小"
              placement="top"
            >
              <ElButton
                :icon="ZoomOut"
                @click="handleZoom(-1)"
              />
            </ElTooltip>
            <ElTooltip
              content="放大"
              placement="top"
            >
              <ElButton
                :icon="ZoomIn"
                @click="handleZoom(1)"
              />
            </ElTooltip>
            <ElTooltip
              content="逆时针旋转 90°"
              placement="top"
            >
              <ElButton
                :icon="RefreshLeft"
                @click="handleRotate(false)"
              />
            </ElTooltip>
            <ElTooltip
              content="顺时针旋转 90°"
              placement="top"
            >
              <ElButton
                :icon="Refresh"
                @click="handleRotate(true)"
              />
            </ElTooltip>
          </ElButtonGroup>

          <ElButtonGroup v-if="showRatios">
            <ElButton
              v-for="(ratio, index) in ratios"
              :key="index"
              :type="index === ratioIndex ? 'primary' : undefined"
              @click="handleRatioChange(index)"
            >
              {{ formatRatio(ratio) }}
            </ElButton>
          </ElButtonGroup>

          <input
            ref="fileInputRef"
            class="wa-ui-cropper-upload__file"
            type="file"
            :accept="accept"
            @change="handleReselectChange"
          />
        </div>
      </div>

      <aside
        v-if="preview"
        :class="`${base}-preview`"
      >
        <p :class="`${base}-preview__title`">预览</p>
        <div
          :class="[`${base}-preview__frame`, { [`${base}-preview__frame--circle`]: circle }]"
          :style="previewFrameStyle"
        >
          <div
            v-if="previewData"
            :class="`${base}-preview__inner`"
            :style="previewInnerStyle"
          >
            <img
              :src="previewData.url"
              :style="previewData.img"
              alt=""
            />
          </div>
        </div>
        <p :class="`${base}-preview__hint`">{{ sizeHint }}</p>
      </aside>
    </div>

    <template #footer>
      <ElButton @click="handleClose">{{ cancelText }}</ElButton>
      <ElButton
        type="primary"
        :loading="confirming"
        :disabled="!ready"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </ElButton>
    </template>
  </ElDialog>
</template>
