---
name: wapri-design
description: 用 @wapri/* 组件库（element-pro、gplayer、preview、gbase、gutils）写业务代码时使用。先通过 wapri MCP 查组件文档与示例源码再落代码，避免臆造 props、事件、插槽与默认值。
---

# wapri 组件库开发技能

这个技能约束「用 `@wapri/*` 写代码」的顺序：**先查、再写、最后对齐约定**。组件库的文档都在仓库 `packages/*/src/**/index.md`，示例在旁边的 `demo/`，通过 wapri MCP 可以直接读到，不要凭记忆拼 API。

## 何时使用

- 需求里出现 `ProTable`、`DragSortTable`、`ModalForm`、`DrawerForm`、`StepsForm`、`TabForm`、`CropperUpload`、`VideoPlayer`、`previewFile` 等 wapri 导出的名字。
- 要给表格加排序、给表单加联动/数组字段、给上传加裁剪或排序、给播放器加插件。
- 从其它组件库（antd / Semi / Element Plus 原生）迁移代码到 `@wapri/element-pro`。

## 前置条件

MCP 已接入（`npx -y @wapri/mcp`）。没有 MCP 时，退化做法是读项目 `node_modules/@wapri/*/dist/*.d.ts`，但仍然要按本文档的约定写。

## 三步工作流

1. **确认组件名**：`list_components({ keyword })`。名字是 kebab-case（`drag-sort-table`），也接受 `DragSortTable` 或中文标题。
2. **读文档 + 示例**：`get_component_document({ name })` 看 Props / 事件 / 插槽与限制；`get_component_demo({ name, demo })` 读示例源码，示例通常比文档更能说明真实用法。
3. **需要时读源码**：`get_component_files` → `get_file_code`，或 `get_function_code` / `search_code` 定位实现细节。

细节流程见 [WORKFLOWS.md](./WORKFLOWS.md)，硬约定见 [BEST_PRACTICES.md](./BEST_PRACTICES.md)。

## 硬性要求

- 不写文档里没有的 props / 事件 / 插槽；不确定就先查，查不到就明确告诉用户「文档里没有」。
- 工具返回会带包版本（如 `@wapri/element-pro@3.13.6`）。与项目 `package.json` 不一致时，提醒用户升级或核对，不要直接按新版写。
- 引入路径只用包名（`@wapri/element-pro`），不要写 `@wapri/element-pro/dist/...` 或跨包相对路径。
