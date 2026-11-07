# Design

## Context

动机见 `proposal.md` - Why。这里只记录影响实现方式的现状与约束。

**Vue 没有 `cloneElement`。** pro-components 的字段组件能写成 `<ProFormText name="x" />`，靠 React 的 `cloneElement` 把 `value` / `onChange` 注入子控件。Vue 没有等价机制，字段组件必须自己决定值从哪来。

**`ElFormItem` 只读值、不注入值。** 已核对 `element-plus` 源码（`es/components/form/src/form-item.vue_vue_type_script_setup_true_lang.mjs`）：`fieldValue` 是 `getProp(formContext.model, props.prop).value`，只用于校验与 `resetField`，不会传给子节点。所以「值在哪」必须由字段组件自己解析。

**`useFormItem()` 是可用的公开出口。** `element-plus` 根导出 `useFormItem`、`formContextKey`、`formItemContextKey`、`FormContext`、`FormItemContext`。仓库内 `CheckCard/index.vue:22` 已经在用 `useFormItem()` 并调 `formItem?.validate('change')`，这条路有先例。

**`ElForm.model` 是 `Record<string, any>`。** 类型上宽松，但仓库禁止 `any`，字段组件内部需要收窄到 `Record<string, unknown>` 再读写。

**`withInstall(main, extra)` 已支持子组件命名空间。** `src/utils/install.ts` 会把 `extra` 里的组件一并注册并挂到主组件上（注释即 `ElButton.ButtonGroup`），`ProFormText.Password` 不需要新机制。

**字段级逻辑目前住在 `ProTable` 里。** `ValueType`、`ValueEnum`、`ValueEnumItem` 在 `ProTable/types.ts`；`getValueEnumOptions`、`toTreeOptions`、`findEnumPath`、`formatCellValue` 在 `ProTable/utils.ts`。这些与表格无关，但 `ProTableSearchForm.vue` 有 15 个 `valueType` 分支依赖它们。

**`ProTable` 查询区没有校验链路。** `ProTableSearchForm.vue` 的 `ElForm` 没有 `:model`、`ElFormItem` 没有 `:prop`，值走内部 `values` reactive。这是既有事实，本次不改。

## Goals / Non-Goals

**Goals:**

- 字段组件在 `ElForm` 内可直接使用 `rules`、`required`、`formRef.validate()`，不需要业务自己写 `ElFormItem`。
- 字段组件与 `ProTable` 共用同一份 `valueEnum` 解析与只读格式化实现，避免两套漂移。
- 新增组件不改变 `ProTable` 的任何对外行为与导出面。

**Non-Goals:**

- 不改造 `ProTableSearchForm.vue` 去消费字段组件。它现在没有 `model` / `prop`，改造需要先重构查询区的值管理，属于独立变更。
- 不实现 `request` 远程选项、`dependencies` 联动、`ProFormDependency`、`ProFormList`、`ProFormFieldSet`、`ProFormCaptcha`。
- 不提供 `ProForm` 容器组件。`ElForm` 本身就是容器，`ModalForm` / `DrawerForm` 已提供带 submitter 的容器。
- 不支持 `v-model` 独立使用模式（见 Decisions 第 1 条）。

## Decisions

### 1. 值绑定走 `name` + `ElForm.model`，不做 `v-model` 双模

字段组件用 `useFormItem()` 取 `form.model` 与 `formItem.propString`，用 `get` / `set` 读写同一路径。

```text
<ElForm :model="model">
  <ProFormText name="username" :rules="..." />
       |
       +-- ElFormItem prop="username"        <- label / 星号 / 错误信息 / 校验
             |
             +-- ProFormField
                   useFormItem() -> form.model, formItem.propString
                   get(model, 'username') / set(model, 'username', v)
```

**为什么不用 `v-model`：** `ElFormItem` 的校验依赖 `prop` + `form.model`。若字段组件走 `v-model`，`ElFormItem` 拿不到 `prop`，`rules` 与 `formRef.validate()` 全部失效——那 `Pro` 前缀就只剩一个 label 包装，与直接写 `ElInput` 没有区别。

**为什么不做双模（有 form context 走 `name`，没有走 `v-model`）：** 同一个组件两种值语义，是这类组件最容易出 bug 的形态；且 `ModalForm` / `DrawerForm` 已经是 `ElForm + :model + submitter` 的完整宿主，`name` 模式在仓库内立刻可用，没有必须支持独立使用的场景。

**代价：** 字段组件必须在 `ElForm` 内、`ElForm` 必须传 `model`。缺上下文时降级为「渲染控件但不读写值」，不抛错。

### 2. `ProFormField` 作为内部分发内核，不对外导出

14 个字段组件都是 `ElFormItem + ProFormField` 的薄壳，`ProFormField` 承担 `valueType` → 控件的分发。

**为什么保留内核：** 14 个组件若各自实现 `readonly` 文本渲染、`placeholder` 推导、`valueEnum` 解析，会产生 14 份重复逻辑。内核让这些只写一次。

**为什么不对外导出：** 与 pro-components 把 `ProField` 标为「内部组件，请勿直接使用」一致。对外暴露 `ProFormField` 会让 `valueType` 成为公开 API 的一部分，锁死后续演进。自定义控件走 `ElFormItem` + 自有控件，不需要内核。

### 3. 字段级共享能力上移到 `src/shared/field/`，`ProTable` 改为 re-export

```text
src/shared/field/types.ts   ValueType, ValueEnum, ValueEnumItem, DataIndex, Key
src/shared/field/utils.ts   getValueEnumOptions, toTreeOptions, findEnumPath, formatCellValue
        ^                                    ^
        |                                    |
   ProFormFields                        ProTable
   （直接 import）                    （types.ts / utils.ts re-export）
```

**为什么上移：** 若 `ProFormFields` 直接 import `../ProTable/utils`，依赖方向变成「表单 → 表格」，而 `ProTable` 的查询区将来若消费字段组件，就成环。上移是唯一能同时满足「共用一份实现」和「依赖方向正确」的方案。

**为什么用 re-export 而不是改 import 路径：** `ProTable/types.ts` 与 `ProTable/utils.ts` 的导出被 `src/index.ts` 的 `export * from './ProTable'` 透出，业务可能已从包根导入 `ValueType`。re-export 保证导出面零变化。

**替代方案（已否决）：** 在 `ProFormFields` 内复制一份枚举解析——两份实现必然漂移，且 `formatCellValue` 的区间拼接、深层枚举路径拼接规则不简单，复制成本高于上移。

### 4. `readonly` 复用 `formatCellValue`，不另写格式化

`readonly` 时字段组件渲染 `<span>` 而非禁用控件，文本由 `formatCellValue(value, emptyText, valueEnum)` 生成。

**为什么复用：** 同一个 `valueEnum` 在表单只读态与表格单元格必须展示一致文本，否则业务会看到同一数据两种写法。`formatCellValue` 已覆盖空值占位、枚举深层路径（` / ` 拼接）、区间值（` ~ ` 拼接）、布尔值（`是`/`否`）。

**代价：** `formatCellValue` 的默认占位是 `-`，字段组件通过 `emptyText` 覆盖，默认值保持一致。

### 5. `width` 用固定像素映射，不做响应式

`xs` / `sm` / `md` / `lg` / `xl` 分别映射 `104` / `216` / `328` / `440` / `552` 像素，与 pro-components 一致。

**为什么不做响应式：** 响应式宽度需要 `ResizeObserver` 或容器查询，成本与收益不匹配；栅格布局已由 `colProps` + `ElRow` 承担，`width` 只解决「字段本身多宽」。

### 6. 目录结构：一个目录 = 一个文档页

`atomDirs` 按 `packages/element-pro/src` 下的目录建页。14 个字段各占一个目录会让文档站出现 14 个页面，与 pro-components 把全部字段收在一页的做法相反。

```text
src/ProFormFields/
+-- index.md            文档页（标题 "ProFormFields 表单项"）
+-- index.ts            统一导出 + withInstall
+-- types.ts            公开类型
+-- utils.ts            width 映射、placeholder 推导等
+-- components/
|   +-- ProFormField.vue          内部内核
|   +-- ProFormText.vue
|   +-- ProFormTextArea.vue
|   +-- ProFormSelect.vue
|   +-- ... 共 14 个
+-- demo/
+-- styles/index.scss
```

## Risks / Trade-offs

**[字段组件必须在 `ElForm` 内，误用时不报错]** → 缺上下文时降级为「渲染控件、不读写值」，并在文档页显式说明前置条件；`ProFormField` 内部对 `form.model` 缺失走 `undefined` 分支，不抛错。

**[`ElForm.model` 类型是 `Record<string, any>`，与仓库禁 `any` 冲突]** → 在 `ProFormField` 内一次性收窄为 `Record<string, unknown>`，对外类型不暴露 `any`；读写用 `get` / `set` 路径函数，避免逐层断言。

**[`ProTable` 的 re-export 若漏项，会破坏既有导入]** → `ProTable/types.ts` 与 `ProTable/utils.ts` 保留全部原导出名，仅把定义体替换为 `export * from '../shared/field/...'` 加显式 `export type`；实施后用 `pnpm build` 验证 `dist/index.d.ts` 仍包含这些名字。

**[`formatCellValue` 的默认占位 `-` 可能与表单场景不符]** → 字段组件通过 `emptyText` 覆盖，默认值与表格保持一致，业务可改。

**[14 个组件 × 每个都要维护 props 表与文档]** → 文档页用一张总表 + 分组示例，不为每个组件单开章节；props 表只列字段组件特有的，控件属性统一指向 `fieldProps`。

**[`ProFormText.Password` 依赖 `withInstall` 的 extra 机制]** → 该机制已有 `ElButton.ButtonGroup` 的注释先例，且 `withInstall` 实现已支持；实施时补一条断言验证 `ProFormText.Password` 可被 `app.use` 注册。

**[`money` 与 `digit` 的默认行为差异]** → `ProFormMoney` 默认 `precision: 2`，`ProFormDigit` 不设默认精度；两者都允许通过 `fieldProps` 覆盖，文档页写明默认值。

## Migration Plan

纯新增，无迁移。既有业务代码不受影响：`ProTable` 的公开类型与函数签名不变，re-export 保证导入路径继续可用。

回滚：删除 `src/ProFormFields/` 与 `src/shared/field/`，把 `ProTable/types.ts` 与 `ProTable/utils.ts` 的定义体还原，移除 `src/index.ts` 的注册项与 changeset。
