---
title: ProFormFields 表单项
group:
  title: 表单
  order: 3
---

# ProFormFields 表单项

`ProFormFields` 是**文档页名称，不是组件名**。页面里是一组独立的字段组件，每个组件对应一种输入控件，控件属性统一走 `fieldProps`。

依赖要求：`vue >= 3.3`、`element-plus >= 2.4`（需在使用方项目中引入 Element Plus 及其样式）。

## 前置条件

字段组件通过 `name` 读写所属表单的 `model`，因此必须放在表单容器内，且容器必须绑定 `model`。推荐直接用 `ProForm`：

```vue | pure
<ProForm :model="model">
  <ProFormText
    name="username"
    label="用户名"
  />
</ProForm>
```

也可以直接用 `ElForm`，或放进 `ModalForm` / `DrawerForm` 的默认插槽。

不满足前置条件时，组件仍会渲染标签与控件，但不会读写任何值，也不会抛错。`rules`、必填星号与 `formRef.validate()` 都走 Element Plus 原生校验。

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

除字段组件外，还有三个容器组件，各自有独立文档页：

| 组件 | 作用 |
| --- | --- |
| `ProForm` | 表单容器，绑定 `model` / `rules`，向下传递 `readonly` |
| `ProFormList` | 数组字段容器，行内字段用相对名，自动拼行下标 |
| `ProFormDependency` | 按 `names` 订阅字段值，作用域插槽传出 |

`time` 与 `timeRange` 表示**日期时间**，与 `ProTable` 中同名 `valueType` 的查询控件一致。没有 `customer` 字段组件：自定义控件直接用 `ElFormItem` 包裹自有组件，与这里的字段组件混用即可。

`ProFormText.Password` 依赖模板作用域里存在 `ProFormText`，所以需要先 `import { ProFormText }`；也可以直接使用独立导出 `ProFormPassword`。

## Props

全部字段组件共享同一组 props。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string \| string[]` | - | 字段路径，对应 `model` 的键。支持 `'profile.nickname'` 这样的嵌套路径；在 `ProFormList` 行内时是相对当前行的路径。 |
| `label` | `string` | - | 标签文案。 |
| `rules` | `FormItemRule \| FormItemRule[]` | - | 校验规则，与表单级 `rules` 合并生效。 |
| `required` | `boolean` | 自动推导 | 强制展示必填星号。不传时由 `rules` 中的 `required: true` 自动推导；校验本身始终由 `rules` 决定。 |
| `readonly` | `boolean` | `false` | 只读：渲染纯文本而非禁用控件。 |
| `disabled` | `boolean` | `false` | 禁用控件。表单级 `disabled` 依然生效。 |
| `placeholder` | `string` | 按类型推导 | 占位文案。不传时：选择类为「请选择」，日期类为「请选择日期」，日期时间类为「请选择日期时间」，输入类为「请输入{label}」。 |
| `initialValue` | `unknown` | - | 字段初始值：挂载时若 `model` 中该路径为 `undefined` 则写入。 |
| `emptyText` | `string \| false` | `'-'` | 只读态与空值的占位文本；传 `false` 展示空字符串。 |
| `valueEnum` | `ValueEnum` | - | 枚举声明，同时驱动可选项与只读文本；支持 `children` 声明树形层级。 |
| `options` | `ProFormFieldOption[]` | `[]` | 显式选项，**优先于** `valueEnum`；`valueEnum` 仍参与只读文本渲染。 |
| `width` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | - | 控件宽度，预设分别为 `104` / `216` / `328` / `440` / `552` 像素。 |
| `colProps` | `ColProps` | `{}` | 栅格占位，透传给外层 `ElCol`；未传时字段占满一行（`span` 24）。 |
| `tooltip` | `string` | - | 标签旁的提示文案，悬浮展示。 |
| `fieldProps` | `Record<string, unknown>` | `{}` | 透传给底层控件的属性，**优先级高于**组件上的同名 props。 |
| `formItemProps` | `Partial<FormItemProps>` | `{}` | 透传给表单项的属性。 |

## 透传优先级

同一属性可能在多处声明，`fieldProps` 中的同名属性优先。例如 `fieldProps.placeholder` 会覆盖组件上的 `placeholder`；`fieldProps.multiple`、`fieldProps.precision`、`fieldProps.valueFormat` 等控件专属属性同理。

`options` 与 `valueEnum` 同时存在时，**下拉项来自 `options`**，`valueEnum` 只用于只读文本与枚举命中。

## 类型

```ts
type ProFormFieldWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

type ProFormFieldName = string | string[]

interface ProFormFieldOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: ProFormFieldOption[]
}

type ProFormFieldValueType = Exclude<ValueType, 'customer'>
```

`ValueEnum`、`ValueEnumItem`、`ValueType` 与 `ProTable` 共用同一套类型。

## 相关组件

- 表单容器：[ProForm](/element-pros/pro-form)、[ModalForm](/element-pros/modal-form)、[DrawerForm](/element-pros/drawer-form)
- 联动与数组字段：[ProFormDependency](/element-pros/pro-form-dependency)、[ProFormList](/element-pros/pro-form-list)
- 数据展示：[ProTable](/element-pros/pro-table)
- 字段级组件：[TagSelector](/element-pros/tag-selector)、[DateQuickSelect](/element-pros/date-quick-select)、[CheckCard](/element-pros/check-card)
