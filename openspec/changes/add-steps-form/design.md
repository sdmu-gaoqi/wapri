# Design

## Context

动机见 `proposal.md` - Why。这里记录影响实现的现状。

**`ProForm` 已经承担了单表单容器**：绑定 `model` + `rules`，`readonly` / `disabled` 通过 `provide` 向下继承（`shared/form/context.ts`），`defineExpose` 暴露 `validate` / `resetFields` / `clearValidate` 等（`ProForm/index.vue`）。`StepsForm` 不需要重新实现表单能力，只需要管理「多个 `ProForm` + 步骤切换」。

**`withInstall(main, extra)` 已支持子组件命名空间**（`utils/install.ts`），`StepsForm.StepForm` 与 `ProFormText.Password` 是同一套机制。

**`ElSteps` 没有点击事件**：`StepsProps` 只有 `active`、`direction`、`alignCenter`、`simple` 等展示属性。可点击需要在 `<ElStep>` 上挂 `@click`（属性透传到根节点）。

**`ElSteps` 的 `active` 从 0 开始**，与 `current` 语义一致，不需要换算。

## Goals / Non-Goals

**Goals:**

- 每步独立 `model`，同名 `name` 不跨步覆盖（对齐 pro-components 的「每个子表单都是完整的数据」）。
- 前进前校验当前步，最后一步合并后提交。
- 组件层只做编排，表单能力全部交给既有 `ProForm`。

**Non-Goals:**

- 不实现 `stepsFormRender` / `stepFormRender` / `layoutRender` 这类 React 风格的自定义渲染函数。Vue 侧用插槽表达同样能力。
- 不提供 `formMapRef`。用 `getFormInstance(name)` 与 `getAllFieldsValue()` 替代。
- 不做 Modal 内嵌分步表单的专用封装。业务用 `Modal` + `StepsForm` 组合即可。

## Decisions

### 1. 每步一个独立 `model`，按 `name` 由容器创建

```text
StepsForm
  models: Map<stepName, reactive({})>
      |
      +-- StepForm(name="project")  ->  ProForm :model="models.project"
      +-- StepForm(name="owner")    ->  ProForm :model="models.owner"
```

**为什么不做单一 `model`：** 单一模型下，两步写 `name="remark"` 会互相覆盖，而分步表单里这种情况很常见（不同步骤有各自的备注）。pro-components 同样用独立表单实例。

**代价：** 跨步联动拿不到对方的值。需要时用 `getAllFieldsValue()` 或把值提升到父组件，和 pro-components 的建议一致。

`onFinish` 收到的合并对象按步骤声明顺序展开，后声明的步骤覆盖先声明的同名键。

### 2. 全部步骤挂载，非当前步 `v-show` 隐藏

**为什么不用 `v-if`：** `v-if` 会在切换时销毁表单，已填数据、校验状态、`ElFormItem` 记录的初始值全部丢失，回退到上一步就是空的。

**代价：** 步骤多时一次性挂载全部字段。分步表单的步骤通常在 3–5 个，可以接受。

### 3. 校验只针对当前步骤的 `ProForm`

`next()` 调用当前步骤 `formRef.validate()`，不遍历全部步骤。

**理由：** 用户还没填到后面的步骤，要求「全部步骤一次性校验通过」会让「下一步」永远点不动。pro-components 同样是逐步校验。

### 4. `StepForm` 通过 `provide` / `inject` 注册，而不是读 `slots`

```text
StepsForm (provide stepsFormContext { register, unregister, currentIndex })
    |
    +-- StepForm (inject -> register({ name, title, model, formRef }))
```

**为什么不用解析 `slots.default()`：** 插槽内容可能是 `v-for` 生成的、带条件的，解析 vnode 拿不到稳定的 `name` / `title`，也拿不到子表单实例。

**注册顺序：** `StepForm` 在 `setup` 阶段注册，此时 `index` 由注册顺序决定，与模板书写顺序一致。

### 5. 导航动作放在容器，按钮放在容器底部

`next` / `prev` / `submit` 由 `StepsForm` 实现并同时暴露给 `ref` 与内置按钮，`submitter: false` 时只保留 `ref` 通道。

**理由：** 一套逻辑两个入口，避免「按钮走一套、`ref` 走另一套」的行为漂移。

### 6. 未实现的自定义渲染改用插槽

pro-components 的 `stepFormRender` / `stepsFormRender` 是函数式渲染，Vue 里对应插槽：

- `steps`：替换步骤条区域。
- `submitter`：替换底部按钮。
- 步骤内容本身由 `StepForm` 的默认插槽承担。

## Risks / Trade-offs

**[全部步骤挂载，字段多时首屏成本上升]** → 步骤数通常在 5 以内；文档页注明「步骤很多时考虑拆分页面」。

**[`allowStepSelect` 跳过后可能提交未校验的前序步骤]** → 与 pro-components 行为一致（点击切换不校验）；文档页写明「跳转不校验，提交时只校验当前步」。需要强制逐步校验时不要开启该开关。

**[合并时同名键被覆盖]** → 文档页写明「后声明的步骤覆盖同名键」；需要隔离时用不同的 `name`。

**[`StepForm` 依赖 `inject`，脱离 `StepsForm` 单独使用会拿不到注册上下文]** → 单独使用时给出开发期警告并退化为只渲染 `ProForm`，不抛错。

**[注册顺序依赖 `setup` 执行顺序]** → Vue 保证子组件 `setup` 按模板顺序执行；若业务用动态组件重排步骤，文档页注明不支持。

## Migration Plan

纯新增，无迁移。回滚：删除 `src/StepsForm/`，移除 `src/index.ts` 的注册项与 changeset。
