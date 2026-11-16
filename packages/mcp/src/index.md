---
nav:
  title: mcp
  order: 1
title: 简介
group:
  order: -10
---

# mcp

`@wapri/mcp` 把本仓库的**组件文档、示例源码与实现细节**做成一个 MCP Server，AI 编程助手（Claude Desktop / Cursor / Trae / CodeBuddy / Claude Code 等）接上之后，写 `@wapri/*` 的代码前可以先查文档、看示例、读源码，而不是凭记忆猜 API。

只读、离线、随包发布：知识快照在构建期从 `packages/*/src` 生成，运行时不联网、不读业务项目。

## 安装

不需要全局安装，客户端用 `npx` 直接拉起即可，要求 Node >= 20.19。

### Claude Desktop

在 `claude_desktop_config.json` 里加：

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

在客户端的 MCP 设置里新增一条，`command` 填 `npx`，`args` 填 `["-y", "@wapri/mcp"]`。

### Claude Code CLI

```bash
claude mcp add wapri-mcp -- npx -y @wapri/mcp
```

## 工具

| 工具                     | 说明                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| `list_components`        | 组件总览：包名与版本、组件名、标题、文档路由、示例数；支持 `keyword` / `packageName` |
| `get_component_document` | 组件文档正文；`section` 可取 `props` / `events` / `slots` / `examples` / `notes` |
| `get_component_demo`     | 只传 `name` 列示例清单；再传 `demo` 返回完整 `.vue` 源码                      |
| `get_component_files`    | 组件目录的文件树（路径、类型、行数）                                          |
| `get_file_code`          | 按路径读源码；`startLine` / `endLine` 可截取片段                              |
| `get_function_code`      | 按符号名查完整实现（函数 / 常量 / 类 / 接口 / 类型 / 枚举）                   |
| `search_code`            | 全文搜索，返回 `路径:行号` 与上下文，支持 `/正则/`，`limit` 默认 20           |

约定：

- 路径参数统一相对仓库的 `packages/` 目录，例如 `element-pro/src/ProTable/index.vue`；出现 `..` 或绝对路径直接拒绝。
- 组件名三种写法等价：`drag-sort-table`、`DragSortTable`、`拖拽排序表格`。
- 每次返回都带包名与版本，便于判断知识是否与项目版本一致。

## 安装 Skills

`skills/wapri-design/` 是配套的 AI 技能包：说明「先查文档再写代码」的工作流，以及引入方式、命名、禁用项等硬约定。

勾选你在用的编程工具，点「添加到我的项目」选项目根目录，面板会按各客户端的约定路径直接写进去。需要 Chrome / Edge 等 Chromium 内核，并且页面在 HTTPS 或 localhost 下打开；Firefox / Safari 或普通 HTTP 下按钮会置灰并给出下载链接。选择目录后记得点浏览器的「允许写入」，失败原因会显示在面板下方。

<code src="./demo/install-skills.vue" title="添加到我的项目"></code>

| 文件                   | 内容                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `SKILL.md`             | 何时用、三步工作流、硬性要求                               |
| `WORKFLOWS.md`         | 列表页 / 拖拽排序 / 表单联动 / 播放器预览 / 排查问题五条流程 |
| `BEST_PRACTICES.md`    | 引入、命名、表格、表单、播放器、禁用项与版本对齐           |
| `skill.dotagents.md`   | dotagents 专用版本，frontmatter 带 `id` / `kind`           |

不想用面板也可以手动复制：把 `node_modules/@wapri/mcp/skills/wapri-design` 整个目录放到项目的 `.agents/skills/`、`.cursor/skills/`、`.trae/skills/`、`.claude/skills/`、`.codebuddy/skills/`（或面板列出的对应目录）下。dotagents 要把 `skill.dotagents.md` 改名为 `skill.md` 放到 `.agents/skills/wapri-design/`。

## 知识快照

- 构建时由 `packages/mcp/scripts/gen-knowledge.mjs` 扫描 `packages/*/src` 生成 `dist/knowledge.json`（文档、示例、源码、各包版本），随包发布。
- 因此知识对应的是**发布那一刻**的源码；组件库升级后需要重新发布 `@wapri/mcp`。
- 调试时可以指向别的快照：`WAPRI_MCP_KNOWLEDGE=/abs/path/knowledge.json`。

```bash
pnpm --filter @wapri/mcp build   # tsc + 重新生成知识快照
pnpm --filter @wapri/mcp start   # 本地跑 stdio server
```

## 常见问题

**客户端里看不到工具？** 先用 `npx -y @wapri/mcp` 在终端跑一次，确认能正常启动（stderr 会打印 `ready`），再检查客户端的 Node 版本是否 >= 20.19。

**回答里给的 API 项目里没有？** 看返回头部的包版本：低于项目实际版本说明知识滞后，升级 `@wapri/mcp` 到最新版。

**点「添加到我的项目」写入不了？** 先确认用的是 Chrome / Edge 且页面是 HTTPS 或 localhost；其它环境按钮会置灰，只能走下载链接。按钮可用时，点完必须在系统弹窗里选中项目根目录；如果接着弹出写入权限确认，点「允许」。面板下方会依次显示「选择文件夹 → 确认写入权限 → 读取技能文件 → 正在写入 …」，卡在哪一步就按那一步的提示处理；失败也会显示具体错误（例如 `读取 SKILL.md 失败（HTTP 404）`）。
