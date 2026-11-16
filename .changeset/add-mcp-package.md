---
'@wapri/mcp': minor
---

新增 `@wapri/mcp`：wapri 组件库的 MCP Server（stdio、只读、离线）。

- 七个工具：`list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code`。
- 构建期把 `packages/*/src` 的文档、示例与源码快照成 `dist/knowledge.json`，`npx -y @wapri/mcp` 即可接入 Claude Desktop / Cursor / Trae / CodeBuddy 等客户端。
- 随包提供 `skills/wapri-design/`（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md`），说明工具工作流与仓库硬约定；另附 dotagents 版 `skill.dotagents.md`，可写入 `.agents/skills/wapri-design/skill.md`。
