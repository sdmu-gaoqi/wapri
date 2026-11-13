# Tasks

## 1. 共享能力与常量

- [x] 1.1 新增 `packages/element-pro/src/shared/media/index.ts`，实现 `getFileMediaType`（MIME 字段优先，扩展名兜底）与 `FileMediaType` / `FileMediaSource` 类型
- [x] 1.2 修改 `FileModal/utils.ts`，`getAssetMediaType` 改为复用 `getFileMediaType`，导出保持不变
- [x] 1.3 在 `constant/index.ts` 追加 FileList 默认列数、空状态文案、预览 / 删除的 aria 文案、预览加载 / 失败文案

## 2. 类型与工具

- [x] 2.1 新增 `FileList/types.ts`：`FileListItem`、`FileListProps`、`FileListEmits`、`FileListExpose`
- [x] 2.2 新增 `FileList/utils.ts`：`getItemPreviewUrl`、`isImageItem`、`collectImageItems`、`resolveImageIndex`，禁止 `any`

## 3. 组件实现

- [x] 3.1 新增 `components/FileListCard.vue`：缩略图、名称、预览 / 删除按钮、图片加载失败降级、键盘可访问
- [x] 3.2 新增 `components/FileListOverlay.vue`：拖拽浮层克隆卡片，保持网格宽度
- [x] 3.3 新增 `index.vue`：网格容器、`DnDProvider` + `makeSortableList`、删除回写、图片 / 视频 / 文档预览分流
- [x] 3.4 文档预览使用动态 `import('@wapri/preview')`，处理 loading、错误、关闭销毁与并发竞态
- [x] 3.5 新增 `styles/index.scss`：网格、卡片、缩略图、hover / 触屏操作按钮、拖拽占位，统一 `prefix`
- [x] 3.6 新增 `index.ts`：`withInstall` 包装并导出类型 / 工具

## 4. 接入与构建

- [x] 4.1 在 `src/index.ts` 导入、导出并注册 `FileList`
- [x] 4.2 `packages/element-pro/package.json` 增加 `@wapri/preview` 依赖
- [x] 4.3 `packages/element-pro/vite.config.ts` 的 `external` 增加 `@wapri/preview`
- [x] 4.4 执行 `pnpm install` 更新 workspace 链接与 lockfile

## 5. 文档与示例

- [x] 5.1 新增 `FileList/index.md`：基础用法、预览分流、删除、排序、Props / Events / Expose 表格
- [x] 5.2 新增 `FileList/demo/basic.vue`：图片 / 视频 / PDF 混合数据，演示排序与删除
- [x] 5.3 确认 dumi 路由为 `/element-pros/file-list`

## 6. 校验

- [x] 6.1 `pnpm lint` 通过
- [x] 6.2 `pnpm format:check` 通过（本次改动文件均通过；仅仓库既有的 `public/pdf.worker.min.mjs` 报格式问题，本次未改动该文件）
- [x] 6.3 `pnpm --filter @wapri/element-pro build` 通过
- [x] 6.4 `npx -y @fission-ai/openspec@latest validate add-file-list --strict` 通过
- [x] 6.5 新增 `.changeset/file-list.md`（`minor`）
- [x] 6.6 `pnpm doc` 通过，生成 `/element-pros/file-list` 页面与 demo

## 7. 视频卡片

- [x] 7.1 卡片识别为视频时用 `<video preload="metadata">` 展示 `previewUrl` 首帧，`abbreviateUrl` 作为 `poster`；首帧失败退回封面，封面失败降级为文件图标
- [x] 7.2 新增 `getItemVideoSrc` / `getItemVideoPoster` / `isVideoItem`，并补充 `tests/file-list.test.mjs`
- [x] 7.3 同步 `FileList/index.md` 与 changeset，跑通 lint / format / 构建

## 8. 文档占位图标

- [x] 8.1 新增 `getFileIconInfo`（扩展名 / MIME 识别 PDF、Word、Excel、PPT 等分类与短文案）
- [x] 8.2 `abbreviateUrl` 改为可选，卡片无缩略图时渲染按类型上色的文件图标；文档不再拿 `previewUrl` 当图片
- [x] 8.3 补充测试、`FileList/index.md`、demo 与 changeset
