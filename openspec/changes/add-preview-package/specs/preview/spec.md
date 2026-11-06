## ADDED Requirements

### Requirement: 包身份与目录位置

仓库 SHALL 在 `packages/preview` 提供名为 `@wapri/preview` 的 workspace 包，初始版本 `0.0.0`，并可通过 pnpm workspace 解析到。

#### Scenario: workspace 能识别新包

- **WHEN** 在仓库根目录执行 `pnpm ls -r --depth -1`
- **THEN** 输出中包含 `@wapri/preview`
- **AND** 其路径指向 `packages/preview`
- **AND** `pnpm-workspace.yaml` 无需修改（`packages/*` 已覆盖该目录）

#### Scenario: 包元信息符合发布约定

- **WHEN** 读取 `packages/preview/package.json`
- **THEN** `files` 为 `["dist"]`，`sideEffects` 为 `false`
- **AND** `module` 指向 `dist/index.js`，`types` 指向 `dist/index.d.ts`
- **AND** `publishConfig.access` 为 `public`，`publishConfig.registry` 为 `https://registry.npmjs.org/`

### Requirement: 依赖边界

`@wapri/preview` SHALL 只依赖 `@wapri/gbase` 作为工作区内部包，解析与排版能力通过 `pdfjs-dist`、`mammoth`、`xlsx`、`opentype.js` 提供，不得引入 `vue`、`@wapri/element-pro`、`element-plus`。

#### Scenario: 依赖清单符合预期

- **WHEN** 读取 `packages/preview/package.json` 的 `dependencies`
- **THEN** 工作区内部依赖仅 `@wapri/gbase: workspace:^`
- **AND** 依赖中包含 `pdfjs-dist`、`mammoth`、`xlsx`、`opentype.js`
- **AND** `peerDependencies` 中不出现 `vue`

#### Scenario: 基础能力复用 gbase

- **WHEN** 在 `packages/preview/src` 中检索 `localStorage`、`sessionStorage`、`new Worker(`
- **THEN** 无直接使用
- **AND** Worker 创建、Object URL 管理、文件读取、类型嗅探、可视区域观察全部来自 `@wapri/gbase`

### Requirement: 基础能力下沉

`@wapri/gbase` SHALL 提供可复用的原子能力：`createInlineWorker` / `WorkerChannel`、`createObjectUrl` / `revokeObjectUrl`、`readFileAsArrayBuffer` / `readFileAsText`、`detectFileType`、`observeVisibility`。

#### Scenario: worker RPC 可用

- **WHEN** 用 `createInlineWorker` 创建 worker 并交给 `new WorkerChannel(worker)`
- **THEN** `channel.request({ type, payload })` 返回 Promise 并解析 worker 的 result
- **AND** worker 回传 error 时 Promise reject
- **AND** `channel.terminate()` 拒绝所有未完成任务并终止 worker

#### Scenario: 文件类型嗅探

- **WHEN** 传入以 `%PDF` 开头的字节与文件名 `demo.pdf`
- **THEN** `detectFileType` 返回 `category: 'pdf'`
- **AND** 传入 zip 头且内部含 `word/` 时返回 `category: 'word'`
- **AND** 传入 zip 头且内部含 `xl/` 时返回 `category: 'xlsx'`

### Requirement: 自动识别与分发

`previewFile(input, options)` SHALL 读取文件头识别类型，并分发到 `previewText` / `previewPdf` / `previewWord` / `previewXlsx`。

#### Scenario: 按类型分发

- **WHEN** 传入 PDF 文件调用 `previewFile`
- **THEN** 返回句柄的 `kind` 为 `'pdf'`
- **AND** 传入 docx 文件时 `kind` 为 `'word'`
- **AND** 传入 xlsx 文件时 `kind` 为 `'xlsx'`
- **AND** 传入纯文本时 `kind` 为 `'text'`

#### Scenario: 不支持的类型给出明确提示

- **WHEN** 传入 `.doc` 旧格式
- **THEN** 抛出 `PreviewUnsupportedError`，提示另存为 `.docx`
- **AND** 容器内展示错误文案

### Requirement: 文本预览

`previewText` SHALL 把文本按行分块，并在块进入视口时填充内容。

#### Scenario: 大文本懒渲染

- **WHEN** 预览 2000 行文本
- **THEN** 初始只渲染可视区域对应的分块
- **AND** 未进入视口的块只有占位高度、没有文本节点
- **AND** 句柄的 `unitCount` 等于分块数

### Requirement: PDF 预览

`previewPdf` SHALL 使用 pdf.js 解析并在 Canvas 上按页渲染，未进入视口的页不渲染位图。

#### Scenario: 按页渲染

- **WHEN** 预览一份 20 页 PDF
- **THEN** 每页有独立容器与占位高度
- **AND** 页进入视口后才创建 canvas 并执行渲染
- **AND** 句柄的 `unitCount` 为 20

#### Scenario: 缩略图按需渲染

- **WHEN** 传入 `thumbnails: true`
- **THEN** 底部出现缩略图条
- **AND** 缩略图进入视口后才绘制
- **AND** 点击缩略图滚动到对应页

### Requirement: Word 预览

`previewWord` SHALL 用 mammoth 解析 docx 为块模型，用 opentype.js 或 Canvas 字体度量完成断行、表格布局与分页，再绘制到 Canvas。

#### Scenario: 分页与懒绘制

- **WHEN** 预览包含标题、段落、列表、表格、图片的 docx
- **THEN** 文档被切分为多页，每页有独立 canvas
- **AND** 页进入视口后才绘制
- **AND** 页离开视口时释放 canvas 位图

#### Scenario: 内嵌字体精确测量

- **WHEN** 传入 `fonts`（TTF / OTF 的 ArrayBuffer）
- **THEN** 断行宽度来自 `opentype.js` 的 `getAdvanceWidth`
- **AND** 不传字体时回退 Canvas `measureText`

### Requirement: XLSX 预览

`previewXlsx` SHALL 用 SheetJS 解析工作簿，并只渲染可视行列；合并单元格、列宽、行高与多 sheet 切换均需保留。

#### Scenario: 虚拟表格

- **WHEN** 预览一份 10000 行的工作表
- **THEN** DOM 中只存在可视区域附近的单元格
- **AND** 滚动时按新视口重建单元格
- **AND** 句柄的 `unitCount` 等于当前 sheet 行数

#### Scenario: 多 sheet 与合并

- **WHEN** 工作簿包含多个 sheet
- **THEN** 顶部渲染 sheet 标签并可切换
- **AND** 合并单元格按起始格渲染为跨行列的单元格
- **AND** 列宽取自 `!cols`，行高取自 `!rows`

#### Scenario: worker 解析失败可回退

- **WHEN** worker 或 SheetJS UMD 不可用
- **THEN** 自动回退主线程解析，预览仍可完成

### Requirement: 可视区域懒渲染

预览实现 SHALL 通过 IntersectionObserver 或等价的视口计算，只在单元进入可视区域时渲染，并限制并发渲染数量。

#### Scenario: 视口外不渲染

- **WHEN** 预览 100 页 PDF 并停留在第 1 页
- **THEN** 仅第 1 页及预渲染边距内的页被绘制
- **AND** 句柄的 `renderedCount` 小于总页数

### Requirement: 本地与远程来源

预览入口 SHALL 同时接受本地 `File` / `Blob`、内存 `ArrayBuffer` / `ArrayBufferView`、远程 URL 字符串，以及带自定义请求头的 `{ url, fileName?, headers? }`。

#### Scenario: 远程文件

- **WHEN** 传入 `{ url: 'https://example.com/demo.pdf', headers: { Authorization: 'Bearer token' } }`
- **THEN** 请求带上指定请求头
- **AND** 响应字节被识别为 PDF 并进入 PDF 预览

#### Scenario: 纯文本字符串

- **WHEN** 传入一段非 URL 的字符串
- **THEN** 按文本内容处理并走文本预览

### Requirement: 资源释放

预览句柄 SHALL 在 `destroy()` 时取消渲染任务、销毁 worker、释放 canvas 与 Object URL。

#### Scenario: 销毁 PDF 预览

- **WHEN** 调用 PDF 句柄的 `destroy()`
- **THEN** 所有 canvas 从 DOM 移除
- **AND** pdf.js 文档与 worker 被销毁
- **AND** 再次调用 `destroy()` 不产生副作用

### Requirement: 构建与产物

`@wapri/preview` SHALL 使用 father 构建 ESM 产物到 `dist`，构建前清空 `dist`，并在构建后把 pdf.js worker 与 SheetJS UMD 复制到 `dist/vendor`。

#### Scenario: 单包构建

- **WHEN** 执行 `pnpm --filter @wapri/preview build`
- **THEN** 生成 `packages/preview/dist/index.js` 与 `packages/preview/dist/index.d.ts`
- **AND** 生成 `packages/preview/dist/vendor/pdf.worker.min.mjs` 与 `packages/preview/dist/vendor/xlsx.full.min.js`

#### Scenario: 全量构建顺序

- **WHEN** 在仓库根目录执行 `pnpm build`
- **THEN** turbo 依据 `dependsOn: ["^build"]` 先构建 `@wapri/gbase`，再构建 `@wapri/preview`

### Requirement: 文档站接入

`.dumirc.ts` SHALL 将 `packages/preview/src` 注册为 `atomDirs` 中 `type: 'preview'` 的目录，并提供 `@wapri/preview` 别名与 `/previews` 导航入口。

#### Scenario: 包文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/previews`
- **THEN** 渲染 `packages/preview/src/index.md`
- **AND** 页面包含安装命令与 `previewFile` 示例
- **AND** 导航链接为复数形式 `/previews`

#### Scenario: 文档站构建通过

- **WHEN** 执行 `pnpm doc`
- **THEN** 构建成功且产物中无构建机绝对路径残留

### Requirement: 发布与变更记录

新包 SHALL 通过 changesets 纳入版本管理，且不新增 CI 工作流。

#### Scenario: changeset 记录新包

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/preview": minor`
- **AND** 摘要说明新增 preview 包与 gbase 原子能力

#### Scenario: 发布链路不变

- **WHEN** 查看 `.github/workflows`
- **THEN** 文件列表与本变更前一致
- **AND** 发版仍通过 `pnpm ver` 与 `pnpm pub` 完成
