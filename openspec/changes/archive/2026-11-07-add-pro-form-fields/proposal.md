# add-pro-form-fields

## Why

`element-pro` 目前只有 `ModalForm` / `DrawerForm` 两个表单容器，容器里放什么完全由业务自己写：每个字段都要手写 `ElFormItem` + `ElInput` + `:model` 绑定 + `rules`，一个中等表单重复几十次。仓库里已经有 `TagSelector`、`DateQuickSelect`、`CheckCard`、`CropperUpload` 这些字段级组件，但它们是散件，没有统一的 `label` / `rules` / `readonly` / `valueEnum` 约定。

同时 `ProTable` 的查询区（`ProTableSearchForm.vue`）内部已经实现了一套完整的「`valueType` → 控件」分发，却因为埋在表格组件里而无法被表单复用。业务写表单时只能重新实现一遍同样的分支。

本变更交付 `ProFormFields` 字段组件集：一组 `ElFormItem + 控件` 的组合组件，`props` 是 `ElFormItem` 的、`fieldProps` 是控件的，值通过 `name` 直接读写 `ElForm` 的 `model`。命名与 API 语义参考 [pro-components ProFormFields](https://pro-components.antdigital.dev/components/field-set)。

## What Changes

- 新增目录 `packages/element-pro/src/ProFormFields/`，对应 dumi 文档页 `/element-pros/pro-form-fields`。`ProFormFields` 是**文档页名称**，不是组件名；页面内是一组独立组件。
- 新增 15 个字段组件，与 `ProTable` 既有的 `ValueType` 一一对应，不引入第二套词汇：

  | valueType | 组件 | 底层控件 |
  | --- | --- | --- |
  | `text` | `ProFormText` | `ElInput` |
  | `textarea` | `ProFormTextArea` | `ElInput type="textarea"` |
  | `password` | `ProFormText.Password` | `ElInput type="password"` |
  | `digit` | `ProFormDigit` | `ElInputNumber` |
  | `money` | `ProFormMoney` | `ElInputNumber`（默认 `precision: 2`） |
  | `select` | `ProFormSelect` | `ElSelect` |
  | `tag` | `ProFormTag` | 仓库既有 `TagSelector` |
  | `treeSelect` | `ProFormTreeSelect` | `ElTreeSelect` |
  | `cascader` | `ProFormCascader` | `ElCascader` |
  | `date` | `ProFormDatePicker` | `ElDatePicker type="date"` |
  | `dateRange` | `ProFormDateRangePicker` | `ElDatePicker type="daterange"` |
  | `time` | `ProFormDateTimePicker` | `ElDatePicker type="datetime"` |
  | `timeRange` | `ProFormDateTimeRangePicker` | `ElDatePicker type="datetimerange"` |
  | `switch` | `ProFormSwitch` | `ElSwitch` |

  `customer` 不提供组件：自定义控件按 pro-components 的建议，直接用 `ElFormItem` 包裹自有控件与 Pro 字段混用。

- **值绑定采用 `name` 读 `ElForm.model`**：字段组件通过 `useFormItem()` 拿到 `form.model` 与 `formItem.propString`，读写同一个 `reactive` 对象。因此字段组件必须在 `ElForm` 内使用，`ElForm` 必须传 `model`。`name` 同时作为 `ElFormItem` 的 `prop`，`rules` / `required` / 必填星号 / `formRef.validate()` 全部由 Element Plus 原生链路承担。
- 统一 props：`name`、`label`、`rules`、`required`、`readonly`、`disabled`、`placeholder`、`initialValue`、`valueEnum`、`options`、`width`、`colProps`、`tooltip`、`fieldProps`、`formItemProps`。
- `readonly` 渲染为纯文本，复用 `formatCellValue` 的枚举/区间/空值格式化规则，与 `ProTable` 单元格展示保持一致。
- `ProFormText.Password` 通过既有 `withInstall(main, extra)` 挂载子组件，不新增注册机制。
- 把字段级共享能力从 `ProTable` 上移到 `src/shared/field/`：`ValueType`、`ValueEnum`、`ValueEnumItem`、`getValueEnumOptions`、`toTreeOptions`、`findEnumPath`、`formatCellValue`。`ProTable/types.ts` 与 `ProTable/utils.ts` 改为 re-export，导出面保持不变。
- `packages/element-pro/src/index.ts` 注册并导出全部字段组件与类型。
- 新增 dumi 文档页 `src/ProFormFields/index.md` 与可运行 demo。
- 新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `pro-form-fields`: 表单字段组件集的值绑定、校验、只读渲染、枚举选项生成与布局约定。

### Modified Capabilities

无。`ProTable` 的对外行为不变，仅把字段级工具函数改为从 `shared/field` re-export。

## Impact

- Affected specs: `pro-form-fields`（新增能力）
- Affected code:
  - 新增 `packages/element-pro/src/ProFormFields/{index.ts,index.md,types.ts,utils.ts}`
  - 新增 `packages/element-pro/src/ProFormFields/components/ProFormField.vue`（内部分发内核，不对外导出）
  - 新增 `packages/element-pro/src/ProFormFields/components/` 下 14 个字段组件
  - 新增 `packages/element-pro/src/ProFormFields/demo/{basic.vue,readonly.vue,layout.vue}`
  - 新增 `packages/element-pro/src/ProFormFields/styles/index.scss`
  - 新增 `packages/element-pro/src/shared/field/{types.ts,utils.ts}`
  - 修改 `packages/element-pro/src/ProTable/types.ts`（`ValueType` / `ValueEnum` / `ValueEnumItem` 改为 re-export）
  - 修改 `packages/element-pro/src/ProTable/utils.ts`（`getValueEnumOptions` / `toTreeOptions` / `findEnumPath` / `formatCellValue` 改为 re-export）
  - 修改 `packages/element-pro/src/index.ts`（import、`export *`、具名导出、`components` 注册数组）
  - 新增 `.changeset/pro-form-fields.md`
- 兼容性：纯新增组件。`ProTable` 的 `ProColumn`、`ValueType`、`ValueEnum` 等公开类型与函数签名不变，re-export 保证既有 import 路径继续可用。
- 依赖：不新增依赖。`ElForm` / `ElFormItem` / `useFormItem` 均来自既有 `element-plus` peer 依赖。
- 不在本次范围：`ProTable` 查询区改为消费 `ProFormFields`（另开 change）；`request` 远程选项、`dependencies` 联动、`ProFormDependency`、`ProFormList`、`ProFormFieldSet`、`ProFormCaptcha`。
