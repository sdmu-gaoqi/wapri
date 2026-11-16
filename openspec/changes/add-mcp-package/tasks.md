# Tasks

## 1. 包骨架与依赖

- [x] 1.1 新建 `packages/mcp/{package.json,tsconfig.json,README.md,CHANGELOG.md}`，`name` 为 `@wapri/mcp`、版本 `0.0.0`、`type: module`、`bin: { "wapri-mcp": "dist/cli.js" }`、`files: ["dist","skills","README.md"]`
- [x] 1.2 安装 `@modelcontextprotocol/sdk` 与 `zod`，`@types/node` 进 devDependencies，验证 `pnpm install` 后 `node_modules/@modelcontextprotocol/sdk` 可解析
- [x] 1.3 `tsconfig.json` 用 `module/moduleResolution: NodeNext`、`rootDir: src`、`outDir: dist`，验证 `tsc --noEmit` 通过

## 2. 知识生成

- [x] 2.1 新增 `scripts/gen-knowledge.mjs`：扫描 `packages/*/src/**/index.md` 产出 `docs`（含 title、route、markdown、demos）
- [x] 2.2 扫描 `packages/*/src/**/demo/*.vue` 产出 `demos`（组件名、demo 名、路径、源码）
- [x] 2.3 扫描 `packages/*/src` 下 `.ts/.tsx/.vue/.scss/.md` 产出 `files`（相对 `packages/` 的路径、类型、行数、源码），并写入各包 `package.json` 的 name/version/description
- [x] 2.4 输出 `dist/knowledge.json`，验证文件可被 `JSON.parse` 且包含 7 个包、组件数与目录数一致

## 3. Server 与工具

- [x] 3.1 `src/types/index.ts` 定义 `Knowledge` / `DocEntry` / `DemoEntry` / `FileEntry` / `PackageInfo`
- [x] 3.2 `src/constant/index.ts` 落常量：搜索默认/最大条数、上下文行数、`packages` 根、日志前缀
- [x] 3.3 `src/knowledge/load.ts`：启动时读 `dist/knowledge.json`，构建按组件名 / 路径 / 符号的索引
- [x] 3.4 `src/knowledge/query.ts`：组件名归一化（kebab / PascalCase / 中文标题）、文档分节、文件树、行区间截取、符号查找、全文搜索
- [x] 3.5 `src/tools/register.ts`：注册 7 个工具与 zod 入参 schema，统一文本返回与 `isError` 错误体
- [x] 3.6 `src/server.ts` + `src/cli.ts`：`McpServer` + `StdioServerTransport`，技能声明、Node 版本检查、错误只走 stderr
- [x] 3.7 `src/index.ts`：导出 `createServer`，供测试与二次封装

## 4. 验证

- [x] 4.1 `pnpm --filter @wapri/mcp build` 通过，`dist/cli.js` 带 shebang 且可执行
- [x] 4.2 用 stdio 脚本完成 `initialize` → `tools/list`，确认返回 7 个工具
- [x] 4.3 逐个 `tools/call`：`list_components`、`get_component_document`（含 `section`）、`get_component_demo`、`get_component_files`、`get_file_code`（含行区间与越界路径）、`get_function_code`、`search_code`（含无命中）
- [x] 4.4 校验越界路径 `../../etc/passwd` 被拒绝、不存在的文件返回候选路径
- [x] 4.5 `pnpm lint`、`pnpm format:check` 通过；根 `tsconfig.json` 增加 `exclude: ["packages/mcp"]`（Node ESM 包走自己的 NodeNext 配置），用 8G 堆复跑根 `tsc` 只剩 3 个既有的 `.vue` 类型导入报错（与本次无关）

## 5. Skills

- [x] 5.1 `skills/wapri-design/SKILL.md`：frontmatter `name`/`description` + 何时用、三步工作流
- [x] 5.2 `skills/wapri-design/WORKFLOWS.md`：表格 / 表单 / 播放器 / 预览 / 排查 五条任务流程，工具名与参数与实现一致
- [x] 5.3 `skills/wapri-design/BEST_PRACTICES.md`：引入方式、`ProConfigProvider`/`ProSortState` 命名、禁用原生 storage、class 前缀、样式入口

## 6. 注册与文档

- [x] 6.1 `.dumirc.ts`：`atomDirs` 增加 `{ type: 'mcp', dir: 'packages/mcp/src' }`，nav 增加 `{ title: 'mcp', link: '/mcps' }`
- [x] 6.2 `packages/mcp/src/index.md`：安装（Claude Desktop / Cursor / Trae / CodeBuddy）、7 个工具的参数表、Skills 安装、数据与版本说明
- [x] 6.3 `docs/changelog/mcp.md` 新建，`docs/guide.md` 的包清单与构建说明补 `mcp`
- [x] 6.4 根 `AGENTS.md` Repository Map、`openspec/project.md` 包表补 `packages/mcp` / `@wapri/mcp`（构建方式标注 `tsc`）
- [x] 6.5 新增 `.changeset/add-mcp-package.md`，`"@wapri/mcp": minor`
- [x] 6.6 `npx -y @fission-ai/openspec@latest validate add-mcp-package --strict` 通过

## 7. Skills 一键安装面板

- [x] 7.1 Skills 文案移到 `public/skills/wapri-design/`（文档站静态目录，可直接下载），作为唯一来源
- [x] 7.2 `packages/mcp/scripts/sync-skills.mjs` + `build` 脚本：从 `public/skills` 同步到包内 `skills/`，`.gitignore` 排除生成目录
- [x] 7.3 `.dumirc.ts` 增加 `__DOC_PUBLIC_PATH__` define，面板按部署子路径取静态文件
- [x] 7.4 `packages/mcp/src/demo/install-skills.vue`：7 个客户端目录勾选、`showDirectoryPicker` 落盘、多选逐个写入、成功/失败/取消三种态、不支持时给下载链接
- [x] 7.5 `packages/mcp/src/index.md` 换成 `<code src="./demo/install-skills.vue">`，保留手动复制说明与文件清单表
- [x] 7.6 文档站构建后校验 `docs-dist/skills/wapri-design/*.md` 存在，且页面 chunk 含面板文案
- [x] 7.7 用 mock 的目录句柄在浏览器里跑一遍写入，断言三个文件落到 `<工具目录>/skills/wapri-design/`
- [x] 7.8 增加 dotagents 标准：`public/skills/wapri-design/skill.dotagents.md`（带 `id` / `kind` frontmatter），面板选项写 `.agents/skills/wapri-design/skill.md` 并兼容 `SKILL.md`
- [x] 7.9 用 mock 目录句柄验证勾选 dotagents 后写入 `.agents/skills/wapri-design/`，`skill.md` 的 frontmatter 含 `id: wapri-design`
- [x] 7.10 文档站与 README 补「写入不了」排查：Chromium + HTTPS/localhost + 允许写入，并列出 dotagents 目录
- [x] 7.11 写入前显式 `queryPermission` / `requestPermission`，面板分步显示「选择文件夹 → 确认权限 → 读取文件 → 正在写入 …」；拒绝授权时不落盘并给明确错误
