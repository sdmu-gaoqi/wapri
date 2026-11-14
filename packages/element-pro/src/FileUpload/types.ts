/** `FileUpload` 的属性。 */
export interface FileUploadProps {
  /** 允许的文件类型，写法同原生 `input[type=file]` 的 accept，拖入的文件同样按它过滤 */
  accept?: string
  /** 面板宽度，数字按 `px`，默认 240；需要撑满容器时传 `'100%'` */
  width?: number | string
  /** 是否允许多选，默认 `false` */
  multiple?: boolean
  /** 禁用上传入口，默认 `false` */
  disabled?: boolean
  /** 上传中：展示 loading 图标并禁用交互，状态由业务维护 */
  loading?: boolean
  /** 标题文案，默认「上传素材」 */
  title?: string
  /** 上传中的标题文案，默认「上传中」 */
  loadingText?: string
  /** 提示文案，默认「拖拽文件到此处」 */
  tip?: string
  /** 是否展示自带的「直接上传」按钮，默认 `true`；使用 `actions` 插槽时通常关掉 */
  showUploadButton?: boolean
  /** 「直接上传」按钮文案，默认「直接上传」 */
  uploadText?: string
  /** 点击面板空白处是否打开文件选择框，默认 `true` */
  clickToPick?: boolean
}

export interface FileUploadEmits {
  /** 选中或拖入的文件，已按 `accept` 过滤；`multiple` 为 `false` 时最多一个 */
  select: [files: File[]]
  /** 被 `accept` 过滤掉的文件，业务可据此提示 */
  reject: [files: File[]]
}

/** `actions` 插槽的上下文。 */
export interface FileUploadActionSlotProps {
  /** 打开文件选择框 */
  open: () => void
}

export interface FileUploadSlots {
  /** 自定义图标 */
  icon?: () => unknown
  /** 按钮区；提供后替换自带的「直接上传」按钮，用 `open` 保留直接选文件的能力 */
  actions?: (props: FileUploadActionSlotProps) => unknown
}

export interface FileUploadExpose {
  /** 打开文件选择框 */
  open: () => void
}
