# 项目上下文（wapri-sdk）

> 本文件是 OpenSpec 工作流的项目事实来源。`openspec/AGENTS.md` 负责流程，本文件负责「这个仓库到底长什么样」。
> 与根目录 `AGENTS.md` 冲突时，以根目录 `AGENTS.md` 为准。

## Purpose

`wapri-sdk` 是一个 pnpm workspace + changesets 管理的前端公共能力集合，产出可独立发版的 npm 包：

| 包目录 | 包名 | 形态 |
| --- | --- | --- |
| `packages/@base` | `@wapri/gbase` | 与框架无关的基础能力（storage、os、regexp、lodash/dayjs 出口） |
| `packages/hooks` | `@wapri/ghooks` | Vue 3 hooks（内置导出 `vue-hooks-plus`） |
| `packages/utils` | `@wapri/gutils` | 通用函数（内置导出 `lodash-es`、`dayjs`） |
| `packages/element-pro` | `@wapri/element-pro` | Vue 3 中后台组件库（模板 + tsx） |
| `packages/player` | `@wapri/gplayer` | 视频播放器 `VideoPlayer`（基于 artplayer），插件按 key + 配置覆盖声明，内置 18 个插件，画面类效果走共享 canvas 渲染管线 |
| `packages/preview` | `@wapri/preview` | H5 文件预览（文本 / PDF / Word / XLSX），按可视区域懒渲染 |
| `packages/jsbridge` | `@wapri/gjsbridge` | App WebView 桥接，通道名由业务注入 |

## Tech Stack

- 包管理：pnpm 9.x workspace（`packages/*`，`@base` 属于一层目录，同样被 glob 覆盖）
- 版本与 changelog：changesets（`.changeset/config.json`，`baseBranch: main`）
- 构建：father 4（`@wapri/gbase` / `ghooks` / `gutils` / `gjsbridge` / `preview`）；vite + `vite-plugin-dts`（`element-pro`、`player`，需要编译 `.vue`）
- 构建编排：turbo（`build` 依赖 `^build`，`dev` 常驻）
- 文档站：dumi 2.4 + `@dumijs/preset-vue`，配置在 `.dumirc.ts`
- 检查与格式：oxlint + oxfmt（`@wagq/lint-ox`），husky + lint-staged 在提交时执行
- TypeScript 严格模式，`strict: true`，禁止 `any`

## Project Conventions

### Code Style

- 常量必须放在 `src/constant/` 下并导出，不在业务文件里散写魔法值。
- 类型超过三个或实现较长时，类型放同级 `types/` 目录，不与实现混在一个文件。
- 组件 class 命名以 `packages/element-pro/src/constant/index.ts` 的 `defaultPrefix`（`wa-ui`）为前缀。
- `element-pro` 的表单由两部分组成：容器是 `ModalForm` / `DrawerForm`，字段是 `ProFormFields` 目录下的一组组件（`ProFormText`、`ProFormSelect` 等）。字段组件通过 `name` 读写 `ElForm` 的 `model`，`name` 同时是 `ElFormItem` 的 `prop`。
- 向导式录入用 `StepsForm` + `StepsForm.StepForm`：每个步骤有独立的 `model`，`next()` 先校验当前步，最后一步把各步字段合并后交给 `onFinish`；`name` 在同一容器内必须唯一。
- 多 tab 编辑用 `TabForm` + `TabForm.Item`：所有 tab 共用一份 `model`，切换不校验，提交时校验全部 tab 并跳到第一个出错的分段；字段名跨 tab 应保持唯一。`tabPosition` 取 `left` / `right` 时为垂直导航，导航列宽度由 `navWidth` 控制。
- 表单的联动与数组字段由 `ProFormFields` 目录下的 `ProFormDependency`、`ProFormList` 承担：前者按 `names` 订阅字段子集，后者在行内注入路径前缀，字段的 `name` 在列表内是相对当前行的路径。
- 字段级能力（`ValueType`、`ValueEnum`、`formatCellValue` 等）放在 `packages/element-pro/src/shared/field/`，`ProTable/types.ts` 与 `ProTable/utils.ts` 只做 re-export，保证表格与表单共用同一份解析。
- 拖拽排序统一走 `@vue-dnd-kit/core`：表格用 `DragSortTable`（`dragSortKey` 指定把手列，`onDragSortEnd` 拿新顺序），上传列表用 `CropperUpload` 的 `sortable`。两个组件各自持有私有 `DnDProvider`，业务不需要在应用根部包 provider；`shared/dnd/SortableItemRegistrar.vue` 是「目标元素不在自己的组件里」时的通用注册器。
- 禁止直接使用 `localStorage` / `sessionStorage`，统一走 `@wapri/gbase` 的 `storage` / `MyStorage`。
- 业务域名、桶名、网关前缀、Token 键、App 通道名一律走配置或环境变量，不写进源码与文档示例。
- 优先复用 `@wapri/*` 工作区别名，不引入新的相对路径穿透。

### Architecture Patterns

- 依赖方向：`@base` 是叶子包；`hooks`、`utils` 依赖 `gbase`；`element-pro` 依赖 `ghooks`、`gutils`、`preview`、`player`；`jsbridge` 依赖 `gbase`；`player` 依赖 `gbase` 与 `artplayer`，`vue` 为 peer。新包默认只向下依赖 `@wapri/gbase`。
- 每个包自包含：`package.json`、`tsconfig.json`、构建配置、`README.md`、`src/index.md`（dumi 页面）齐全。
- `build` 脚本统一以 `node ../../scripts/clean-dist.mjs &&` 开头，避免 `dist` 里残留已删除模块被一起发包。
- 文档路由由 `.dumirc.ts` 的 `atomDirs.type` 推导并复数化：`element-pro` → `/element-pros`，`jsbridge` → `/jsbridges`。新增 `type` 后一律按复数写导航与内链。

### Testing Strategy

- 仓库目前没有单测框架；验证以 `pnpm lint`、`pnpm format:check`、`pnpm build`、`pnpm doc` 为准。
- 涉及运行时的能力，在 `src/index.md` 提供可运行示例，作为人工验证入口。
- 不为通过检查而放宽 `.oxlintrc.json` 或 `.oxfmtrc.jsonc`。

### Git Workflow

- 功能开发在 `feature` 分支进行，不直接改动 `main`。
- 破坏性变更用 major，新能力用 minor，修复与样式用 patch。
- 提交前必须通过 lint、format、type、build；提交、推送、开 PR 由人工执行，agent 不代为执行。
- 变更完成后同步文档（含 dumi 页面）与根 `AGENTS.md` 的仓库地图。

## Domain Context

- 面向 App WebView 与中后台两端的公共前端包，业务方按需安装，不允许包内写死具体业务标识。
- 包的「公共 API」即 `src/index.ts` 的导出与包 `README.md` 的说明，二者必须同步。
- 文档站部署到 GitHub Pages（`deploy-docs.yml`），构建产物中不得出现构建机绝对路径。

## Important Constraints

- 不新增依赖，除非现有工具链无法覆盖；内部包只能用 `workspace:^` 协议引用。
- 不新增 CI 工作流文件；沿用现有 `deploy-docs.yml` 与 `pnpm ver` / `pnpm pub`。
- 不提交、不推送、不开 PR。
- 新增包必须同时登记：`.dumirc.ts`（atomDirs / nav / alias）、`docs/changelog/<pkg>.md`、changeset 记录。

## External Dependencies

- npm registry：`https://registry.npmjs.org/`，所有包 `publishConfig.access: public`。
- 文档站依赖 `DOC_*` 环境变量注入品牌与部署子路径，仓库内不落业务域名。
