# add-preview-package — 设计

## Context

仓库已有五个包，构建方式分两派：`father`（库，ESM 输出）与 `vite`（仅 `element-pro`，需要编译 `.vue` 与产出样式）。`@wapri/gbase` 是依赖树的叶子，`ghooks` / `gutils` / `gjsbridge` / `element-pro` 都从它取基础能力。

新包 `preview` 的定位是「预览包」,为h5提供预览文件的能力,通过webAssembly、webwork、createObjectURL、iframe的能力,新开webwork解析文件,解析后,交给主线程预览,并且不是一次性解析完才可以预览,而是用户看到哪里,才渲染哪里,缩略图的渲染也只渲染看得到的区域

## Goals / Non-Goals

**Goals**

- 不要局限在preview包,有些方法可以放在base里可以放在base中做为base的能力
- 建立 `@wapri/preview` 的可构建、可文档化、可发版的最小骨架。
- 固化依赖边界：只依赖 `@wapri/gbase`，为将来在非 Vue 环境复用留出空间。
- 让 `pnpm build` / `pnpm doc` / `pnpm changeset` 三条链路都能自动带上新包，不新增 CI。
- 产出一份可被后续 change 继承的能力规范（`preview`）。
- 每个能力要实现的原子化,比如,创建webwork...就可以单独实现为一个功能放进base包中
- 要求支持预览的文件包括文本、pdf、word、xlsx等,视频先不需要处理
- 在实现上,要做到功能独立分开,导出previewText, previewWord, previewXlsx...,但是实现一个previewFile,自动获取文件类型,调用不同的具体预览方法
- 预览需要支持预览本地文件与远程文件

**Non-Goals（本期不做）**

- 视频、音频、PPT、图片画廊预览。
- Word 分栏、文本框、公式、批注等复杂排版；不追求与 Office 逐像素一致。
- Vue 组件与样式产物；`preview` 只提供与框架无关的 DOM / Canvas 渲染。
- 单测框架；验证依赖 `tsc` / `build` / `lint` / `doc` 与 dumi 手测。

## Decisions

**D1 目录 `packages/preview`，包名 `@wapri/preview`**

`pnpm-workspace.yaml` 的 `packages/*` 能直接覆盖该目录（`@base` 同为一层目录，已验证），无需改 workspace 配置。包名沿用 `@wapri/<短名>` 约定；目录名不带 `g`/`wa` 前缀，与 `hooks`、`utils` 的写法一致。

**D2 构建用 father，不用 vite**

`preview` 产物是纯 TS，无组件、无样式，father 的 `esm` 单产物足够，且与 `gbase` / `ghooks` / `gutils` 共用同一套脚本。demo 是 `.vue` 文件，只被 dumi 文档站消费，不进入 npm 产物。等真正需要编译单文件组件时再评审切到 vite。

**D3 只依赖 `@wapri/gbase`，不声明 `vue` peer**

用户明确要求「依赖 base 包」。当前没有视图层，声明 `vue` peerDependency 会给纯逻辑消费方制造无谓的安装约束。将来引入 Vue 组件时，用 MODIFIED 需求补 `peerDependencies` 与 `peerDependenciesMeta`。

**D4 初始版本 `0.0.0` + changeset `minor`**

`docs/guide.md` 规定新包初始 `0.0.0`。骨架属于「新增能力」，按仓库语义化约定用 `minor` 落到 `0.1.0`；不带功能的包不占用 `1.0.0`。

**D5 能力名 `preview`，文档路由 `/previews`**

dumi 对 `atomDirs.type` 复数化（`element-pro` → `/element-pros`），因此导航与内链统一写 `/previews`，否则 404。capability 目录与 `atomDirs.type` 同名，便于从 spec 反查文档页。

**D6 导出完整 API，而非占位常量**

`src/index.ts` 导出 `previewFile`、`previewText`、`previewPdf`、`previewWord`、`previewXlsx`、`configurePdfjs`、`PreviewUnsupportedError` 与全部选项类型；`PREVIEW_PACKAGE_NAME` 只作为包标识保留。常量放 `src/constant/index.ts`，符合「常量必须放 `/src/constant`」的仓库规则。

**D7 CLI 不落依赖**

OpenSpec CLI 通过 `npx -y @fission-ai/openspec@latest` 临时调用，不写进 `package.json`，避免为文档流程引入运行时依赖。

**D8 解析与排版选型**

按确认的技术路线：PDF 用 `pdfjs-dist` 的 legacy 构建 + 独立 worker；docx 用 `mammoth` 转块模型；xlsx 用 SheetJS；Word 的断行、表格布局与分页由自研排版层完成，字体度量优先用 `opentype.js` 读取内嵌字体，缺失时回退 Canvas `measureText`，最终统一绘制到 Canvas。仓库内不自研二进制解析器。

**D9 通用能力下沉 gbase**

`createInlineWorker` / `WorkerChannel`、`createObjectUrl` / `revokeObjectUrl`、`readFileAsArrayBuffer` / `readFileAsText`、`detectFileType`、`observeVisibility` 放在 `@wapri/gbase`；`preview` 只做组合，不复制这些实现。

**D10 懒渲染粒度**

文本 80 行一块，PDF / Word 每页，XLSX 按可视行列。共享 IntersectionObserver，渲染并发上限 1-2，避免同时绘制多个大 canvas 造成卡顿；Word 页离开视口时释放位图。

**D11 vendor 资源随包发布**

构建后把 pdf.js worker 与 SheetJS UMD 复制到 `dist/vendor`，默认零配置可用；CMap 与标准字体体积大且依赖部署路径，不随包发布，由 `configurePdfjs` 注入。

## Risks / Trade-offs

- **pdf.js worker 路径被构建器解析**：`new URL('../vendor/x', import.meta.url)` 会让 webpack 在文档站构建时尝试解析不存在的源码路径并失败；并且 webpack 会把 `import.meta.url` 替换成 `file://` 构建机路径，浏览器拉不到 worker。最终改为字符串拼接 + 只接受 `http(s)`，文档站把 worker 放进 `public/` 并由 demo 显式 `configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })`，业务侧按部署位置配置。
- **Word 保真度**：自研排版只覆盖标题、段落、列表、表格、图片，不追求与 Office 逐像素一致；复杂分栏、文本框、公式不在本期范围。
- **Canvas 内存**：PDF / Word 每页一张 canvas，页数多时内存压力大，因此 Word 页离开视口后清空位图，PDF 保持位图但限制并发渲染。
- **依赖体积**：`pdfjs-dist`、`mammoth`、`xlsx`、`opentype.js` 都不小，包体积明显大于其他工具包；这是完整预览能力的必要成本，后续可按需拆分入口。
- **路由复数化踩坑**：`/preview` 与 `/previews` 混写会造成死链。缓解：tasks 4.1 / 4.4 显式校验，project.md 记录复数化规则。
- **文档 embed 目标缺失**：`docs/changelog/preview.md` 依赖 `packages/preview/CHANGELOG.md`，缺少时 dumi 构建失败；已提前建占位文件。
- **turbo 缓存盲区**：新包未参与过构建，可能命中旧缓存。缓解：`pnpm build` 全量验证，必要时 `pnpm --filter @wapri/preview build --force`。

## Migration Plan

- 纯新增，无需迁移。现有包版本与导出不变；`@wapri/gbase` 只新增导出，无破坏性改动。
- 后续功能 change 在 `openspec/changes/<id>/specs/preview/spec.md` 用 `## ADDED Requirements` 增量追加。
- 若后续把 `preview` 的某能力下沉/合并进 `gbase`，需单独开 change 并在 delta 中使用 `## REMOVED Requirements`，同步 `project.md` 包表。

## Open Questions

- 预览器的首期能力范围已确认为文本 / PDF / Word / XLSX；图片与音视频留待后续 change。
- WebView 内是否需要 `jsbridge` 读取本地文件？当前只吃 `File` / `Blob`，不依赖桥接。
- class 前缀暂定 `wa-preview`；若后续引入视图层组件，再评审是否统一到 `wa-ui`。
