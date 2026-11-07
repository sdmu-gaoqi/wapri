---
title: ProFormFields 表单项
group:
  title: 表单
  order: 3
---

# ProFormFields 表单项

`ProFormFields` 是**文档页名称，不是组件名**。页面里是一组独立的字段组件：每个组件本质上是一个 `ElFormItem` 加一个 Element Plus 控件，组件自身的 props 属于 `ElFormItem`，控件属性统一走 `fieldProps`。API 语义参考 [pro-components ProFormFields](https://pro-components.antdigital.dev/components/field-set)。

依赖要求：`vue >= 3.3`、`element-plus >= 2.4`（需在使用方项目中引入 Element Plus 及其样式）。

## 前置条件

字段组件通过 `name` 直接读写所属 `ElForm` 的 `model`，因此：

- 必须放在 `ElForm` 内使用。
- `ElForm` 必须绑定 `model`。

```vue | pure
<ElForm :model="model">
  <ProFormText
    name="username"
    label="用户名"
  />
</ElForm>
```

不满足前置条件时，组件仍会渲染标签与控件，但不会读写任何值，也不会抛错。字段的 `name` 同时作为 `ElFormItem` 的 `prop`，所以 `rules`、必填星号与 `formRef.validate()` 都走 Element Plus 原生链路。

`ModalForm` 与 `DrawerForm` 本身就是带 `model` 与提交按钮的 `ElForm`，把字段组件放进它们的默认插槽即可。

## 基础用法

覆盖全部字段组件，其中用户名与密码配置了必填校验。

<code src="./demo/basic.vue" title="基础用法"></code>

## 只读展示

`readonly` 渲染纯文本而不是禁用控件，文本规则与 `ProTable` 单元格一致：枚举显示文本、区间值用 ` ~ ` 连接、空值显示占位符。

<code src="./demo/readonly.vue" title="只读展示"></code>

## 宽度与栅格

`width` 控制字段自身宽度，`colProps` 控制它在 `ElRow` 中占几格；两者互不影响。

<code src="./demo/layout.vue" title="宽度与栅格"></code>

## 组件列表

每个组件对应 `ProTable` 的一个 `valueType`，表格与表单可以共用同一份枚举声明。

| 组件 | valueType | 底层控件 |
| --- | --- | --- |
| `ProFormText` | `text` | `ElInput` |
| `ProFormTextArea` | `textarea` | `ElInput type="textarea"`，默认 `autosize` |
| `ProFormText.Password` / `ProFormPassword` | `password` | `ElInput type="password"`，默认展示密码可见切换 |
| `ProFormDigit` | `digit` | `ElInputNumber` |
| `ProFormMoney` | `money` | `ElInputNumber`，默认 `precision: 2` 并展示 `¥` |
| `ProFormSelect` | `select` | `ElSelect` |
| `ProFormTag` | `tag` | 内置 `TagSelector` |
| `ProFormTreeSelect` | `treeSelect` | `ElTreeSelect`，默认 `check-strictly` |
| `ProFormCascader` | `cascader` | `ElCascader` |
| `ProFormDatePicker` | `date` | `ElDatePicker type="date"` |
| `ProFormDateRangePicker` | `dateRange` | `ElDatePicker type="daterange"` |
| `ProFormDateTimePicker` | `time` | `ElDatePicker type="datetime"` |
| `ProFormDateTimeRangePicker` | `timeRange` | `ElDatePicker type="datetimerange"` |
| `ProFormSwitch` | `switch` | `ElSwitch` |

`time` 与 `timeRange` 表示**日期时间**，与 `ProTable` 中同名 `valueType` 的查询控件一致。没有 `customer` 字段组件：自定义控件直接用 `ElFormItem` 包裹自有组件，与这里的字段组件混用即可。

`ProFormText.Password` 依赖模板作用域里存在 `ProFormText`，所以需要先 `import { ProFormText }`；也可以直接使用独立导出 `ProFormPassword`。

## Props

全部字段组件共享同一组 props。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string \| string[]` | - | 字段路径，对应 `ElForm` 的 `model` 键，同时作为 `ElFormItem` 的 `prop`。支持 `'profile.nickname'` 这样的嵌套路径。 |
| `label` | `string` | - | 标签文案。 |
| `rules` | `FormItemRule \| FormItemRule[]` | - | 校验规则，透传给 `ElFormItem`；与 `ElForm` 的 `:rules` 合并生效。 |
| `required` | `boolean` | 自动推导 | 强制展示必填星号。不传时由 `rules` 中的 `required: true` 自动推导；校验本身始终由 `rules` 决定。 |
| `readonly` | `boolean` | `false` | 只读：渲染纯文本而非禁用控件。 |
| `disabled` | `boolean` | `false` | 禁用控件。`ElForm` 的 `disabled` 依然生效。 |
| `placeholder` | `string` | 按类型推导 | 占位文案。不传时：选择类为「请选择」，日期类为「请选择日期」，日期时间类为「请选择日期时间」，输入类为「请输入{label}」。 |
| `initialValue` | `unknown` | - | 字段初始值：挂载时若 `model` 中该路径为 `undefined` 则写入。 |
| `emptyText` | `string \| false` | `'-'` | 只读态与空值的占位文本；传 `false` 展示空字符串。 |
| `valueEnum` | `ValueEnum` | - | 枚举声明，同时驱动可选项与只读文本；支持 `children` 声明树形层级。 |
| `options` | `ProFormFieldOption[]` | `[]` | 显式选项，**优先于** `valueEnum`；`valueEnum` 仍参与只读文本渲染。 |
| `width` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | - | 控件宽度，预设分别为 `104` / `216` / `328` / `440` / `552` 像素。 |
| `colProps` | `ColProps` | `{}` | 透传给外层 `ElCol`；未传时字段占满一行（`span` 24）。 |
| `tooltip` | `string` | - | 标签旁的提示文案，悬浮展示。 |
| `fieldProps` | `Record<string, unknown>` | `{}` | 透传给底层控件的属性，**优先级高于**组件上的同名 props。 |
| `formItemProps` | `Partial<FormItemProps>` | `{}` | 透传给 `ElFormItem` 的属性。 |

## 透传优先级

同一属性可能在多处声明，最终取值顺序为：

```text
组件基础属性（placeholder / disabled / width 等） < fieldProps 中的同名属性
```

例如 `fieldProps.placeholder` 会覆盖组件上的 `placeholder`；`fieldProps.multiple`、`fieldProps.precision`、`fieldProps.valueFormat` 等控件专属属性同理。

`options` 与 `valueEnum` 同时存在时，**下拉项来自 `options`**，`valueEnum` 只用于只读文本与枚举命中。

## 类型

```ts
type ProFormFieldWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

interface ProFormFieldOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: ProFormFieldOption[]
}

type ProFormFieldValueType = Exclude<ValueType, 'customer'>
```

`ValueEnum`、`ValueEnumItem`、`ValueType` 来自 `@wapri/element-pro` 的共享字段类型，与 `ProTable` 完全一致。

## 相关组件

- 表单容器：[ModalForm](/element-pros/modal-form)、[DrawerForm](/element-pros/drawer-form)
- 数据展示：[ProTable](/element-pros/pro-table)
- 字段级组件：[TagSelector](/element-pros/tag-selector)、[DateQuickSelect](/element-pros/date-quick-select)、[CheckCard](/element-pros/check-card)
