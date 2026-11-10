# Tasks

## 1. 类型与上下文

- [x] 1.1 新建 `packages/element-pro/src/TabForm/types.ts`，定义 `TabFormProps`、`TabFormItemProps`、`TabFormAction`、`TabFormSubmitter`，验证 `pnpm lint` 无 `any`
- [x] 1.2 新建 `packages/element-pro/src/TabForm/context.ts`，定义分段注册表与 `TabFormContext`，验证类型可被容器与分段组件同时引用
- [x] 1.3 新建 `packages/element-pro/src/TabForm/utils.ts`，实现 `firstInvalidTab`（按声明顺序取第一个校验失败的分段），验证顺序稳定

## 2. 分段组件

- [x] 2.1 新建 `components/TabFormItem.vue`，`setup` 阶段向容器注册 `{ name, getTitle, getDisabled, getForm }`，验证 tab 标题与声明顺序一致
- [x] 2.2 在 `TabFormItem.vue` 内用 `ProForm` 承载字段，`model` 来自容器传入的共享对象，验证两个 tab 读写同一字段时值同步
- [x] 2.3 未处于激活 tab 时用 `v-show` 隐藏而非销毁，验证切回时已填数据与校验状态仍在
- [x] 2.4 脱离 `TabForm` 单独使用时给出警告并退化为只渲染 `ProForm`，验证不抛运行时错误

## 3. 容器组件

- [x] 3.1 新建 `index.vue`，用 `ElTabs` + `ElTabPane` 渲染导航，`ElTabPane` 不设 `lazy`，验证未访问过的 tab 字段已挂载
- [x] 3.2 实现分段注册表：`register` / `unregister` 维护有序列表，重复 `name` 时警告并保留先注册项，验证警告可触发
- [x] 3.3 实现 `active` 受控与非受控：`active` 传入时受控，内部跳转通过 `update:active` 通知，验证两种模式行为一致
- [x] 3.4 实现 `submit`：按声明顺序串行校验，遇到第一个失败就切到该 tab 并返回 `false`，验证跳转目标正确
- [x] 3.5 实现提交成功路径：全部通过后调用 `onFinish({ ...model })`，返回 `false` 时不重置，验证浅拷贝与返回值语义
- [x] 3.6 实现错误标记：失败的分段在 tab 标题上展示 `ElBadge` 红点，下一次提交时重算，验证标记随校验结果变化
- [x] 3.7 实现 `resetFields`：逐个分段 `resetFields()` 并清除错误标记，验证全部字段恢复初始值
- [x] 3.8 实现 `getFormInstance(name)` 与 `getInvalidTabs()`，验证前者可取到指定分段实例、后者不触发新校验
- [x] 3.9 实现 `tabsProps` 与 `formProps` 透传，验证 `type: 'border-card'` 与 `labelWidth` 生效

## 4. 操作按钮

- [x] 4.1 实现默认按钮：只有「提交」与「重置」，验证不出现上一步/下一步
- [x] 4.2 实现 `submitter` 文案配置与 `false` 隐藏，验证自定义文案生效且隐藏后仍可通过 `ref` 调用 `submit`
- [x] 4.3 实现 `submitter` 插槽，验证自定义按钮可调用容器方法

## 5. 注册与样式

- [x] 5.1 新建 `index.ts`，用 `withInstall(TabForm, { Item: TabFormItem })` 导出，验证 `TabForm.Item` 可被 `app.use` 注册
- [x] 5.2 新建 `styles/index.scss`，class 前缀使用 `constant/index.ts` 的 `prefix`，验证 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 5.3 修改 `packages/element-pro/src/index.ts`，加入 import、`export *`、具名导出与 `components` 注册数组，验证 `app.use(ElementPro)` 后两个组件均全局可用

## 6. 文档与示例

- [x] 6.1 新建 `index.md`，frontmatter 为 `title: TabForm 多 tab 表单`、`group.title: 表单`、`order: 3`，验证 `pnpm dev` 后 `/element-pros/tab-form` 可访问
- [x] 6.2 新建 `demo/basic.vue`，三个 tab + 必填校验，验证提交时校验全部 tab
- [x] 6.3 新建 `demo/cross-tab.vue`，第 1 个 tab 的字段驱动第 2 个 tab 的 `ProFormDependency`，验证跨 tab 联动成立
- [x] 6.4 新建 `demo/error-jump.vue`，第 1 与第 3 个 tab 留空，验证提交后跳到第 1 个 tab 且两处都有红点
- [x] 6.5 在 `index.md` 补 Props / Events / Slots / Ref 表，验证表中每一项都能在 demo 中找到用法
- [x] 6.6 在 `index.md` 写明三条约束：分段 `name` 唯一、字段名跨 tab 应唯一、tab 切换不校验

## 7. 集成验证

- [x] 7.1 在 tab 内使用 `ProFormList` 与 `ProFormDependency`，验证行内相对名与联动在多 tab 表单内正常
- [x] 7.2 运行 `pnpm lint`、`pnpm format:check`、`pnpm --filter @wapri/element-pro build`，全部通过
- [x] 7.3 运行 `pnpm doc`，确认文档站构建成功且新页面在产物中

## 8. 发布登记

- [x] 8.1 新增 `.changeset/tab-form.md`，内容为 `"@wapri/element-pro": minor` 并说明新增多 tab 表单，验证 `pnpm changeset status` 能识别
- [x] 8.2 在根 `AGENTS.md` 的 Repository Map 与 `openspec/project.md` 的表单说明中补充 `TabForm`，验证两处描述一致

## Workflow follow-up

- 实施完成后运行 `npx -y @fission-ai/openspec@latest validate add-tab-form --strict`。
- 校验通过后运行 `npx -y @fission-ai/openspec@latest archive add-tab-form` 归档。
- 提交、推送、开 PR 由人工执行。
