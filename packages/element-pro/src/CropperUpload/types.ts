import type { UploadHooks } from 'element-plus'

/**
 * 透传给 vue-cropper 的配置。
 * vue-cropper 未导出组件 props 的类型定义，这里只声明 CropperUpload 关心的字段，
 * 未声明的配置不会被转发，避免与组件内部驱动的 `fixed`、`fixedNumber` 冲突。
 */
export interface CropperOptions {
  /** 是否可拖动图片 */
  canMove?: boolean
  /** 是否可拖动裁剪框 */
  canMoveBox?: boolean
  /** 固定裁剪框大小，禁止拖动改变裁剪框 */
  fixedBox?: boolean
  /** 裁剪框是否限制在图片范围内，关闭后裁剪结果可能带入画布背景 */
  centerBox?: boolean
  /** 是否显示裁剪框尺寸提示 */
  info?: boolean
  /** 是否支持滚轮 / 双指缩放 */
  canScale?: boolean
  /** 图片布局方式，`contain` 居中留白、`cover` 填满容器 */
  mode?: string
  /** 是否按 dpr 输出高清结果 */
  high?: boolean
  /** 导出放大倍数 */
  enlarge?: number
  /** 图片最大尺寸，超过该边长会先等比压缩再裁剪 */
  maxImgSize?: number
  /** 导出图片质量，0-1，仅 jpeg / webp 生效 */
  outputSize?: number
  /** 导出时填充的背景色，如 `#fff`；不传时透明区域保持透明 */
  fillColor?: string
}

/** Cropper 实例上用到的方法与只读状态，避免直接依赖 vue-cropper 宽松的组件类型。 */
export interface CropperInstance {
  /** 图片显示尺寸（已按 maxImgSize 压缩） */
  readonly trueWidth: number
  readonly trueHeight: number
  /** 当前缩放比例，由裁剪器内部维护 */
  readonly scale: number
  /** 导出裁剪结果为 Blob，回调参数为 null 表示导出失败 */
  getCropBlob: (callback: (blob: Blob | null) => void) => void
  /** 缩放图片，正数放大、负数缩小；步长按 `20 / 图片短边` 换算 */
  changeScale: (factor: number) => void
  /** 逆时针旋转 90° */
  rotateLeft: () => void
  /** 顺时针旋转 90° */
  rotateRight: () => void
  /** 按当前 fixed / fixedNumber 重新生成并居中裁剪框 */
  goAutoCrop: () => void
}

/** vue-cropper `real-time` 事件回传的预览数据，用于右侧实时预览 */
export interface CropperPreview {
  /** 裁剪框宽度（px） */
  w: number
  /** 裁剪框高度（px） */
  h: number
  /** 原始图片地址 */
  url: string
  /** 图片的尺寸与 transform，直接绑定到预览区的 img 上 */
  img: { width: string; height: string; transform: string }
}

export interface CropperUploadProps {
  /**
   * 自定义上传前钩子，与 `ElUpload` 同名 prop。
   * 裁剪之后执行，拿到的是裁剪结果（取消裁剪时不会执行）。
   * 返回 `false` 终止本次上传，返回 Blob / File 可再次替换上传文件。
   */
  beforeUpload?: UploadHooks['beforeUpload']
  /** 是否启用裁剪，置为 `false` 时退化为原生 `ElUpload` */
  cropper?: boolean
  /** 初始裁剪比例，也支持 `4/3` 字符串写法；需出现在 `ratios` 中，否则以 `ratios` 第一项为准 */
  aspectRatio?: number | string
  /** 弹窗内可切换的比例列表，`0` 表示自由比例；只传一项时不展示比例切换 */
  ratios?: number[]
  /**
   * 比例按钮文案，与 `ratios` 一一对应；未传时按比例自动生成（`1` → `1:1`、`0` → `自由`）。
   * 用于把自由比例显示成「自定义」这类业务文案。
   */
  ratioLabels?: string[]
  /** 透传给 vue-cropper 的配置，如 `canMove`、`fixedBox`、`mode` */
  cropperOptions?: CropperOptions
  /** 是否展示右侧实时预览与输出尺寸提示 */
  preview?: boolean
  /**
   * 固定输出宽度（px）。设置后确认时按该宽度等比缩放导出，高度由裁剪比例换算，
   * 不再受 dpr / `enlarge` 影响；不设置时按裁剪框尺寸 × dpr 输出。
   */
  outputWidth?: number
  /** 圆形裁剪，用于头像等场景，置为 `true` 时裁剪框为正圆 */
  circle?: boolean
  /** 裁剪画布区域高度 */
  canvasHeight?: number | string
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 取消按钮文案 */
  cancelText?: string
  /** 「重新选择」按钮文案，设置后可在弹窗内换图而不关闭 */
  reselectText?: string
}

export interface CropperUploadEmits {
  /** 裁剪完成，参数为裁剪结果与原始文件 */
  crop: [file: File, rawFile: File]
  /** 用户取消裁剪（含点击关闭、按下 ESC） */
  cancel: [rawFile: File]
  /** 读取图片或生成裁剪结果失败 */
  error: [error: Error]
  /** 弹窗内重新选择了图片，组件已换成新图继续裁剪 */
  reselect: [rawFile: File]
}

/** 裁剪弹窗的内部契约，仅在 CropperUpload 内部流转。 */
export interface CropperDialogProps {
  visible: boolean
  /** 待裁剪的原始文件 */
  file?: File
  ratios: number[]
  /** 比例按钮文案，与 `ratios` 一一对应 */
  ratioLabels?: string[]
  aspectRatio: number | string
  cropperOptions?: CropperOptions
  /** 「重新选择」时的文件过滤，跟随 ElUpload 的 accept */
  accept?: string
  preview: boolean
  outputWidth?: number
  circle: boolean
  title: string
  confirmText: string
  cancelText: string
  reselectText: string
  canvasHeight: number | string
}

export interface CropperDialogEmits {
  confirm: [file: File]
  cancel: []
  error: [error: Error]
  /** 弹窗内「重新选择」了图片，父级用它替换当前待裁剪文件 */
  reselect: [file: File]
}
