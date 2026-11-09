---
title: ProFormList 数组字段
group:
  title: 表单
  order: 3
---

# ProFormList 数组字段

数组字段容器，承载可增删的重复行。行内字段用**相对名**书写，`formRef.validate()` 与 `resetFields()` 按行独立。

```vue | pure
<ProFormList
  name="items"
  label="明细"
  :initial-value="{ product: 'keyboard', quantity: 1 }"
  :rules="[{ type: 'array', min: 1, message: '至少保留一行' }]"
>
  <ProFormSelect
    name="product"
    label="商品"
    :value-enum="productEnum"
  />
  <ProFormDigit
    name="quantity"
    label="数量"
  />
</ProFormList>
```

`rules` 作用于整个数组，行内字段的校验写在各字段上。

## 基础用法

<code src="./demo/basic.vue" title="基础用法"></code>

## 校验

行内字段的 `rules` 按行独立生效：空值只报对应行，不牵连其他行。

<code src="./demo/validate.vue" title="行内校验"></code>

## 只读

`readonly` 会让行内字段渲染为纯文本，并隐藏增删改操作。

<code src="./demo/readonly.vue" title="只读"></code>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string \| string[]` | 必填 | 数组字段路径。 |
| `label` | `string` | - | 标签文案。 |
| `rules` | `FormItemRule \| FormItemRule[]` | - | 数组级校验规则，例如 `{ type: 'array', min: 1 }`。 |
| `required` | `boolean` | 自动推导 | 强制展示必填星号。 |
| `readonly` | `boolean` | `false` | 行内字段渲染纯文本，并隐藏增删改操作。 |
| `disabled` | `boolean` | `false` | 行内字段禁用，并隐藏增删改操作。 |
| `initialValue` | `Record<string, unknown>` | `{}` | 新增行的初始值，按行深拷贝。 |
| `emptyText` | `string \| false` | `'暂无数据'` | 空态文案；传 `false` 不展示空态。 |
| `addText` | `string` | `'新增'` | 新增按钮文案。 |
| `copyable` | `boolean` | `true` | 是否展示复制按钮。 |
| `movable` | `boolean` | `true` | 是否展示上移/下移按钮。 |
| `removable` | `boolean` | `true` | 是否展示删除按钮。 |
| `max` | `number` | - | 最多行数，达到后新增与复制禁用。 |
| `min` | `number` | - | 最少行数，达到后删除禁用。 |
| `tooltip` | `string` | - | 标签旁的提示文案。 |
| `formItemProps` | `Partial<FormItemProps>` | `{}` | 透传给表单项的属性。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `unknown[]` | 数组内容变化（增删复制移动）时触发。 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ row, index }` | 行内容，放置行内字段组件。 |

## Ref

通过 `ref<ProFormListAction>()` 获取实例（类型从 `@wapri/element-pro` 导入）。

| 方法 | 说明 |
| --- | --- |
| `add()` | 在末尾追加一行。 |
| `remove(index)` | 删除指定行。 |
| `copy(index)` | 复制指定行到其后。 |
| `moveUp(index)` | 上移指定行。 |
| `moveDown(index)` | 下移指定行。 |
| `length()` | 当前行数。 |

## 相关组件

- 表单容器：[ProForm](/element-pros/pro-form)
- 字段组件：[ProFormFields](/element-pros/pro-form-fields)
- 字段联动：[ProFormDependency](/element-pros/pro-form-dependency)
