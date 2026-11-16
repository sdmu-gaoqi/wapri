# add-mcp-package

## Why

仓库现在有 7 个包、一堆约定（`ProTable` / `DragSortTable` / `Player` 插件 / `@base` storage 禁用原生 storage 等），但 AI 编程助手在业务项目里写这些组件时拿不到「权威答案」：只能靠 `node_modules` 里的 `.d.ts` 猜用法、靠搜索结果拼 API，写出来的代码经常字段名、插槽名、默认值都不对，还要人再改一遍。

参考 [Semi Design 的 MCP / Skills](https://semi.design/zh-CN/start/mcp-skills) 的做法：把「组件文档 + 示例 + 源码」做成一个可被 AI 助手直接调用的 MCP Server，再配一份 Skills 说明使用流程与最佳实践。AI 侧的体验变成先查文档、再看示例、必要时读源码，写出来的代码有据可查。

本变更新增 `@wapri/mcp`：一个 stdio 传输的 MCP Server，`npx` 即可接入 Claude Desktop / Cursor / Trae / CodeBuddy 等客户端，同时随包提供 Skills 目录。

## What Changes

- 新增包 `packages/mcp`（`@wapri/mcp`，初始版本 `0.0.0`）：
  - **构建期知识快照**：`scripts/gen-knowledge.mjs` 扫描 `packages/*/src` 的 `index.md`（文档）、`demo/*.vue`（示例）与全部源码，产出 `dist/knowledge.json`，随包发布。运行时不读业务仓库、不联网，`npx` 在任何项目里都能用。
  - **7 个只读工具**：`list_components`、`get_component_document`、`get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code`。
  - **stdio 入口**：`dist/cli.js`（`bin: wapri-mcp`），基于官方 `@modelcontextprotocol/sdk`；错误只走 stderr，stdout 不打印任何日志，避免污染协议流。
  - **只读与路径边界**：所有路径参数都按「`packages/` 下的相对路径」解析并做归一化校验，`..` 越界直接拒绝；不做任何写操作。
- Skills：`public/skills/wapri-design/`（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md` + dotagents 版 `skill.dotagents.md`）是唯一文案来源，内容是「怎么用这些 MCP 工具查 wapri 组件」的工作流与引入/命名/禁用项等硬约定。
  - 文档站 `/mcps` 提供「添加到我的项目」面板：勾选 dotagents / Trae / Cursor / CodeBuddy / Claude Code / Qwen Code / Codex / 通用标准，选项目根目录后用 File System Access API 直接把文件写进 `<工具目录>/skills/wapri-design/`；dotagents 走 `.agents/skills` 标准并写带 `id` frontmatter 的 `skill.md`。不支持目录写入的浏览器给下载链接，并在页面说明 Chromium + 安全上下文 + 「允许写入」的前提。
  - 包产物里的 `skills/wapri-design/` 由 `scripts/sync-skills.mjs` 在构建时从 `public/skills` 同步（`npm` 包照旧随包分发），面板与 npm 包不会各维护一份文案。
- 六处登记：`.dumirc.ts`（`atomDirs` 增加 `type: 'mcp'` + nav + alias）、`docs/changelog/mcp.md`、根 `AGENTS.md` 仓库地图、`docs/guide.md`、`openspec/project.md` 包表、`.changeset/add-mcp-package.md`（minor）。
- 文档站新增 `/mcps` 页面：安装配置（各客户端）、工具清单与参数、Skills 安装方式、数据来源与版本对应关系。

## Capabilities

### New Capabilities

- `mcp`: wapri 组件知识的 MCP Server —— 工具契约（查询文档 / 示例 / 源码 / 符号 / 全文搜索）、知识快照与版本一致性、只读与路径安全边界、stdio 接入方式，以及随包分发的 Skills。

## Impact

- Affected specs: `mcp`（新增）
- Affected code:
  - 新增 `packages/mcp/{package.json,tsconfig.json,README.md,CHANGELOG.md,src/index.md}`
  - 新增 `packages/mcp/src/{cli.ts,index.ts,server.ts,constant/index.ts,types/index.ts,knowledge/{load.ts,query.ts},tools/register.ts}`
  - 新增 `packages/mcp/scripts/gen-knowledge.mjs`（构建期生成 `dist/knowledge.json`）
  - 新增 `packages/mcp/scripts/sync-skills.mjs`（构建期把 `public/skills/wapri-design` 同步进包内 `skills/`）
  - 新增 `public/skills/wapri-design/{SKILL.md,WORKFLOWS.md,BEST_PRACTICES.md,skill.dotagents.md}`（Skills 文案唯一来源）
  - 新增 `packages/mcp/src/demo/install-skills.vue`（文档站的「添加到我的项目」面板）
  - 修改 `.dumirc.ts`（atomDirs / nav / alias / `__DOC_PUBLIC_PATH__`）、`docs/guide.md`、根 `AGENTS.md`、`openspec/project.md`、`.gitignore`
  - 新增 `docs/changelog/mcp.md`、`.changeset/add-mcp-package.md`
- 依赖：新增 `@modelcontextprotocol/sdk`（MCP 协议实现）与 `zod`（工具入参 schema），官方 SDK 无法用现有工具链替代；`@types/node` 为 devDependency。
- 兼容性：纯新增包，不影响任何既有包的运行时代码与产物；其他包不依赖它，`pnpm build` 的拓扑不变（`mcp` 只读源码，不依赖其它包的 `dist`）。
- 已知限制：
  - 知识是「构建那一刻」的快照，发布新版本组件后需要重新 `pnpm --filter @wapri/mcp build` 才会带上；`list_components` 会显式标注每个包的知识版本，便于 AI 判断是否与项目实际版本一致。
  - 只覆盖本仓库的文档与源码，不提供在线文档站抓取。
  - 不实现 HTTP / SSE 传输，也不做鉴权（仅本地 stdio）。
