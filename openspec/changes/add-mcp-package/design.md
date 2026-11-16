# Design

## Context

- 仓库是 pnpm workspace + changesets，包产物统一 `files: ["dist"]`，`build` 以 `node ../../scripts/clean-dist.mjs &&` 开头，turbo 缓存 `dist/**`。
- 文档在 `packages/*/src` 内：每个组件一个 `index.md`（含 Props 表与 `<code src="./demo/x.vue">`），示例在 `demo/`。
- 参考对象 Semi MCP：`npx -y @douyinfe/semi-mcp`，stdio，5 个工具（文档 / 文档内隐藏代码块 / 组件文件列表 / 文件代码 / 函数代码），知识按版本随包更新。

## Goals / Non-Goals

**Goals**

- `npx -y @wapri/mcp` 即可用，不要求业务项目安装 `@wapri/*`，也不要求能访问 GitHub / 文档站。
- 工具输出对 AI 友好：带包名、版本、路径、行号，正文是可直接阅读的 Markdown / 源码，而不是 JSON 大对象。
- 只读、无副作用、路径不出 `packages/` 语义（快照内的相对路径）。
- 一份 Skills 说清「先查文档 → 看示例 → 再看源码」的工作流与仓库硬约定。

**Non-Goals**

- 不做 HTTP / SSE 传输、不做远程部署与鉴权。
- 不做在线文档站抓取（离线优先）。
- 不做写操作、代码生成、组件脚手架。
- 不替代 dumi 文档站，也不解析 `docs-dist` 产物。

## Decisions

### 1. 知识在构建期快照成 `dist/knowledge.json`

MCP 随包发布后运行在用户项目里，读不到本仓库的 `packages/`；也不可能让用户先装 7 个包。所以在 `build` 里跑 `scripts/gen-knowledge.mjs` 扫描源码生成快照，放进 `dist`，跟着 `files: ["dist"]` 一起发。

- 数据形态：`{ generatedAt, packages[], docs[], demos[], files[] }`。
  - `packages`：`name`、`version`、`description`、`dir`（如 `element-pro`）、`entry`。
  - `docs`：`package`、`name`（kebab 目录名）、`title`、`route`、`markdown`、`demos[]`。
  - `demos`：`package`、`component`、`name`、`path`、`code`。
  - `files`：`package`、`path`（`<dir>/src/...`）、`kind`、`lines`、`code`。
- 体积取舍：全量源码快照约 2～3 MB，换来「离线 + 版本自洽」，可接受；`files` 只收源码类扩展名（`.ts`/`.tsx`/`.vue`/`.scss`/`.md`），不收图片与 `dist`。
- 版本一致性：快照里记录每个包的 `version`（读各包 `package.json`），工具输出头部展示，方便 AI 判断用户项目版本是否对得上。

### 2. 构建用 `tsc`，不用 `father` / `vite`

`father` 面向浏览器库的 bundless 产物（默认 `platform: 'browser'`、注入 babel runtime），`vite` 那套是给需要编译 `.vue` 的包用的。这个包是 Node ESM CLI：只要 `tsc` 输出 `dist/*.js` + `dist/*.d.ts`，`bin` 指向 `dist/cli.js`，shebang 由 tsc 原样保留。

- `tsconfig` 独立：`module`/`moduleResolution` 都用 `NodeNext`，`target: ES2022`，`rootDir: src`，`outDir: dist`。
- 相对导入带 `.js` 后缀（NodeNext 要求），保证 `node dist/cli.js` 直接可跑。
- 生成脚本用 `.mjs` 放 `scripts/`，`build` 顺序：清理 → `tsc` → 生成知识。

### 3. 工具集：7 个只读工具

| 工具 | 用途 |
| --- | --- |
| `list_components` | 组件总览（含包名/版本/路由/示例数），支持 `keyword`、`packageName` |
| `get_component_document` | 组件文档正文，支持按 `section` 切段 |
| `get_component_demo` | 示例清单 / 单个示例源码 |
| `get_component_files` | 组件目录文件树（路径 + 类型 + 行数）|
| `get_file_code` | 任意源码文件（可截取行区间）|
| `get_function_code` | 按符号名找实现（函数/常量/类型/组件）|
| `search_code` | 全文搜索，带上下文与 `路径:行号` |

比 Semi 多了 `search_code`（我们的文档分散在 7 个包，先用关词定位比逐个 `list` 更省 token），把 Semi 的「文档内隐藏代码块」折进 `get_component_demo`（我们的示例本来就是独立文件）。

命名与语义对齐 Semi 的 `get_*` 前缀，方便已有的 AI 习惯迁移。

### 4. 用官方 SDK + zod

`@modelcontextprotocol/sdk` 提供 `McpServer` 与 `StdioServerTransport`，`zod` 描述工具入参并自动生成 JSON Schema。手写 JSON-RPC 能省两个依赖，但协议细节（能力协商、`tools/list` 结构、错误码、通知）随时会变，不值得自维护。

- 只依赖 SDK 的 `server/mcp.js` 与 `server/stdio.js` 两个入口，避免把整包能力拉进运行期。
- 工具返回值统一走 `content: [{ type: 'text', text }]`，不做结构化 `structuredContent`（AI 读文本更稳，也便于人工排查）。

### 5. 错误处理与日志

stdio 模式下 stdout 就是协议流，任何 `console.log` 都会破坏连接。约定：一律 `console.error`；工具内部错误用 `isError: true` 的返回体，不 throw 到协议层；`uncaughtException` / `unhandledRejection` 打 stderr 后以非 0 退出。

### 6. Skills 放在包内 `skills/`

`skills/`、`README.md` 与 `dist` 一起进 `files`。内容分三份：

- `SKILL.md`：frontmatter（`name` / `description`）+ 触发条件与三步工作流。
- `WORKFLOWS.md`：具体任务流程（查表格排序、查表单校验、查播放器插件、排查组件不生效）。
- `BEST_PRACTICES.md`：引入方式、命名（`ProConfigProvider` / `ProSortState`）、禁用原生 storage、class 前缀、不要重复引 element-plus 样式等硬约定。

## Risks / Trade-offs

- **快照过期**：组件库发版后若忘了重建，MCP 会给出旧知识。缓解：输出头部标注版本与生成时间；发布流程里 `pnpm pub` 会全量 build（turbo 按 `dist` 是否变化决定，需人工确认 `mcp` 也重建）。取舍：不接受在运行时去读用户 `node_modules`（版本与入口不统一，容易读到别的包）。
- **体积**：`dist/knowledge.json` 数 MB，npm 包变大。缓解：只收源码扩展名、不压缩（可读性优先，便于排查）。
- **工具粒度**：7 个工具比 Semi 多 2 个，AI 选择成本略高。缓解：`list_components` 的输出里直接指引「下一步用哪个工具」。
- **依赖风险**：SDK 1.x 仍在演进，入参 schema API 可能变。缓解：把工具注册集中在一个文件，升级时只改一处；锁 `^1` 小版本。

## Migration Plan

纯新增包，无迁移。上线顺序：先发 `@wapri/mcp@0.1.0`，再在文档站 `/mcps` 与 README 给出接入片段；Skills 随包一起发，用户复制目录即可。

## Open Questions

- 是否需要在 MCP 里加入「组件 props 的结构化索引」（按 `name` + `type` + 默认值检索，而不是让 AI 读 Markdown 表）？先按 Markdown 交付，观察实际调用效果再决定。
- 是否需要把 `@wapri/mcp` 的版本与 `@wapri/element-pro` 版本做个映射表（多版本知识）？当前只有单版本快照，等有跨大版本并存的需求再说。
