# @wapri/mcp

wapri 组件库的 MCP Server：让 AI 编程助手能查 `@wapri/*` 的**组件文档、示例源码与实现细节**，写业务代码时不用再靠猜 API。

只读、离线、随包发布：知识快照在构建期从仓库源码生成，运行时不联网、不读业务项目。

## 安装

不需要预装，任何支持 MCP 的客户端用 `npx` 直接拉起：

```bash
npx -y @wapri/mcp
```

需要 Node >= 20.19。

### Claude Desktop

`claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "wapri-mcp": {
      "command": "npx",
      "args": ["-y", "@wapri/mcp"]
    }
  }
}
```

### Cursor / Trae / CodeBuddy

在客户端的 MCP 设置里新增一条，`command` 填 `npx`，`args` 填 `["-y", "@wapri/mcp"]`。Claude Code CLI 用：

```bash
claude mcp add wapri-mcp -- npx -y @wapri/mcp
```

## 工具

| 工具                    | 用途                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `list_components`       | 组件总览：包名与版本、组件名、文档路由、示例数量，支持关键词筛选 |
| `get_component_document` | 组件文档正文，可只取 `props` / `events` / `slots` / `examples` / `notes` |
| `get_component_demo`    | 示例清单；传 `demo` 时返回完整 `.vue` 源码                  |
| `get_component_files`   | 组件目录的源码文件树（路径、类型、行数）                    |
| `get_file_code`         | 按路径读源码，可传 `startLine` / `endLine` 取片段            |
| `get_function_code`     | 按符号名查完整实现（函数 / 常量 / 类 / 接口 / 类型 / 枚举） |
| `search_code`           | 全文搜索，返回 `路径:行号` 与上下文，支持 `/正则/`          |

所有路径参数都相对仓库的 `packages/` 目录，例如 `element-pro/src/ProTable/index.vue`；越界路径会被拒绝。

## Skills

包内 `skills/wapri-design/` 是配套的 AI 技能包，说明「先查文档再写代码」的工作流与仓库硬约定（`SKILL.md` + `WORKFLOWS.md` + `BEST_PRACTICES.md`）。另附 `skill.dotagents.md`，给 dotagents 的 `.agents/skills` 标准用（带 `id` / `kind` frontmatter）。

最省事的装法是打开文档站的 **mcp 页**：勾选你用的编程工具、选项目根目录，面板会按各客户端的约定路径写进去。需要 Chrome / Edge 等 Chromium 内核，并且页面在 HTTPS 或 localhost 下打开；Firefox / Safari 或普通 HTTP 下按钮会置灰，只能下载后手动放置。选择目录后记得点浏览器的「允许写入」。

也可以手动复制：

```
node_modules/@wapri/mcp/skills/wapri-design  →  .agents/skills/wapri-design        (dotagents，主文件用 skill.md)
                                             →  .cursor/skills/wapri-design
                                             →  .trae/skills/wapri-design
                                             →  .claude/skills/wapri-design
                                             →  .codebuddy/skills/wapri-design
                                             →  .qwen/skills/wapri-design
                                             →  .codex/skills/wapri-design
                                             →  .skills/wapri-design
```

## 知识版本

`list_components` 等输出会带上各包版本与快照时间（例如 `@wapri/element-pro@3.13.6`）。如果与项目 `package.json` 里的版本不一致，说明知识可能滞后，升级 `@wapri/mcp` 即可。

快照由仓库构建时生成（`scripts/gen-knowledge.mjs`），只覆盖本仓库 `packages/*/src` 的文档与源码。

## 本地开发

```bash
pnpm --filter @wapri/mcp build   # tsc + 生成 dist/knowledge.json
pnpm --filter @wapri/mcp start   # 直接跑 stdio server
```

调试时可用 `WAPRI_MCP_KNOWLEDGE=/abs/path/knowledge.json` 指定别的快照。
