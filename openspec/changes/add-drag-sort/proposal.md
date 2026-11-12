# add-drag-sort

## Why

`element-pro` 目前没有任何行/项级别的排序能力：业务要做「商品排序」「图片顺序调整」时，只能自己接 SortableJS 之类的库，并且要自己解决三件事——拖拽手柄放在哪一列、拖完怎么把新顺序写回列表、写回后 `ElTable` / `ElUpload` 要不要重渲染。

更麻烦的是这类需求往往成对出现：一个页面里既有需要拖拽排序的表格（商品列表），又有需要拖拽调整顺序的上传列表（商品图集）。两处各接一套拖拽库，交互细节与动画不一致。

本变更以 [`@vue-dnd-kit/core`](https://www.npmjs.com/package/@vue-dnd-kit/core) 为底座交付两块能力：

- 新组件 `DragSortTable`：`ProTable` 的行拖拽排序版本，API 对齐 [pro-components DragSortTable](https://procomponents.ant.design/components/table) 的 `dragSortKey` / `dragSortHandlerRender` / `onDragSortEnd`。
- `CropperUpload` 新增 `sortable`：上传列表可拖拽调整顺序（商品图集这类「顺序即语义」的场景）。

## What Changes

- 新增依赖 `@vue-dnd-kit/core@^3`（`element-pro` 的 `dependencies`，构建时 external）。
- 新增目录 `packages/element-pro/src/DragSortTable/`，对应 dumi 文档页 `/element-pros/drag-sort-table`：
  - `DragSortTable` 的外层只负责挂一个私有的 `DnDProvider`，内部 `DragSortTableBody` 调 `makeSortableList` 并渲染 `ProTable`，因此业务不需要在自己的应用根部再包一层 provider，也不会和其它拖拽区域互相干扰。
  - `dragSortKey` 指定的列由组件接管渲染：默认渲染拖拽手柄（`Sort` 图标），`dragSortHandlerRender(record, index)` 可替换手柄内容。
  - 手柄通过 `makeSortableItem` 把所在行 `<tr>` 注册为可排序项，只有手柄能起拖（行内其它区域点击行为不变）。
  - 拖拽期间用自定义 overlay 还原整行（克隆 `<tr>` 与 `<colgroup>` 到一张 `table` 里），避免 `<tr>` 脱离表格上下文后错位。
  - 落点确定后把新顺序写回 `ProTable`（新增 `action.setDataSource`）并触发 `onDragSortEnd(beforeIndex, afterIndex, newDataSource)`，业务在回调里存序即可。
- `CropperUpload` 新增 `sortable` prop（默认 `false`）：
  - 上传列表项可整项拖拽调整顺序，松手后按新顺序回写 `file-list`（受控时触发 `update:fileList`，非受控时更新内部列表）。
  - 拖拽与裁剪链路互不影响：顺序调整发生在文件进入列表之后，不改变 `beforeUpload` / 裁剪的执行时机。
- `ProTable` 的 `ActionType` 新增 `setDataSource(data)`：直接替换当前页数据，供拖拽排序等场景即时回写顺序。
- 注册与导出：`src/index.ts` 注册 `DragSortTable`，`vite.config.ts` 把 `@vue-dnd-kit/core` 加入 external。
- 新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `drag-sort`: 表格行与上传列表项的拖拽排序行为，含手柄渲染、落点回写、排序完成回调与降级约定。

### Modified Capabilities

- `pro-table`: `ActionType` 新增 `setDataSource`，用于外部直接替换当前数据。

## Impact

- Affected specs: `drag-sort`（新增能力）、`pro-table`（新增 `setDataSource`）
- Affected code:
  - 新增 `packages/element-pro/src/shared/dnd/SortableItemRegistrar.vue`
  - 新增 `packages/element-pro/src/DragSortTable/{index.ts,index.md,types.ts}`
  - 新增 `packages/element-pro/src/DragSortTable/components/{DragSortTableBody.vue,DragSortTableHandle.vue,DragSortTableOverlay.vue}`
  - 新增 `packages/element-pro/src/DragSortTable/demo/{basic.vue,custom-handle.vue}`
  - 新增 `packages/element-pro/src/DragSortTable/styles/index.scss`
  - 新增 `packages/element-pro/src/CropperUpload/components/SortableFileList.vue`
  - 新增 `packages/element-pro/src/CropperUpload/demo/sortable.vue`
  - 修改 `packages/element-pro/src/CropperUpload/{index.vue,types.ts,index.md,styles/index.scss}`
  - 修改 `packages/element-pro/src/ProTable/{types.ts,composables/useProTableData.ts}`
  - 修改 `packages/element-pro/src/index.ts`、`packages/element-pro/vite.config.ts`、`packages/element-pro/package.json`
  - 新增 `.changeset/drag-sort.md`
- 兼容性：纯新增能力；`ProTable` 只是多了一个可选方法，既有 props / 事件 / 样式不变。
- 依赖：新增 `@vue-dnd-kit/core`，要求 `vue >= 3.5`（该包的下限）。Vue 3.3 / 3.4 的项目只要不使用 `DragSortTable` 与 `CropperUpload` 的 `sortable` 就不会触发相关代码路径。
- 已知限制：
  - 表格拖拽只在当前页内生效，跨页排序不处理（与 pro-components 一致，建议配合 `pagination: false`）。
  - `ElTable` 的 `fixed` 列会复制一份行 DOM，`dragSortKey` 列不要设 `fixed`。
  - 树形数据（`tableProps.treeProps`）暂不支持拖拽。
