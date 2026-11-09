---
title: ProForm 表单容器
group:
  title: 表单
  order: 3
---

# ProForm 表单容器

表单容器。绑定 `model` 与 `rules` 后，字段组件用 `name` 读写数据，不需要再手写 `ElForm`。

```vue | pure
<ProForm
  :model="model"
  :rules="{ username: [{ required: true, message: '请输入用户名' }] }"
>
  <ProFormText
    name="username"
    label="用户名"
  />
</ProForm>
```

## 基础用法

<code src="./demo/basic.vue" title="基础用法"></code>

## 只读与禁用

`readonly` 与 `disabled` 是表单级开关，字段显式传值时以字段为准。

<code src="./demo/readonly.vue" title="只读与禁用"></code>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `Record<string, unknown>` | 必填 | 表单数据对象，字段组件通过 `name` 读写它。 |
| `rules` | `FormRules` | - | 表单级校验规则，与字段自身 `rules` 合并生效。 |
| `labelWidth` | `string \| number` | - | 标签宽度。 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | - | 标签位置。 |
| `labelSuffix` | `string` | - | 标签后缀。 |
| `inline` | `boolean` | `false` | 是否行内表单。 |
| `disabled` | `boolean` | `false` | 禁用全部字段。 |
| `readonly` | `boolean` | `false` | 只读：所有字段渲染纯文本。 |
| `size` | `'large' \| 'default' \| 'small'` | - | 控件尺寸。 |
| `showMessage` | `boolean` | `true` | 是否展示校验错误信息。 |
| `hideRequiredAsterisk` | `boolean` | `false` | 是否隐藏必填星号。 |
| `requireAsteriskPosition` | `'left' \| 'right'` | `'left'` | 必填星号位置。 |
| `scrollToError` | `boolean` | `false` | 校验失败时是否滚动到第一个错误字段。 |
| `formProps` | `Partial<Omit<FormProps, 'model' \| 'rules'>>` | `{}` | 其余表单属性。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `validate` | `(prop, isValid, message)` | 任一字段校验状态变化时触发。 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ model, readonly, disabled }` | 表单字段。 |

## Ref

通过 `ref<ProFormAction>()` 获取实例（类型从 `@wapri/element-pro` 导入）。

| 方法 | 说明 |
| --- | --- |
| `validate()` | 校验全部字段，失败时 reject 字段错误。 |
| `validateField(props?)` | 校验指定字段。 |
| `resetFields(props?)` | 重置字段到挂载时的初始值并清除校验。 |
| `clearValidate(props?)` | 清除指定字段或全部字段校验。 |
| `scrollToField(prop)` | 滚动到指定字段。 |
| `formRef` | 底层表单实例。 |

## 相关组件

- 弹窗/抽屉容器：[ModalForm](/element-pros/modal-form)、[DrawerForm](/element-pros/drawer-form)
- 字段组件：[ProFormFields](/element-pros/pro-form-fields)
- 联动与数组字段：[ProFormDependency](/element-pros/pro-form-dependency)、[ProFormList](/element-pros/pro-form-list)
