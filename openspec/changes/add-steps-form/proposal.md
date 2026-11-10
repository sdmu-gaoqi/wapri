# add-steps-form

## Why

`element-pro` 已经有 `ProForm` 容器和 `ProFormFields` 字段集，长表单可以一次填完，但向导式录入（新建项目、开户、审批流）仍需业务自己拼 `ElSteps` + 多个 `ElForm`：每一步要单独维护校验、上一步不能回滚数据、最后一步要把各步的值合并后再提交。这套样板每个业务页面重写一遍，且容易漏掉「下一步先校验再跳转」。

本变更交付 `StepsForm`：用 `<StepsForm>` 包住若干 `<StepsForm.StepForm>`，每步一个独立表单，下一步前自动校验当前步，最后一步提交时合并全部字段。

## What Changes

- 新增目录 `packages/element-pro/src/StepsForm/`，对应 dumi 文档页 `/element-pros/steps-form`。
- 新增 `StepsForm` 容器与 `StepsFormStep`（对外以 `StepsForm.StepForm` 使用）：
  - `StepsForm` 用 `ElSteps` + `ElStep` 渲染步骤条，用 `ElButton` 渲染上一步 / 下一步 / 提交。
  - 每个 `StepForm` 拥有一份独立 `model`，由 `StepsForm` 按 `name` 创建并注入，避免同名 `name` 在不同步骤互相覆盖。
  - `next()` 先校验当前步，通过后才切到下一步；`prev()` 不校验；最后一步 `next()` 触发提交。
  - `onFinish(values)` 收到**合并后**的全部字段，返回 `false` 时不重置。
- `StepsForm` props：`current`、`defaultCurrent`、`allowStepSelect`、`stepsProps`、`formProps`、`submitter`、`readonly`、`disabled`。
- `StepsFormStep` props：`name`、`title`、`description`、`icon`、`initialValues`、`onFinish`，以及 `ProForm` 的表单级配置（`rules`、`labelWidth` 等）。
- `StepsForm` 暴露：`current`、`next`、`prev`、`submit`、`resetFields`、`getAllFieldsValue`、`getFormInstance`。
- 通过既有 `withInstall(main, extra)` 把 `StepsFormStep` 挂到 `StepsForm.StepForm` 并随主组件一起注册。
- `packages/element-pro/src/index.ts` 注册并导出 `StepsForm`、`StepsFormStep` 与全部类型。
- 新增 dumi 文档页 `src/StepsForm/index.md` 与可运行 demo。
- 新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `steps-form`: 分步表单的步骤管理、逐步校验、数据合并与提交行为。

### Modified Capabilities

无。`ProForm`、`ProFormFields`、`ProFormList`、`ProFormDependency` 的行为不变。

## Impact

- Affected specs: `steps-form`（新增能力）
- Affected code:
  - 新增 `packages/element-pro/src/StepsForm/{index.ts,index.md,types.ts,context.ts,utils.ts}`
  - 新增 `packages/element-pro/src/StepsForm/components/StepsFormStep.vue`
  - 新增 `packages/element-pro/src/StepsForm/demo/{basic.vue,vertical.vue,selectable.vue}`
  - 新增 `packages/element-pro/src/StepsForm/styles/index.scss`
  - 修改 `packages/element-pro/src/index.ts`（import、`export *`、具名导出、`components` 注册数组）
  - 新增 `.changeset/steps-form.md`
- 兼容性：纯新增组件，不改动既有组件的 props / 事件 / 样式。
- 依赖：不新增依赖。`ElSteps` / `ElStep` / `ElButton` 均来自既有 `element-plus` peer 依赖。
- 不在本次范围：`stepsFormRender` / `stepFormRender` / `layoutRender` 自定义渲染、`formMapRef`、`Modal` 内嵌分步表单的专用封装。
