/**
 * 预览基础样式一次性注入。
 *
 * 不产出独立 css 文件，避免消费方还要额外引样式；所有 class 都带 `wa-preview` 前缀，
 * 业务方可按需覆盖。
 */

import { PREVIEW_CLASS, PREVIEW_PREFIX } from '../constant'

const STYLE_ID = `${PREVIEW_PREFIX}-style`

const STYLES = `
.${PREVIEW_CLASS.root} {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--wa-preview-color, #1f2329);
  background: var(--wa-preview-background, #f2f3f5);
  font-family: var(--wa-preview-font-family, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif);
  font-size: var(--wa-preview-font-size, 14px);
  line-height: var(--wa-preview-line-height, 1.7);
  -webkit-overflow-scrolling: touch;
}
.${PREVIEW_CLASS.viewport} {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.${PREVIEW_CLASS.page} {
  position: relative;
  margin: 12px auto;
  background: var(--wa-preview-paper, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.${PREVIEW_CLASS.pageCanvas} {
  display: block;
  width: 100%;
  height: 100%;
}
.${PREVIEW_CLASS.pageLabel} {
  position: absolute;
  right: 8px;
  bottom: 4px;
  color: var(--wa-preview-muted, #8f959e);
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
}
.${PREVIEW_CLASS.thumbnails} {
  display: flex;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.86);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.${PREVIEW_CLASS.thumbnail} {
  position: relative;
  flex: 0 0 auto;
  padding: 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--wa-preview-paper, #fff);
  cursor: pointer;
}
.${PREVIEW_CLASS.thumbnail} canvas {
  display: block;
  width: 100%;
  height: auto;
}
.${PREVIEW_CLASS.text} {
  margin: 0;
  padding: 16px;
  color: var(--wa-preview-color, #1f2329);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
  word-break: break-word;
  tab-size: 4;
}
.${PREVIEW_CLASS.textChunk} {
  min-height: 24px;
}
.${PREVIEW_CLASS.textLine} {
  display: block;
  min-height: 1.7em;
  white-space: pre-wrap;
  word-break: break-all;
}
.${PREVIEW_CLASS.sheetTabs} {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  overflow-x: auto;
  background: var(--wa-preview-paper, #fff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.${PREVIEW_CLASS.sheetTab} {
  flex: 0 0 auto;
  padding: 4px 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--wa-preview-muted, #8f959e);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.${PREVIEW_CLASS.sheetTabActive} {
  color: var(--wa-preview-accent, #3370ff);
  background: rgba(51, 112, 255, 0.1);
}
.${PREVIEW_CLASS.grid} {
  position: relative;
  background: var(--wa-preview-paper, #fff);
  font-size: 13px;
  line-height: 1.4;
}
.${PREVIEW_CLASS.gridHeader} {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  background: #f7f8fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.${PREVIEW_CLASS.gridRow} {
  display: flex;
}
.${PREVIEW_CLASS.gridCell} {
  position: absolute;
  box-sizing: border-box;
  padding: 2px 6px;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.${PREVIEW_CLASS.empty} {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--wa-preview-muted, #8f959e);
  font-size: 13px;
}
.${PREVIEW_CLASS.error} {
  margin: 24px;
  padding: 16px;
  color: #d83931;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  font-size: 13px;
  white-space: pre-wrap;
}
`

/** 保证样式只注入一次；SSR 环境下直接跳过 */
export const ensurePreviewStyles = () => {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')

  style.id = STYLE_ID
  style.textContent = STYLES
  document.head.appendChild(style)
}
