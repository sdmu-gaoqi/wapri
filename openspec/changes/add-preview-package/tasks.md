# add-preview-package — 实施清单

> 目标：交付可用的 H5 文件预览包。已完成项勾选，未完成项保留。

## 1. 包骨架与构建

- [x] 1.1 创建目录 `packages/preview/src`、`src/constant`、`src/types`、`src/core`、`src/text`、`src/pdf`、`src/xlsx`、`src/word`、`src/demo`
- [x] 1.2 新增 `packages/preview/package.json`：`name` 为 `@wapri/preview`、`version` 为 `0.0.0`、`files: ["dist"]`、`sideEffects: false`、`module` / `types` 指向 `dist`
- [x] 1.3 新增 `.fatherrc.ts`（esm 输出）与 `tsconfig.json`（含 `@wapri/preview`、`@wapri/gbase` 路径映射）
- [x] 1.4 `build` 脚本为 `node ../../scripts/clean-dist.mjs && father build && node ../../scripts/copy-preview-vendor.mjs`
- [x] 1.5 新增 `scripts/copy-preview-vendor.mjs`：把 pdf.js worker 与 SheetJS UMD 复制到 `dist/vendor`
- [x] 1.6 新增 `src/constant/index.ts`：包名、`wa-preview` 前缀、默认尺寸与主题

## 2. base 原子能力

- [x] 2.1 `src/worker.ts`：`createInlineWorker`、`createWorkerFromUrl`、`WorkerChannel`（request / progress / error / terminate）
- [x] 2.2 `src/objectUrl.ts`：`createObjectUrl`、`revokeObjectUrl`、`revokeAllObjectUrls`
- [x] 2.3 `src/file.ts`：`readFileAsArrayBuffer`、`readFileAsText`、`readFileAsBlob`、`getFileName`、`getFileSize`
- [x] 2.4 `src/fileType.ts` + `src/constant/file.ts`：魔数、OOXML 目录名、扩展名与文本兜底识别
- [x] 2.5 `src/visibility.ts`：`observeVisibility`
- [x] 2.6 `src/index.ts` 补齐导出，`types/worker.ts` 存放 RPC 类型

## 3. 预览实现

- [x] 3.1 `core/source.ts`：统一解析 File / Blob / ArrayBuffer / URL / 纯文本并识别类型
- [x] 3.2 `core/context.ts` + `core/style.ts`：容器挂载、主题变量、样式注入、销毁回调
- [x] 3.3 `core/lazy.ts`：共享 IntersectionObserver 的懒渲染池，支持并发上限、`renderAll`、`reset`
- [x] 3.4 `previewText`：按 80 行分块，块进入视口才填充
- [x] 3.5 `previewPdf`：pdf.js legacy 构建、按页 canvas、底部缩略图、按容器宽度自适应、任务取消
- [x] 3.6 `previewXlsx`：worker 内 SheetJS 解析、可视行列渲染、合并单元格、列宽行高、多 sheet 切换、主线程回退
- [x] 3.7 `previewWord`：mammoth 转块模型、opentype.js / Canvas 度量、断行与表格布局、分页、Canvas 绘制、可选缩略图
- [x] 3.8 `previewFile`：按 `kind` 分发，并支持各类型的 `text` / `pdf` / `word` / `xlsx` 子配置
- [x] 3.9 `src/index.ts` 导出公开 API 与类型

## 4. 文档站与演示

- [x] 4.1 `.dumirc.ts` 增加 `atomDirs`（`type: 'preview'`）、`nav`（`/previews`）、`alias`
- [x] 4.2 新增 `src/index.md`（dumi 页面）与 `src/demo/basic.vue`（文件选择 + 2000 行文本演示）
- [x] 4.3 新增 `packages/preview/README.md`、`CHANGELOG.md`、`docs/changelog/preview.md`
- [ ] 4.4 执行 `pnpm dev` 人工确认 `/previews` 与 `/changelog/preview` 可访问，demo 能预览各类型

## 5. 发布与仓库同步

- [x] 5.1 新增 changeset：`"@wapri/preview": minor`
- [x] 5.2 根 `AGENTS.md` 仓库地图补充 `packages/preview`
- [x] 5.3 `docs/guide.md` 子包清单补充 `preview`
- [x] 5.4 `openspec/project.md` 包表补充 `packages/preview`
- [x] 5.5 确认 `.github/workflows` 未新增文件

## 6. 校验

- [x] 6.1 `pnpm --filter @wapri/preview build` 通过，`dist/vendor` 下两个资源存在
- [x] 6.2 `npx tsc -p packages/preview/tsconfig.json --noEmit` 通过
- [x] 6.3 `pnpm lint` 通过（0 error；11 条 warning 全部来自 `@wapri/gbase` 的历史 `any`）
- [x] 6.4 新增文件通过 `npx oxfmt --check`；仓库基线约 190 个文件存在历史格式差异，未做全量重排
- [x] 6.5 `pnpm build` 全量通过（6/6 tasks）
- [x] 6.6 `pnpm doc` 通过，产物包含 `/previews` 与 `/changelog/preview`，无本机绝对路径
- [x] 6.7 `npx -y @fission-ai/openspec@latest validate add-preview-package --strict` 通过
- [x] 6.8 冒烟测试：`detectFileType`（pdf / docx / xlsx / text）、`getFileName`、`readFileAsText`、`readFileAsArrayBuffer` 按预期工作
- [x] 6.9 修复文档站 PDF worker：`import.meta.url` 在 webpack 下是 `file://`，改为只接受 `http(s)`；worker 放入 `public/pdf.worker.min.mjs`，demo 显式 `configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })`
- [ ] 6.10 归档本 change 到 `openspec/changes/archive/`（待人浏览器手测通过后执行）
