# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

本仓库是一个使用vue3+typescript+changesets编写的Monorepo前端项目

## Repository Map

- `packages/@base`: 基础能力建设
  - 被packages/下其他组件引入,基础通用的能力放在这里
  - 可存放常量,常量必须放在 /src/constant下
- `packages/hooks`, `packages/utils`: shared runtime packages.
  - hooks内置导出了`vue-hooks-plus`
  - utils内置导出了`lodash-es` 、`dayjs`、
- `packages/element-pro`: vue3组件库
  - 接入了tsx写法
  - 使用模板更优时,实现使用模板方式
  - 使用tsx更优时,实现使用tsx方式
  - 表单: 容器用 `ModalForm` / `DrawerForm`,字段用 `ProFormFields`(`ProFormText`、`ProFormSelect` 等,通过 `name` 读写 `ElForm` 的 `model`)
  - 表单的联动与数组字段用 `ProFormDependency` / `ProFormList`;`ProFormList` 行内字段用相对名,路径前缀由容器注入,不要手拼 `users.${index}`
  - 分步表单用 `StepsForm` + `StepsForm.StepForm`,每步独立 `model`;`name` 在同一容器内唯一,最后一步合并后交给 `onFinish`
  - 字段级类型与格式化(如 `ValueType`、`formatCellValue`)放在 `src/shared/field/`,表格与表单共用
- `packages/jsbridge`: App WebView 桥接,通道名由业务注入
- `packages/preview`: H5 文件预览(文本 / PDF / Word / XLSX)
  - 只依赖 `@wapri/gbase`,解析用 pdfjs-dist / mammoth / xlsx,排版用 opentype.js
  - 只渲染可视区域,常量放 `src/constant`

## OpenSpec 工作流

- 规范驱动：提案在 `openspec/`，先写提案后写代码；流程见 `openspec/AGENTS.md`，项目事实见 `openspec/project.md`
- 新增包、破坏性变更、跨包能力调整前，先在 `openspec/changes/<change-id>/` 写 `proposal.md`、`tasks.md`、`specs/<capability>/spec.md`（有取舍时补 `design.md`）
- 校验：`npx -y @fission-ai/openspec@latest validate <change-id> --strict`；实施完成后 `npx -y @fission-ai/openspec@latest archive <change-id>` 归档

## Common Commands

- 安装依赖: `pnpm install`
- 启动文档站: `pnpm dev`
- 打包文档站: `pnpm doc`
- 代码检查: `pnpm lint` / 自动修复 `pnpm lint:fix`（oxlint + `.oxlintrc.json`）
- 代码格式化: `pnpm format` / 仅校验 `pnpm format:check`（oxfmt + `.oxfmtrc.jsonc`）
- 发版: `pnpm ver` / `pnpm pub`

## Development Notes

- 比起新的抽象，更喜欢现有的组件模式。在更改结构之前，请先查看附近的组件。
- 将更改限制在请求的行为范围内。避免无关的重构和格式混乱。
- 对于组件更改，请检查相关的道具、发出的事件、公开的类型、样式和文档是否需要更新。
- 使用工作区包和现有别名，如“@wapri/*”，而不是随意引入新的本地路径。
- 避免添加依赖项，除非任务明确需要它们，而现有的工具链无法覆盖它们。
- 所有修改都要严格遵守 `.oxlintrc.json`（继承 `@wagq/lint-ox/oxlint/vue.json`）的配置,不得使用any
- element-pro 组件的 class 命名,必须使用 `packages\element-pro\src\constant\index.ts` 统一的 `prefix` 做为前缀
- 每次修改完,都要同步下文档与skill
- ui组件可以直接使用element-plus的直接使用element-plus的
- 不允许使用localStorage或sessionStorage,必须使用@wapri/gbase packages\@base\src\storage.ts中的导出
- 复杂的代码,类型超过三个的,不要把类型和实现写在一个文件里,放在同级目录的types/下维护

## Documentation And API

- 破坏性变更采用主版本号更新,新增功能采用次版本号更新,修复问题与样式变更采用补丁版本号更新
- 保持prop、event、slot和暴露类型与实现行为同步。
- 业务域名、桶名、网关前缀、Token 键、App 通道名一律走配置或环境变量,不要写进源码与文档示例。

## Git And Review Hygiene

- 除非明确要求，否则不要提交、推送或打开拉取请求,这一切都由你来申请,我来执行
- 在提交之前，确保格式化、lint、类型检查和测试都通过。
- 在完成之前，报告运行的命令和无法运行的任何检查。

## Document specifications

- md文档的目的是快速帮助别人上手,api说明与demo展示,不要标注一些多余的代码设计的文字说明

## Coding Standards

- 使用 interface 定义 Props
- 组件命名：PascalCase，文件名 index.tsx
- Never 使用 any 类型
- Never 使用内联样式,除非需要动态计算
- 减少funtion的使用,使用箭头函数
- 功能函数开发前,先检查base中是否有实现,有的话直接使用已有的实现,不要每次都重新开发
- 在功能开发时,将能落地到基础能力@base包中的实现维护到base中实现并导出
- utils包默认导出了base中的所有能力,所以在新增了base的实现时,请将md文档写入utils包中