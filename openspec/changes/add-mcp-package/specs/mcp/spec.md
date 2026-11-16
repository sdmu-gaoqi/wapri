# Spec Delta

## Purpose

为 AI 编程助手提供 `@wapri/*` 组件库的权威知识入口：一个只读的 stdio MCP Server，能查组件文档、示例源码、源码文件与函数实现，并随包附一份告诉 AI「怎么查、怎么写」的 Skills。

## ADDED Requirements

### Requirement: 组件文档查询

MCP Server SHALL 提供 `list_components` 与 `get_component_document` 两个只读工具，覆盖 `packages/*/src` 下所有 `index.md` 对应的组件与包级文档。

#### Scenario: 列出全部组件

- **WHEN** 调用 `list_components` 且不传任何参数
- **THEN** 返回每个包的包名、版本与安装名，以及按包分组的组件清单
- **AND** 每项包含组件名（kebab-case）、标题、文档路由、示例数量

#### Scenario: 按关键词筛选

- **WHEN** 调用 `list_components` 并传 `keyword: "table"`
- **THEN** 只返回名称或标题命中该关键词的组件，且命中不区分大小写

#### Scenario: 读取组件文档

- **WHEN** 调用 `get_component_document` 并传 `name: "drag-sort-table"`
- **THEN** 返回该组件的 Markdown 文档正文
- **AND** 正文末尾附该组件可用的示例文件清单，供后续用 `get_component_demo` 拉取

#### Scenario: 只取文档的某一段

- **WHEN** 调用 `get_component_document` 并传 `section: "props"`
- **THEN** 只返回文档中 Props 相关的小节内容，不返回示例与说明
- **AND** `section` 取 `events` / `slots` / `examples` / `notes` 时行为一致

#### Scenario: 组件名写法不同

- **WHEN** 传入 `DragSortTable`、`drag-sort-table` 或文档标题中的中文名
- **THEN** 都能解析到同一个组件文档；解析不到时返回可用组件名提示，而不是抛错退出

### Requirement: 示例与源码检索

MCP Server SHALL 提供 `get_component_demo`、`get_component_files`、`get_file_code`、`get_function_code`、`search_code` 五个只读工具，用于查看示例与实现细节。

#### Scenario: 查看组件示例清单

- **WHEN** 调用 `get_component_demo` 并只传 `name`
- **THEN** 返回该组件 `demo/` 目录下的文件名与文档中对应的标题

#### Scenario: 读取示例源码

- **WHEN** 调用 `get_component_demo` 并传 `name` 与 `demo: "basic"`
- **THEN** 返回该 `.vue` 文件的完整源码
- **AND** 返回内容标注所属包与文件路径

#### Scenario: 浏览组件文件树

- **WHEN** 调用 `get_component_files` 并传 `name`
- **THEN** 返回该组件目录下的相对路径清单，按文件类型标注 `vue` / `ts` / `tsx` / `scss` / `md`，并给出每个文件的行数

#### Scenario: 读取任意源码文件

- **WHEN** 调用 `get_file_code` 并传 `path: "element-pro/src/ProTable/index.vue"`
- **THEN** 返回该文件源码，路径以仓库 `packages/` 为根
- **AND** 传 `startLine` / `endLine` 时只返回该区间，并在首行标注实际行号范围

#### Scenario: 按符号名查实现

- **WHEN** 调用 `get_function_code` 并传 `name: "getRecordKey"`
- **THEN** 返回声明该符号的文件路径、行号与完整实现（含函数体或对象字面量的完整括号区间）
- **AND** 同名符号命中多处时全部列出，可用 `packageName` 限定包

#### Scenario: 全文搜索

- **WHEN** 调用 `search_code` 并传 `query: "dragSortKey"`
- **THEN** 返回命中行所在的 `路径:行号`、命中行内容与上下各两行上下文
- **AND** 结果条数受 `limit` 限制，默认 20 条，最多 100 条

#### Scenario: 没有命中

- **WHEN** 任一检索工具没有匹配结果
- **THEN** 返回「未命中」的说明与可用的近似名称，不返回空字符串、不抛未捕获异常

### Requirement: 知识快照与版本一致

MCP Server SHALL 在构建期把文档、示例与源码快照进产物，并在返回结果中标注知识对应的包版本。

#### Scenario: 构建产物自带知识

- **WHEN** 执行 `pnpm --filter @wapri/mcp build`
- **THEN** `dist/knowledge.json` 被重新生成，内容来自当前 `packages/*/src` 的文档与源码
- **AND** 运行时不读取 `packages/`、不发起网络请求，脱离仓库目录也能正常应答

#### Scenario: 标注知识版本

- **WHEN** 调用任一会返回内容的工具
- **THEN** 结果头部标注生成时间与相关包名 + 版本（取自各包 `package.json`）
- **AND** 包版本与项目中实际安装版本不一致时，AI 可据此提示用户

### Requirement: 只读与路径边界

MCP Server MUST 只做读取，且所有路径参数限定在 `packages/` 目录内。

#### Scenario: 越界路径被拒绝

- **WHEN** `get_file_code` 收到 `path: "../../etc/passwd"` 或绝对路径
- **THEN** 返回拒绝说明，不返回任何文件内容

#### Scenario: 不存在的文件

- **WHEN** `get_file_code` 收到 `packages/` 内不存在的路径
- **THEN** 返回「文件不存在」并给出最相近的候选路径

#### Scenario: 协议流不被污染

- **WHEN** Server 启动、处理错误或打印调试信息
- **THEN** 所有日志写 stderr，stdout 只承载 MCP 协议消息

### Requirement: 客户端接入

包 SHALL 以 `bin: wapri-mcp` + stdio 传输发布，任何支持 MCP 的客户端用 `npx` 即可接入。

#### Scenario: npx 直接运行

- **WHEN** 在任意目录执行 `npx -y @wapri/mcp`
- **THEN** Server 在 stdio 上完成 `initialize` 握手并响应 `tools/list`，返回 7 个工具定义

#### Scenario: 客户端配置

- **WHEN** 在 `claude_desktop_config.json` 或 Cursor / Trae 的 MCP 配置中写入 `command: "npx"`、`args: ["-y", "@wapri/mcp"]`
- **THEN** 客户端能发现并调用全部工具

#### Scenario: Node 版本不足

- **WHEN** 运行环境的 Node 版本低于包 `engines` 声明
- **THEN** 启动时在 stderr 给出明确的版本提示并以非 0 退出码结束，不进入半可用状态

### Requirement: Skills 随包分发

包 SHALL 附一份可直接使用、也可一键写入用户项目的 Skills，说明工具工作流与仓库硬约定。

#### Scenario: Skills 目录内容

- **WHEN** 查看发布的 `@wapri/mcp` 包
- **THEN** 存在 `skills/wapri-design/`，含 `SKILL.md`（含 `name` / `description` frontmatter）、`WORKFLOWS.md`、`BEST_PRACTICES.md`
- **AND** 含 `skill.dotagents.md`：除 `name` / `description` 外还必须有 `kind: skill` 与 `id: wapri-design`，供 dotagents 识别

#### Scenario: 安装到项目

- **WHEN** 把该目录复制到 `.cursor/skills/`、`.trae/skills/`、`.claude/skills/`、`.codebuddy/skills/` 或 `.agents/skills/`
- **THEN** 客户端能识别该 skill，并按其工作流先查文档再写代码
- **AND** 写入 `.agents/skills/` 时把 `skill.dotagents.md` 作为主文件 `skill.md`，并保留 `SKILL.md` 兼容按大写文件名扫描的客户端

#### Scenario: 文档站一键写入项目

- **WHEN** 在文档站 mcp 页勾选编程工具、点击「添加到我的项目」并选择一个项目根目录
- **THEN** 面板创建 `<工具目录>/skills/wapri-design/`，默认写入 `SKILL.md`、`WORKFLOWS.md`、`BEST_PRACTICES.md` 三个文件
- **AND** 勾选 dotagents 时写入 `.agents/skills/wapri-design/`，其中 `skill.md` 与 `SKILL.md` 来自 `skill.dotagents.md`，另附两个说明文件
- **AND** 写入内容与包内同名源文件逐字一致（同一份文案，不在页面里另存一份）
- **AND** 勾选多个工具时逐个目录写入，完成后提示实际写入的路径

#### Scenario: 浏览器不支持目录写入

- **WHEN** 浏览器不支持 File System Access API（Firefox / Safari / 非安全 HTTP 等）
- **THEN** 「添加到我的项目」按钮置灰，并给出四份文件（含 dotagents 版）的下载链接与目标目录说明
- **AND** 说明必须点「允许写入」才会真正落盘，失败时面板展示具体错误

#### Scenario: 约定与实际代码一致

- **WHEN** Skills 中给出的引入方式、禁用项、命名约定与仓库现状不一致
- **THEN** 该文档视为缺陷，必须按当前源码修正（例如 `ProConfigProvider` 与 `ProSortState` 的命名）
