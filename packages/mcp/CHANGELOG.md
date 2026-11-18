# @wapri/mcp

## 0.1.0

### Minor Changes

- 0833906: 新增 `@wapri/mcp`：wapri 组件库的 MCP Server（stdio、只读、离线）。
  - 七个工具：`list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code`。
  - 构建期把 `packages/*/src` 的文档、示例与源码快照成 `dist/knowledge.json`，`npx -y @wapri/mcp` 即可接入 Claude Desktop / Cursor / Trae / CodeBuddy 等客户端。
  - 随包提供 `skills/wapri-design/`（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md`），说明工具工作流与仓库硬约定；另附 dotagents 版 `skill.dotagents.md`，可写入 `.agents/skills/wapri-design/skill.md`。

## 0.0.0

- 初始版本：stdio MCP Server，提供 `list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code` 七个只读工具。
- 构建期把 `packages/*/src` 的文档、示例与源码快照成 `dist/knowledge.json`，运行时不联网、不读仓库。
- 随包提供 `skills/wapri-design/`（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md`）。
