# @wapri/mcp

## 0.0.0

- 初始版本：stdio MCP Server，提供 `list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code` 七个只读工具。
- 构建期把 `packages/*/src` 的文档、示例与源码快照成 `dist/knowledge.json`，运行时不联网、不读仓库。
- 随包提供 `skills/wapri-design/`（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md`）。
