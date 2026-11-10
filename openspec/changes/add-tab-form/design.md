# Design

## Context

动机见 `proposal.md` - Why。这里记录影响实现的现状。

**`StepsForm` 已经验证了「多表单注册表」这套结构**（`StepsForm/context.ts` 的 `registerStep` + `getForm` getter + `isActive`），但它的模型语义是「每步独立 `model`、提交时合并」，与 `TabForm` 的「共享 `model`」相反，因此不复用其上下文，只复用结构思路。

**`ProForm` 已经是完整表单容器**：绑定 `model` + `rules`，`readonly` / `disabled` 通过 `provide` 向下继承，`defineExpose` 暴露 `validate` / `resetFields` / `clearValidate`（`ProForm/index.vue`）。`TabForm` 不重新实现表单能力。

**`ElTabPane` 的 `lazy` 默认 `false`**（`element-plus` 的 `tab-pane.d.ts`）。`ProTable` 的 tabs 显式传了 `lazy`，但那是筛选条件场景。`TabForm` 必须保持默认，否则未访问过的 tab 字段不挂载，`validate()` 会漏。

**`ElTabs` 的 `v-model` 是 `modelValue`**，事件为 `tab-change` / `tab-click`。`ElTabPane` 的 `name` 支持 `string | number`。

**`withInstall(main, extra)` 已支持子组件命名空间**（`utils/install.ts`），`TabForm.Item` 与 `StepsForm.StepForm` 是同一套机制。

## Goals / Non-Goals

**Goals:**

- 所有 tab 共用一份 `model`，跨 tab 的 `ProFormDependency` 直接成立。
- 提交时校验全部 tab，失败自动跳到第一个出错的 tab。
- 组件层只做编排，表单能力全部交给既有 `ProForm`。

**Non-Goals:**

- 不改造 `StepsForm` 去消费同一套注册表。两者模型语义不同，强行抽象会把「合并」和「共享」两种语义塞进一个容器。
- 不做 tab 懒加载。懒加载与「校验全部 tab」直接冲突。
- 不提供 tab 内的步骤条嵌套。

## Decisions

### 1. 共享 `model`，每个 tab 一个独立 `ProForm`

```text
TabForm  :model="model"（调用方持有）
   |
   +-- TabForm.Item(name="basic")  ->  ProForm :model="model"
   +-- TabForm.Item(name="price")  ->  ProForm :model="model"
   +-- TabForm.Item(name="ship")   ->  ProForm :model="model"
```

**为什么共享：** 商品/订单这类多 tab 编辑页，字段之间天然跨 tab 关联（商品类型影响配送设置与价格字段）。共享 `model` 让 `ProFormDependency` 直接读到别的 tab 的值，不需要把状态提升到父组件再传下来。

**为什么每 tab 一个 `ProForm`：** 一个 `ElForm` 套全部 tab 时，`validate()` 一次全过，但 `ValidateFieldsError` 只给字段名，拿不到「字段属于哪个 tab」。每 tab 一个 `ElForm` 后，哪个 form reject，哪个 tab 就是错的，错误定位不需要额外映射表。

**代价：** 同名 `name` 在不同 tab 会互相覆盖。文档写明「分段内字段名应唯一」。

### 2. 提交时按声明顺序串行校验，遇到第一个失败就停

```text
submit()
  for tab in tabs (声明顺序):
      ok = await tab.getForm().validate()
      if !ok: active = tab; return false
  onFinish({ ...model })
```

**为什么串行而非 `Promise.all`：** 需要「第一个出错的 tab」，串行天然有序；并行还要额外排序。tab 数量通常在 10 以内，串行开销可忽略。

**为什么失败就停：** 用户只需要知道「先去哪一页改」，一次报全部错误反而噪音大。其余 tab 的错误标记在下一轮提交时重算。

### 3. 错误标记用 `ElBadge` 挂在 tab 标题上

`ElTabPane` 的 `label` 插槽可以放任意内容，用 `ElBadge is-dot` 表达「这一页有问题」。

**为什么不用红色文字：** 红点不改变标题宽度，tab 切换时不会抖动。

**为什么不用 `ElMessage`：** 提交失败时已经跳到出错 tab 并展示字段级错误，再弹一条消息是重复信息。

### 4. 注册表用 `provide` / `inject`，不解析 `slots`

与 `StepsForm` 同因：插槽内容可能是 `v-for` 或带条件的，解析 vnode 拿不到稳定的 `name` / `title`，也拿不到子表单实例。

### 5. 提交值传浅拷贝

`onFinish({ ...model })`。

**理由：** 业务在回调里改对象不应该影响表单内部状态；浅拷贝足够，因为字段值本身是原始类型或业务自己管理的引用。

### 6. 受控与非受控都支持

`active` 传入时受控，内部跳转（提交失败）通过 `update:active` 通知外部；未传时用内部 `defaultActive`。

**理由：** 与 `StepsForm` 的 `current` 保持一致的手感，业务想同步到 URL 或外部状态时不需要额外适配。

## Risks / Trade-offs

**[同名 `name` 跨 tab 覆盖]** → 文档写明「分段内字段名应唯一」；这是共享模型的固有代价，换来的是跨 tab 联动成立。

**[全部 tab 一次性挂载，字段多时首屏成本上升]** → 与「校验全部 tab」是同一个取舍，无法两全。文档注明「tab 很多且字段很重时考虑拆分页面」。

**[串行校验在 tab 很多时变慢]** → tab 数量通常在 10 以内，每个 `ElForm.validate()` 是同步遍历字段，开销可忽略。

**[`TabForm.Item` 脱离 `TabForm` 单独使用拿不到注册上下文]** → 给出警告并退化为只渲染 `ProForm`，不抛错。

**[错误标记只在提交时重算，用户手动改完字段后红点仍在]** → 与「提交时校验」的语义一致；需要实时清除时业务可调 `getInvalidTabs()` 后自行处理，或调用 `resetFields()`。

## Migration Plan

纯新增，无迁移。回滚：删除 `src/TabForm/`，移除 `src/index.ts` 的注册项与 changeset。
