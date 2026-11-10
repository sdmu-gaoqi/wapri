# add-tab-form

## Why

`element-pro` 已经有 `StepsForm`，但向导式流程要求「上一步填完才能进入下一步」，不适合「一个实体拆多个 tab 同时编辑」的场景：商品编辑页把基础信息、价格库存、配送设置、商品参数拆成 tab，用户可以自由来回切换，提交时才一次性校验全部 tab。

业务现在只能自己拼 `ElTabs` + 多个 `ProForm`，并且要自己解决三件事：把所有表单实例收集起来、提交时逐个校验、出错时把 tab 切到出错的那一个。这套样板每个多 tab 编辑页重写一遍，且容易漏掉「校验全部 tab」而只校验当前页。

本变更交付 `TabForm`：`<TabForm>` 包住若干 `<TabForm.Item>`，共用一份 `model`，提交时校验全部 tab 并自动跳到第一个出错的 tab。

## What Changes

- 新增目录 `packages/element-pro/src/TabForm/`，对应 dumi 文档页 `/element-pros/tab-form`。
- 新增 `TabForm` 容器与 `TabFormItem`（对外以 `TabForm.Item` 使用）：
  - 导航用 `ElTabs` + `ElTabPane`，不设 `lazy`，保证未访问过的 tab 字段也已挂载、可被校验。
  - **所有 tab 共用调用方传入的 `model`**，每个 tab 内是一个独立的 `ProForm`（独立 `ElForm` 实例），因此跨 tab 的 `ProFormDependency` 天然成立，同时校验按 tab 隔离。
  - `submit()` 按声明顺序逐个校验，任一失败就切到第一个出错的 tab 并返回 `false`；全部通过时把 `{ ...model }` 交给 `onFinish`。
  - 提交失败后，出错的 tab 标题上展示红点；下一次提交时重算。
- `TabForm` props：`model`、`active`、`defaultActive`、`tabsProps`、`formProps`、`submitter`、`readonly`、`disabled`、`onFinish`。
- `TabFormItem` props：`name`、`title`、`disabled`，以及 `ProForm` 的表单级配置（`rules`、`labelWidth` 等）。
- `TabForm` 暴露：`active`、`submit`、`resetFields`、`getFormInstance`、`getInvalidTabs`。
- 通过既有 `withInstall(main, extra)` 把 `TabFormItem` 挂到 `TabForm.Item` 并随主组件一起注册。
- `packages/element-pro/src/index.ts` 注册并导出 `TabForm`、`TabFormItem` 与全部类型。
- 新增 dumi 文档页 `src/TabForm/index.md` 与可运行 demo。
- 新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `tab-form`: 多 tab 表单的导航、共享数据模型、全量校验与错误定位行为。

### Modified Capabilities

无。`ProForm`、`ProFormFields`、`ProFormList`、`ProFormDependency`、`StepsForm` 的行为不变。

## Impact

- Affected specs: `tab-form`（新增能力）
- Affected code:
  - 新增 `packages/element-pro/src/TabForm/{index.ts,index.md,types.ts,context.ts,utils.ts}`
  - 新增 `packages/element-pro/src/TabForm/components/TabFormItem.vue`
  - 新增 `packages/element-pro/src/TabForm/demo/{basic.vue,cross-tab.vue,error-jump.vue}`
  - 新增 `packages/element-pro/src/TabForm/styles/index.scss`
  - 新增 `packages/element-pro/tests/tab-form.test.mjs`
  - 修改 `packages/element-pro/src/index.ts`（import、`export *`、具名导出、`components` 注册数组）
  - 新增 `.changeset/tab-form.md`
- 兼容性：纯新增组件，不改动既有组件的 props / 事件 / 样式。
- 依赖：不新增依赖。`ElTabs` / `ElTabPane` / `ElButton` / `ElBadge` 均来自既有 `element-plus` peer 依赖。
- 不在本次范围：`StepsForm` 改为消费同一套注册表；tab 懒加载；tab 内的步骤条嵌套。
