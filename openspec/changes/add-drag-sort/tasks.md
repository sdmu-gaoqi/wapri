# Tasks

## 1. 依赖与底座

- [x] 1.1 `element-pro` 安装 `@vue-dnd-kit/core@^3`，`vite.config.ts` 的 `external` 加入该包，验证构建产物不内联拖拽库
- [x] 1.2 新增 `src/shared/dnd/SortableItemRegistrar.vue`：无渲染组件，接收 `item`/`target`/`handle`/`disabled`，内部调用 `makeSortableItem`，验证 `pnpm lint` 无 `any`

## 2. ProTable 回写能力

- [x] 2.1 `types.ts` 的 `ActionType` 增加 `setDataSource(data)`，验证类型可从 `@wapri/element-pro` 导入
- [x] 2.2 `useProTableData` 暴露 `setDataSource` 并挂到 `getAction`，验证调用后表格按新顺序渲染且不触发请求

## 3. DragSortTable

- [x] 3.1 新建 `types.ts`：`DragSortTableProps` 继承 `ProTableProps`，新增 `dragSortKey`、`dragSortHandlerRender`、`onDragSortEnd`、`dragSortDisabled`
- [x] 3.2 新建 `index.vue`：外层只挂私有 `DnDProvider`，`v-bind="$props"` 与插槽透传给内部 body，`inheritAttrs: false`
- [x] 3.3 新建 `components/DragSortTableBody.vue`：`makeSortableList` 绑定表格 `<table class="el-table__body">`，`items` 用 `onDataSourceChange` 同步，验证请求数据与静态数据都能拖
- [x] 3.4 实现 `onDrop`：用 `event.result.get(listId)` 取新顺序，调 `setDataSource` 回写并触发 `onDragSortEnd(from.index, to.index, newDataSource)`
- [x] 3.5 设置 `dropOutside: 'cancel'`，验证拖出表格放手时顺序不变、不触发回调
- [x] 3.6 新建 `components/DragSortTableHandle.vue`：渲染默认 `Sort` 图标或 `dragSortHandlerRender` 结果，用 `closest('tr')` 注册可排序项，`handle` 指向手柄自身
- [x] 3.7 新建 `components/DragSortTableOverlay.vue`：按 `active.element` 克隆 `<tr>` 与 `<colgroup>` 到一张 `table` 中，验证拖拽时整行样式与列宽不失真
- [x] 3.8 列接管：`innerColumns` 用 `dataIndex === dragSortKey` 命中时替换 `render`，验证用户该列原有 `render` 被手柄替换、`dragSortKey` 缺失时告警且不崩
- [x] 3.9 新建 `styles/index.scss`，class 前缀取 `constant/index.ts` 的 `prefix`，验证 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 3.10 新建 `index.ts`，`withInstall` 导出并导出全部类型

## 4. CropperUpload 排序

- [x] 4.1 `types.ts` 增加 `sortable?: boolean`，默认 `false`，验证不传时行为与之前一致
- [x] 4.2 新增 `components/SortableFileList.vue`：`makeSortableList` 绑定 `.el-upload-list`，按 index 取 `.el-upload-list__item` 作为可排序项，`onDrop` 里 `preventDefault` 后 emit 新顺序
- [x] 4.3 `index.vue` 接入 `DnDProvider` + `SortableFileList`：受控时调用 `$attrs['onUpdate:fileList']`，非受控时更新 `internalFileList`，验证两种用法都能拖动
- [x] 4.4 `styles/index.scss` 增加拖拽态样式（`cursor: grab`、占位/拖拽中的透明度），验证拖拽时视觉反馈正确
- [x] 4.5 新增 `demo/sortable.vue`，验证多图排序后打印的顺序与界面一致

## 5. 注册、文档与发布登记

- [x] 5.1 `src/index.ts` 注册并导出 `DragSortTable` 与相关类型
- [x] 5.2 新增 `DragSortTable/index.md`（Props / Events / Columns 说明、限制项）与 `demo/basic.vue`、`demo/custom-handle.vue`
- [x] 5.3 `CropperUpload/index.md` 补充 `sortable` 行与「排序」章节
- [x] 5.4 新增 `.changeset/drag-sort.md`，`"@wapri/element-pro": minor`
- [x] 5.5 在根 `AGENTS.md` 的 Repository Map 与 `openspec/project.md` 补充 `DragSortTable`

## 6. 集成验证

- [x] 6.1 运行 `pnpm lint`、`pnpm format:check`、`pnpm --filter @wapri/element-pro build`
- [x] 6.2 实际拖动表格行，确认 overlay 与落点、回写顺序正确（经无头浏览器连拖 4 次验证；dumi dev 页面需人工执行 `pnpm dev` 复核）
- [x] 6.3 实际拖动上传列表，确认顺序回写与裁剪链路不受影响（经无头浏览器连拖 4 次验证；dumi dev 页面需人工执行 `pnpm dev` 复核）

## Workflow follow-up

- 实施完成后运行 `npx -y @fission-ai/openspec@latest validate add-drag-sort --strict`。
- 校验通过后运行 `npx -y @fission-ai/openspec@latest archive add-drag-sort` 归档。
- 提交、推送、开 PR 由人工执行。
