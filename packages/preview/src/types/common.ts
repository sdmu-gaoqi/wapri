/**
 * 预览包的公共类型：输入来源、统一句柄与进度。
 */

export type PreviewKind = 'text' | 'pdf' | 'word' | 'xlsx'

/** 需要额外请求头的远程文件 */
export interface PreviewUrlSource {
  url: string
  /** 用于识别类型与展示的名称，远程地址推导不出来时传 */
  fileName?: string
  headers?: Record<string, string>
}

export type PreviewInput = File | Blob | ArrayBuffer | ArrayBufferView | string | PreviewUrlSource

export interface PreviewProgress {
  /** 当前阶段 */
  stage: 'loading' | 'parsing' | 'layout' | 'rendering' | 'ready'
  /** 已完成数量，总量未知时为 0 */
  loaded: number
  /** 总量，未知时为 0 */
  total: number
  message?: string
}

export interface PreviewTheme {
  /** 正文颜色 */
  color?: string
  /** 次要文本 / 边框颜色 */
  mutedColor?: string
  /** 页面背景 */
  background?: string
  /** 纸张背景 */
  paper?: string
  /** 强调色，用于链接、选中 sheet */
  accent?: string
  /** 正文字体族 */
  fontFamily?: string
  /** 正文字号，px */
  fontSize?: number
  /** 行高倍数 */
  lineHeight?: number
}

export interface BasePreviewOptions {
  /** 挂载容器或选择器 */
  container: HTMLElement | string
  /** 追加到根节点的 class */
  className?: string
  /** 是否开启可视区域懒渲染，默认 true */
  lazy?: boolean
  /** 提前渲染的屏幕数，默认 1 */
  overscan?: number
  /** 主题覆盖 */
  theme?: PreviewTheme
  onProgress?: (progress: PreviewProgress) => void
}

export interface PreviewHandle<K extends PreviewKind = PreviewKind> {
  readonly kind: K
  readonly container: HTMLElement
  /** 总单元数：文本为分块数，PDF / Word 为页数，XLSX 为行数 */
  readonly unitCount: number
  /** 已经渲染的单元数 */
  readonly renderedCount: number
  /** 立即渲染全部内容，用于打印或导出 */
  renderAll(): void
  /** 滚动到指定单元 */
  scrollTo(index: number): void
  /** 重新计算容器尺寸并重排 */
  refresh(): void
  /** 释放 canvas、worker、objectURL */
  destroy(): void
}
