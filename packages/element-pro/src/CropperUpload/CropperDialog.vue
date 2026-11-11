<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { VueCropper } from 'vue-cropper'
import { ElButton, ElButtonGroup, ElDialog, ElMessage, ElTooltip } from 'element-plus'
import { Refresh, RefreshLeft, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import 'vue-cropper/dist/index.css'
import { useConfig } from '../ConfigProvider/context'
import {
  blobToCanvas,
  canvasToFile,
  clipEllipseCanvas,
  cropImageCanvas,
  formatRatio,
  getOutputFormat,
  isImageFile,
  parseRatio,
  resizeCanvas,
  rotateCanvas,
  splitRatio,
} from './utils'
import type { SourceRect } from './utils'
import type { CropperDialogEmits, CropperDialogProps, CropperInstance } from './types'
import './styles/index.scss'

const props = defineProps<CropperDialogProps>()
const emit = defineEmits<CropperDialogEmits>()

defineOptions({ name: 'CropperDialog' })

/** 每次点击缩放按钮的相对步长，与原 vue-advanced-cropper 的 0.1 保持一致 */
const ZOOM_STEP = 0.1
/** 固定比例下裁剪框占图片可用区域的占比，留一点边距方便拖动；自由比例直接铺满整张图 */
const CROP_COVERAGE = 0.9
/** 图片就绪后校正容器 / 缩放 / 居中的最大重试帧数，避免测量未就绪时回退到默认裁剪框 */
const SYNC_MAX_ATTEMPTS = 20
/** 右侧预览区的最大绘制尺寸，预览按比例缩放到这个范围内 */
const PREVIEW_WIDTH = 180
const PREVIEW_HEIGHT = 260

const { prefix } = useConfig()
const base = computed(() => `${prefix.value}-cropper-upload`)

const cropperRef = shallowRef<CropperInstance>()
const canvasRef = ref<HTMLDivElement>()
const previewCanvasRef = ref<HTMLCanvasElement>()
/** 预览框尺寸，绘制后按裁剪结果比例更新，未绘制前按当前比例占位 */
const previewFrame = ref<{ width: number; height: number }>()
/** 画布尺寸观察器：图片比容器先就绪时，等布局稳定后再校正一次 */
let canvasObserver: ResizeObserver | undefined
/** 预览重绘的 rAF 句柄，拖动时合并到下一帧 */
let previewFrameId = 0
const fileInputRef = ref<HTMLInputElement>()
/** vue-cropper 的内部状态（scale / 裁剪框坐标）不是响应式的，用它触发尺寸提示与预览重算 */
const cropVersion = ref(0)
/** 图片加载完成前不允许确认，避免裁剪到空白画布 */
const ready = ref(false)
const confirming = ref(false)
const ratioIndex = ref(0)
const source = ref('')

/** objectURL 只在文件变化时创建，切换或卸载时释放，避免泄漏与重复解码 */
const setSource = (file?: File) => {
  if (source.value) URL.revokeObjectURL(source.value)
  source.value = file ? URL.createObjectURL(file) : ''
  // 换图后旧预览与就绪状态失效，等新图加载完成再恢复
  ready.value = false
  previewFrame.value = undefined
}

watch(
  () => props.file,
  (file) => {
    setSource(file)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  canvasObserver?.disconnect()
  canvasObserver = undefined
  cancelAnimationFrame(previewFrameId)
  setSource()
})

/** aspectRatio 允许以 4/3、"4/3" 形式传入，这里统一转成数字 */
const initialRatio = computed(() => parseRatio(props.aspectRatio))

/** 打开时按 aspectRatio 定位初始比例，未匹配则取第一项 */
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      // 关闭时解除尺寸观察，下次打开重新挂载画布后由 img-load 再次接管
      canvasObserver?.disconnect()
      canvasObserver = undefined
      return
    }
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

/** 比例按钮文案：优先取 `ratioLabels` 同位置的值，未传时按比例自动生成 */
const ratioLabelOf = (index: number, ratio: number): string => {
  const label = props.ratioLabels?.[index]
  return label ? label : formatRatio(ratio)
}

/**
 * vue-cropper 用 `fixed` + `fixedNumber` 锁定裁剪框比例：
 * `fixed` 关闭时裁剪框可任意拉伸，即自由比例。
 */
const fixed = computed(() => currentRatio.value > 0)
const fixedNumber = computed(() => splitRatio(currentRatio.value))

/** 透传配置，未传的字段使用 vue-cropper 的默认行为 */
const options = computed(() => props.cropperOptions ?? {})

/** 布局模式是否为 contain（与 vue-cropper 的 mode 解析保持一致，取第一个空格前的词） */
const isContainMode = computed(() => (options.value.mode ?? 'contain').split(' ')[0] === 'contain')

/** 输出格式：圆形裁剪固定 png 保留透明四角，其余跟随原图 */
const outputFormat = computed(() => {
  if (props.circle) return 'png'
  return props.file ? getOutputFormat(props.file) : 'png'
})

/** 带预览时弹窗更宽，预览关闭时保持原来的紧凑宽度 */
const dialogWidth = computed(() => (props.preview ? '900px' : '680px'))

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 图片就绪后校正布局并按当前比例生成裁剪框。
 *
 * vue-cropper 在图片 onload 时用 getComputedStyle 测量容器，弹窗刚挂载的瞬间
 * 可能测到 0：contain 模式下 scale 会被算成 0、图片坐标 x/y 变成 NaN
 * （图片顶到左上角、不居中），裁剪框则回退到它默认的容器 80%，
 * 表现就是图片不居中、「自由」比例也盖不住整张图。
 * 它没有公开「居中图片」的方法（refresh / reload 内部还是同一套测量），
 * 所以这里以真实 DOM 测量为准，逐帧等到尺寸就绪后一次性写回
 * 容器尺寸、缩放比例、图片居中坐标，再按比例生成裁剪框。
 *
 * @param resetScale 是否按 contain 语义重算缩放比例：首次加载与弹窗打开完成时重算，
 * 切换比例时保留用户已经调过的缩放。
 */
const applyCrop = async (resetScale = false) => {
  for (let attempt = 0; attempt < SYNC_MAX_ATTEMPTS; attempt++) {
    await nextTick()
    const cropper = cropperRef.value
    const canvas = canvasRef.value
    if (!cropper || !canvas) return
    const boxWidth = canvas.clientWidth
    const boxHeight = canvas.clientHeight
    const naturalWidth = cropper.trueWidth
    const naturalHeight = cropper.trueHeight
    if (!boxWidth || !boxHeight || !naturalWidth || !naturalHeight) {
      await nextFrame()
      continue
    }
    let scale = cropper.scale
    // contain 语义：按容器等比缩放，只缩小不放大小图；容器测到 0 时 scale 会变成 0，这里一并纠正
    if (isContainMode.value && (resetScale || scale <= 0)) {
      scale = Math.min(1, boxWidth / naturalWidth, boxHeight / naturalHeight)
      if (scale !== cropper.scale) cropper.scale = scale
    }
    if (scale <= 0) {
      await nextFrame()
      continue
    }
    // 容器尺寸与图片位置以真实测量为准，保证图片水平垂直居中
    cropper.w = boxWidth
    cropper.h = boxHeight
    cropper.x = -(naturalWidth - naturalWidth * scale) / 2 + (boxWidth - naturalWidth * scale) / 2
    cropper.y = -(naturalHeight - naturalHeight * scale) / 2 + (boxHeight - naturalHeight * scale) / 2
    // 旋转 90° 的奇数倍后显示宽高互换
    const rotated = Math.abs(cropper.rotate) % 2 > 0
    const displayWidth = (rotated ? naturalHeight : naturalWidth) * scale
    const displayHeight = (rotated ? naturalWidth : naturalHeight) * scale
    const ratio = currentRatio.value
    const coverage = ratio > 0 ? CROP_COVERAGE : 1
    const baseWidth = ratio > 0 ? Math.min(displayWidth, displayHeight * ratio) : displayWidth
    const baseHeight = ratio > 0 ? baseWidth / ratio : displayHeight
    cropper.goAutoCrop(baseWidth * coverage, baseHeight * coverage)
    schedulePreview()
    return
  }
  // 尺寸始终没就绪时退回 vue-cropper 的默认裁剪框，保证至少有框可用
  cropperRef.value?.goAutoCrop()
}

/** 容器尺寸变化（首次布局、弹窗动画结束、窗口缩放）后重新校正，幂等 */
const watchCanvasSize = () => {
  const canvas = canvasRef.value
  if (!canvas || canvasObserver) return
  canvasObserver = new ResizeObserver(() => {
    if (!ready.value) return
    void applyCrop(true)
  })
  canvasObserver.observe(canvas)
}

/**
 * vue-cropper 的 img-load 会回传 'success' / 'error' 或 Error，
 * 这里统一转成 ready 状态与对外错误事件。
 */
const handleImageLoad = (status: string | Error) => {
  if (status === 'success') {
    ready.value = true
    watchCanvasSize()
    void applyCrop(true)
    schedulePreview()
    return
  }
  ready.value = false
  emit('error', status instanceof Error ? status : new Error('图片加载失败，请更换图片后重试'))
}

/**
 * 弹窗打开动画结束后再校正一次：此时容器尺寸一定是最终值，
 * 用来兜住图片加载过快、测量发生在布局稳定之前的场景。
 */
const handleDialogOpened = () => {
  if (!ready.value) return
  void applyCrop(true)
}

/**
 * 裁剪框在「原图像素」中的矩形，导出与右侧预览共用这一份换算，保证所见即所得。
 *
 * vue-cropper 的图片元素是固定 trueWidth × trueHeight 的盒子，变换为
 * `scale(s) translate3d(x/s, y/s) rotateZ(r*90deg)`，transform-origin 是元素中心，
 * 因此某个像素 p（原图坐标）落到容器里的位置是：
 *   screen = center + s × R(p - c)，其中 c 是原图中心、center = c + (x, y)。
 * 反解即：p = c + R⁻¹(screen - center) / s，旋转与缩放一并还原，
 * r 为 0/1/2/3 都能用同一套公式（180° 也不再需要特殊处理）。
 */
const resolveSourceRect = (cropper: CropperInstance): SourceRect => {
  const scale = cropper.scale || 1
  const imageLeft = (cropper.trueWidth * (1 - scale)) / 2 + cropper.x
  const imageTop = (cropper.trueHeight * (1 - scale)) / 2 + cropper.y
  const centerX = imageLeft + (cropper.trueWidth * scale) / 2
  const centerY = imageTop + (cropper.trueHeight * scale) / 2
  const rad = (-cropper.rotate * Math.PI) / 2
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const toPixel = (screenX: number, screenY: number) => {
    const dx = screenX - centerX
    const dy = screenY - centerY
    return {
      x: cropper.trueWidth / 2 + (dx * cos - dy * sin) / scale,
      y: cropper.trueHeight / 2 + (dx * sin + dy * cos) / scale,
    }
  }
  const cropX = cropper.cropOffsertX
  const cropY = cropper.cropOffsertY
  const start = toPixel(cropX, cropY)
  const end = toPixel(cropX + cropper.cropW, cropY + cropper.cropH)
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

/** 裁剪器里正在展示的原图元素，直接复用已解码的图片，避免重新加载 */
const getSourceImage = (): HTMLImageElement | null =>
  canvasRef.value?.querySelector<HTMLImageElement>('.cropper-box-canvas img') ?? null

/**
 * 绘制右侧预览：直接按 `resolveSourceRect` 的结果从原图裁一块画到 canvas 上。
 * 不再使用 vue-cropper 的 `real-time` 数据——它给的是内部中间态坐标，
 * 切换比例时容易和裁剪框、图片位置对不上，导致预览错位。
 */
const drawPreview = () => {
  const canvas = previewCanvasRef.value
  const cropper = cropperRef.value
  const image = getSourceImage()
  if (!canvas || !cropper || !image) return
  const rect = resolveSourceRect(cropper)
  if (!(rect.width > 0) || !(rect.height > 0)) return

  // 旋转 90° 的奇数倍时，源区在画面里的横竖是互换的
  const quarter = Math.abs(cropper.rotate) % 2 > 0
  const ratio = quarter ? rect.height / rect.width : rect.width / rect.height
  const width = Math.round(Math.min(PREVIEW_WIDTH, PREVIEW_HEIGHT * ratio))
  const height = Math.round(width / ratio)
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  previewFrame.value = { width, height }

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // 按画布宽度反推源区的绘制尺寸，再整体绕中心旋转（180° / 270° 同样适用）
  const drawWidth = (canvas.width * rect.width) / (quarter ? rect.height : rect.width)
  const drawHeight = (drawWidth * rect.height) / rect.width
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((cropper.rotate * Math.PI) / 2)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()
}

/** 预览重绘合并到下一帧，拖动裁剪框时不会每毫秒重绘 */
const schedulePreview = () => {
  // 内部状态变了就换一版，让尺寸提示这类 computed 跟着重算
  cropVersion.value++
  if (previewFrameId) return
  previewFrameId = requestAnimationFrame(() => {
    previewFrameId = 0
    drawPreview()
  })
}

/** 裁剪框 / 图片位置变化时 vue-cropper 会发 `real-time`，这里只当作重绘信号，不用它的数据 */
const handleRealTime = () => {
  schedulePreview()
}

const previewFrameStyle = computed(() => {
  const frame = previewFrame.value
  if (frame) return { width: `${frame.width}px`, height: `${frame.height}px` }
  const ratio = currentRatio.value || 1
  const width = Math.round(Math.min(PREVIEW_WIDTH, PREVIEW_HEIGHT * ratio))
  return { width: `${width}px`, height: `${Math.round(width / ratio)}px` }
})

/** 固定输出宽度，非法值按未设置处理 */
const targetWidth = computed(() => {
  const width = Number(props.outputWidth ?? 0)
  return Number.isFinite(width) && width > 0 ? Math.round(width) : 0
})

/** 导出尺寸（原图像素）；旋转 90° 的奇数倍时宽高互换 */
const outputSize = computed(() => {
  // 依赖 cropVersion，vue-cropper 内部状态变化（拖动 / 缩放 / 旋转）后才会重算
  void cropVersion.value
  const cropper = cropperRef.value
  if (!cropper || !cropper.cropW || !cropper.cropH) return { width: 0, height: 0 }
  const rect = resolveSourceRect(cropper)
  const rotated = Math.abs(cropper.rotate) % 2 > 0
  return {
    width: Math.round(rotated ? rect.height : rect.width),
    height: Math.round(rotated ? rect.width : rect.height),
  }
})

/** 固定输出高度：按裁剪结果比例换算，只有 width/height 都可用时才有值 */
const targetHeight = computed(() => {
  const { width, height } = outputSize.value
  if (!targetWidth.value || !width || !height) return 0
  return Math.round(targetWidth.value / (width / height))
})

/**
 * 输出尺寸：配置了 `outputWidth` 时按固定宽度等比换算，
 * 否则按原图像素输出，保证不被降采样。
 */
const exportSize = computed(() => {
  const { width, height } = outputSize.value
  if (!width || !height) return ''
  if (targetWidth.value) return `${targetWidth.value} × ${targetHeight.value}`
  return `${width} × ${height}`
})

const sizeHint = computed(() => {
  const ratioText = currentRatio.value > 0 ? `固定 ${ratioLabelOf(ratioIndex.value, currentRatio.value)}` : '自由比例'
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

/**
 * 旋转后图片的显示宽高互换，按 contain 重算缩放并重建裁剪框，
 * 避免原来贴合宽图的裁剪框转成竖图后超出图片边界；
 * 旋转不会触发 vue-cropper 的 `real-time`，这里主动刷新一次预览。
 */
const handleRotate = (clockwise: boolean) => {
  const cropper = cropperRef.value
  if (!cropper) return
  if (clockwise) cropper.rotateRight()
  else cropper.rotateLeft()
  void applyCrop(true)
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
 * 生成裁剪结果画布。
 *
 * 按原图像素重绘（导出分辨率等于原图，不会被降采样变糊），旋转过的话把裁出来的
 * 那块再按同样角度转回去，保证结果与画布上看到的朝向一致；
 * 拿不到原图元素时退回 vue-cropper 的 `getCropBlob`。
 */
const buildCropCanvas = async (cropper: CropperInstance): Promise<HTMLCanvasElement> => {
  const image = getSourceImage()
  if (!image) {
    const blob = await new Promise<Blob | null>((resolve) => cropper.getCropBlob(resolve))
    if (!blob) throw new Error('裁剪失败，未能生成图片')
    return blobToCanvas(blob)
  }
  const cropped = cropImageCanvas(image, resolveSourceRect(cropper), options.value.fillColor)
  return cropper.rotate === 0 ? cropped : rotateCanvas(cropped, cropper.rotate)
}

/**
 * 导出：按 `outputWidth` 锁定宽度（高度与提示同源，避免四舍五入后差 1px），
 * 圆形裁剪再裁掉四角，只有 png 能保留透明区域。
 */
const handleConfirm = async () => {
  const cropper = cropperRef.value
  if (!cropper || !props.file || confirming.value) return
  confirming.value = true
  try {
    const cropped = await buildCropCanvas(cropper)
    const width = targetWidth.value || cropped.width
    const height = targetWidth.value
      ? targetHeight.value || Math.round(width / (cropped.width / cropped.height))
      : cropped.height
    const sized = targetWidth.value ? resizeCanvas(cropped, width, height) : cropped
    const output = props.circle ? clipEllipseCanvas(sized) : sized
    emit(
      'confirm',
      await canvasToFile(output, props.file, props.circle ? 'image/png' : undefined, options.value.outputSize),
    )
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
    @opened="handleDialogOpened"
    @close="handleClose"
  >
    <div :class="`${base}-panel`">
      <div :class="`${base}-main`">
        <div
          ref="canvasRef"
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
              {{ ratioLabelOf(index, ratio) }}
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
          <canvas
            ref="previewCanvasRef"
            :class="`${base}-preview__canvas`"
          />
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
