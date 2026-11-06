/**
 * 预览包常量：class 前缀、默认尺寸与分块参数。
 */

export const PREVIEW_PACKAGE_NAME = '@wapri/preview'

/** 所有节点 class 统一用它做前缀，便于业务方覆盖样式 */
export const PREVIEW_PREFIX = 'wa-preview'

export const PREVIEW_CLASS = {
  root: PREVIEW_PREFIX,
  viewport: `${PREVIEW_PREFIX}__viewport`,
  page: `${PREVIEW_PREFIX}__page`,
  pageCanvas: `${PREVIEW_PREFIX}__page-canvas`,
  pageLabel: `${PREVIEW_PREFIX}__page-label`,
  thumbnails: `${PREVIEW_PREFIX}__thumbnails`,
  thumbnail: `${PREVIEW_PREFIX}__thumbnail`,
  text: `${PREVIEW_PREFIX}__text`,
  textChunk: `${PREVIEW_PREFIX}__text-chunk`,
  textLine: `${PREVIEW_PREFIX}__text-line`,
  sheetTabs: `${PREVIEW_PREFIX}__sheet-tabs`,
  sheetTab: `${PREVIEW_PREFIX}__sheet-tab`,
  sheetTabActive: `${PREVIEW_PREFIX}__sheet-tab--active`,
  grid: `${PREVIEW_PREFIX}__grid`,
  gridHeader: `${PREVIEW_PREFIX}__grid-header`,
  gridCell: `${PREVIEW_PREFIX}__grid-cell`,
  gridRow: `${PREVIEW_PREFIX}__grid-row`,
  empty: `${PREVIEW_PREFIX}__empty`,
  error: `${PREVIEW_PREFIX}__error`,
} as const

/** 文本预览默认按 80 行分一块 */
export const TEXT_CHUNK_LINES = 80

/** XLSX 默认行列尺寸，单位 px */
export const XLSX_DEFAULT_COL_WIDTH = 100
export const XLSX_DEFAULT_ROW_HEIGHT = 24
/** 单表最多解析单元格数量，避免超大表把内存打爆 */
export const XLSX_MAX_CELLS = 200_000

/** Word 默认页面为 A4 @96dpi */
export const WORD_PAGE_WIDTH = 794
export const WORD_PAGE_HEIGHT = 1123
export const WORD_PAGE_PADDING = 72

/** PDF 缩略图宽度 */
export const PDF_THUMBNAIL_WIDTH = 96

/** 默认主题 */
export const DEFAULT_THEME = {
  color: '#1f2329',
  mutedColor: '#8f959e',
  background: '#f2f3f5',
  paper: '#ffffff',
  accent: '#3370ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  fontSize: 14,
  lineHeight: 1.7,
} as const
