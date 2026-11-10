# Tasks

## 1. 类型与上下文

- [x] 1.1 新建 `packages/element-pro/src/StepsForm/types.ts`，定义 `StepsFormProps`、`StepsFormStepProps`、`StepsFormAction`、`StepsFormSubmitter`，验证 `pnpm lint` 无 `any`
- [x] 1.2 新建 `packages/element-pro/src/StepsForm/context.ts`，定义步骤注册表的 `provide` / `inject` 与 `StepsFormContext`，验证类型可被容器与步骤组件同时引用
- [x] 1.3 新建 `packages/element-pro/src/StepsForm/utils.ts`，实现按声明顺序合并各步骤 `model` 的 `mergeStepValues`，验证同名键以后声明的步骤为准

## 2. 步骤组件

- [x] 2.1 新建 `components/StepsFormStep.vue`，`setup` 阶段向容器注册 `{ name, title, model, formRef }`，验证步骤条渲染出的标题与声明顺序一致
- [x] 2.2 在 `StepsFormStep.vue` 内用 `ProForm` 承载字段，`model` 来自容器按 `name` 创建的对象，验证同名 `name` 在不同步骤互不影响
- [x] 2.3 实现 `initialValues`：挂载时写入本步骤 `model`，验证不影响其他步骤
- [x] 2.4 未处于当前步骤时用 `v-show` 隐藏而非销毁，验证切回上一步时已填数据仍在
- [x] 2.5 脱离 `StepsForm` 单独使用时给出开发期警告并退化为只渲染 `ProForm`，验证不抛运行时错误

## 3. 容器组件

- [x] 3.1 新建 `index.vue`，用 `ElSteps` + `ElStep` 渲染步骤条，`active` 绑定 `current`，验证步骤高亮随 `current` 变化
- [x] 3.2 实现步骤注册表：`register` / `unregister` 维护有序列表，重复 `name` 时开发期警告并保留先注册项，验证警告可触发
- [x] 3.3 实现 `next`：校验当前步骤通过后 `current + 1`，失败时保持不动，验证失败步骤展示错误信息
- [x] 3.4 实现 `prev`：直接 `current - 1`，不触发校验，验证返回上一步后数据仍在
- [x] 3.5 实现 `submit`：最后一步校验通过后调用 `onFinish(mergeStepValues())`，返回 `false` 时不重置也不回退，验证两种返回值的行为差异
- [x] 3.6 实现 `resetFields`：逐个步骤 `resetFields()` 并把 `current` 归零，验证全部字段恢复初始值
- [x] 3.7 实现 `getAllFieldsValue` 与 `getFormInstance(name)`，验证前者不触发校验、后者可取到指定步骤实例
- [x] 3.8 实现 `stepsProps` 透传，验证 `direction: 'vertical'` 生效
- [x] 3.9 实现 `allowStepSelect`：为 `true` 时点击步骤条直接切换且不校验，默认关闭，验证两种状态下的点击行为

## 4. 操作按钮

- [x] 4.1 实现默认按钮布局：第 1 步只有「下一步」，中间步骤「上一步」「下一步」，最后一步「上一步」「提交」，验证随 `current` 变化
- [x] 4.2 实现 `submitter` 文案配置与 `false` 隐藏，验证自定义文案生效且隐藏后仍可通过 `ref` 调用 `next` / `prev` / `submit`
- [x] 4.3 实现 `submitter` 插槽，验证自定义按钮可调用容器方法

## 5. 注册与样式

- [x] 5.1 新建 `index.ts`，用 `withInstall(StepsForm, { StepForm: StepsFormStep })` 导出，验证 `StepsForm.StepForm` 可被 `app.use` 注册
- [x] 5.2 新建 `styles/index.scss`，class 前缀使用 `constant/index.ts` 的 `prefix`，验证 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 5.3 修改 `packages/element-pro/src/index.ts`，加入 import、`export *`、具名导出与 `components` 注册数组，验证 `app.use(ElementPro)` 后两个组件均全局可用

## 6. 文档与示例

- [x] 6.1 新建 `index.md`，frontmatter 为 `title: StepsForm 分步表单`、`group.title: 表单`、`order: 3`，验证 `pnpm dev` 后 `/element-pros/steps-form` 可访问
- [x] 6.2 新建 `demo/basic.vue`，两步表单 + 必填校验，验证「下一步」被空值拦住、「提交」拿到合并值
- [x] 6.3 新建 `demo/vertical.vue`，验证 `stepsProps.direction: 'vertical'` 生效
- [x] 6.4 新建 `demo/selectable.vue`，验证 `allow-step-select` 与 `currentChange` 事件
- [x] 6.5 在 `index.md` 补 Props / Events / Slots / Ref 表，验证表中每一项都能在 demo 中找到用法
- [x] 6.6 在 `index.md` 写明三条约束：步骤 `name` 必须唯一、点击切换不校验、合并时后声明的步骤覆盖同名键

## 7. 集成验证

- [x] 7.1 在步骤内使用 `ProFormList` 与 `ProFormDependency`，验证行内相对名与联动在分步表单内正常
- [x] 7.2 运行 `pnpm lint`、`pnpm format:check`、`pnpm --filter @wapri/element-pro build`，全部通过
- [x] 7.3 运行 `pnpm doc`，确认文档站构建成功且新页面在产物中

## 8. 发布登记

- [x] 8.1 新增 `.changeset/steps-form.md`，内容为 `"@wapri/element-pro": minor` 并说明新增分步表单，验证 `pnpm changeset status` 能识别
- [x] 8.2 在根 `AGENTS.md` 的 Repository Map 与 `openspec/project.md` 的表单说明中补充 `StepsForm`，验证两处描述一致

## Workflow follow-up

- 实施完成后运行 `npx -y @fission-ai/openspec@latest validate add-steps-form --strict`。
- 校验通过后运行 `npx -y @fission-ai/openspec@latest archive add-steps-form` 归档。
- 提交、推送、开 PR 由人工执行。
