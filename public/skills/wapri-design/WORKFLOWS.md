# 工作流

所有 `{ ... }` 都是 wapri MCP 的工具调用参数。工具名固定为：`list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code`。

## 1. 用组件搭一个列表页（ProTable + 查询 + 分页）

1. `list_components({ keyword: "table" })` 确认组件名（`pro-table`）。
2. `get_component_document({ name: "pro-table" })` 读 `request`、`columns`、`search`、`pagination`、`actionRef` 的用法。
3. `get_component_demo({ name: "pro-table", demo: "request" })` 读真实示例（示例名以清单为准）。
4. `get_component_document({ name: "pro-table", section: "props" })` 只取 Props 表，逐项核对参数名与默认值。
5. 需要确认某个 `ValueType`（`select` / `date` / `money` / `tag`）怎么渲染时：`search_code({ query: "formatCellValue" })` 或 `get_component_files({ name: "pro-table" })` 后 `get_file_code`。

## 2. 表格加拖拽排序（DragSortTable）

1. `get_component_document({ name: "drag-sort-table" })` 看四个新增 props：`dragSortKey` / `dragSortHandlerRender` / `onDragSortEnd` / `dragSortDisabled`。
2. `get_component_demo({ name: "drag-sort-table", demo: "basic" })` 对照 `onDragSortEnd` 里怎么把顺序写回业务数据。
3. 手感相关问题（换位时机、浮层、取消规则）看文档「说明」段；要改渲染细节再读源码：
   `get_component_files({ name: "drag-sort-table" })` → `get_file_code({ path: "element-pro/src/DragSortTable/components/DragSortTableBody.vue" })`。
4. 注意：拖拽只在当前页生效；`dragSortKey` 那一列不要设 `fixed`；树形数据不支持。

## 3. 表单与联动（ModalForm / ProFormFields）

1. `list_components({ packageName: "element-pro", keyword: "form" })` 找出 `modal-form`、`drawer-form`、`pro-form-fields`、`pro-form-dependency`、`pro-form-list`、`steps-form`、`tab-form`。
2. 基础表单：`get_component_document({ name: "modal-form" })` + `get_component_demo({ name: "modal-form", demo: "basic" })`。
3. 字段联动：`get_component_document({ name: "pro-form-dependency" })`，注意 `names` 传字段路径数组。
4. 数组字段：`get_component_document({ name: "pro-form-list" })`，行内字段用**相对名**，不要手拼 `users.${index}`。
5. 分步 / 多 tab：`steps-form`、`tab-form`；注意 `name` 在同一容器内唯一。

## 4. 播放器与预览

- 播放器：`get_component_document({ name: "video-player" })` 看 `plugins` 声明方式（`Array<string | { key; setting }>`，默认只启用 `filter` / `webFullscreen`）；插件的可用 key 用 `list_components({ keyword: "player" })` 或 `get_component_files({ name: "video-player" })` 定位 `src/plugins`。
- 文件预览：`get_component_document({ name: "preview" })`（包级文档）看 `previewFile(file, { container })` 与 `handle.destroy()`。

## 5. 排查「组件不生效 / 类型报错」

1. 先确认名字与版本：`list_components({ keyword: "<关键词>" })`，比对返回的 `@wapri/xxx@版本` 与项目 `package.json`。
2. 报「没有这个 prop」：`get_component_document({ name, section: "props" })` 找准确名字（很多 prop 是 `xxxProps` 嵌套、或该能力在 `tableProps` 里）。
3. 报「组件没渲染」：`search_code({ query: "<class 名或组件名>" })` 看是否被 `v-if` / 插槽条件挡住。
4. 样式不对：确认没有重复引入 `element-plus/dist/index.css`（入口已带），再看组件 `styles/*.scss`。
5. 仍然定位不到：`get_function_code({ name: "<函数名>" })` 直接读实现。

## 查询技巧

- 组件名三种写法都行：`drag-sort-table` / `DragSortTable` / `拖拽排序表格`。
- 文档太长时用 `section`：`props`、`events`、`slots`、`examples`、`notes`。
- 源码路径统一相对 `packages/`，例如 `element-pro/src/ProTable/index.vue`；不要传绝对路径或 `..`。
- `search_code` 支持 `/正则/`；命中太少就换更短的关键词，太多就加 `packageName` 或调小 `limit`。
