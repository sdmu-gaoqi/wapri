# add-preview-package

## Why

仓库缺少一个专门承载「预览」能力的独立包。现有与预览相关的实现（例如 `@wapri/element-pro` 的 `CropperUpload`）绑在组件库里，无法被纯逻辑场景或非 Vue 环境复用；同时基础能力（storage、os、uuid 等）已经沉淀在 `@wapri/gbase`，具备「只依赖 base、不引入 UI 框架」的独立包条件。

本变更交付 `@wapri/preview`：H5 场景下预览文本、PDF、Word（docx）、Excel（xlsx / xls / csv）。解析放到 worker 或独立解析层，渲染放到主线程，并且**看到哪里渲染哪里**——正文与缩略图都只渲染可视区域。通用能力（worker 通道、文件读取、类型嗅探、Object URL、可视性观察）下沉到 `@wapri/gbase`。

## What Changes

- 新增 workspace 包 `@wapri/preview`（`packages/preview`，初始 `0.0.0`，`publishConfig.access: public`），依赖 `@wapri/gbase`。
- 新增解析依赖：`pdfjs-dist`、`mammoth`、`xlsx`、`opentype.js`；不引入 `vue`、`element-plus`、`@wapri/element-pro`。
- 导出 `previewFile`（自动识别类型并分发）与 `previewText` / `previewPdf` / `previewWord` / `previewXlsx`（各自独立），以及 `configurePdfjs`、`PreviewUnsupportedError` 与全部选项类型。
- 统一输入：本地 `File` / `Blob`、内存 `ArrayBuffer` / `ArrayBufferView`、远程 URL 字符串、`{ url, fileName?, headers? }`；统一句柄：`renderAll` / `scrollTo` / `refresh` / `destroy`。
- 懒渲染：共享 IntersectionObserver；文本按 80 行分块、PDF / Word 按页、XLSX 按可视行列；缩略图同样只渲染可见项。
- `@wapri/gbase` 新增原子能力：`createInlineWorker` / `WorkerChannel`、`createObjectUrl` / `revokeObjectUrl`、`readFileAsArrayBuffer` / `readFileAsText`、`detectFileType`、`observeVisibility`。
- 构建：father（`esm` → `dist`），构建后把 pdf.js worker 与 SheetJS UMD 复制到 `dist/vendor`。
- 文档站接入：`.dumirc.ts` 增加 `atomDirs`（`type: 'preview'`）、导航 `/previews`、别名；新增 dumi 页面与 demo、`docs/changelog/preview.md`。
- 发布接入：changeset `minor`，不新增 CI 工作流。

## Impact

- Affected specs: `preview`（新增能力，包含包骨架、解析、渲染、懒加载、资源释放）
- Affected code:
  - 新增 `packages/preview/**`：`constant`、`types`、`core`、`text`、`pdf`、`xlsx`、`word`、`previewFile.ts`、`index.ts`、`demo`
  - 修改 `packages/@base/src/index.ts` 并新增 `worker.ts`、`objectUrl.ts`、`file.ts`、`fileType.ts`、`visibility.ts`、`constant/file.ts`、`types/worker.ts`
  - 新增 `scripts/copy-preview-vendor.mjs`
  - 修改 `.dumirc.ts`（`resolve.atomDirs`、`themeConfig.nav`、`alias`）
  - 新增 `docs/changelog/preview.md`、`.changeset/preview-initial.md`
  - 修改根 `AGENTS.md`、`docs/guide.md`、`openspec/project.md`
- 兼容性：`@wapri/preview` 为纯新增包；`@wapri/gbase` 仅新增导出，现有包无破坏性变更。
