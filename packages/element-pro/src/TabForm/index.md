---
title: TabForm 多 tab 表单
group:
  title: 表单
  order: 3
---

# TabForm 多 tab 表单

把多个 tab 组织成一个表单：所有 tab 共用一份 `model`，可自由切换，提交时校验全部 tab 并自动跳到第一个出错的 tab。

```vue | pure
<TabForm :model="model" :on-finish="handleFinish">
  <TabForm.Item name="basic" title="基础信息">
    <ProFormText name="productName" label="商品名称" :rules="[{ required: true }]" />
  </TabForm.Item>
  <TabForm.Item name="price" title="价格库存">
    <ProFormDigit name="price" label="销售价" />
  </TabForm.Item>
</TabForm>
```

## 基础用法

<code src="./demo/basic.vue" title="基础用法"></code>

提交时逐个校验全部 tab，任一失败就切到第一个出错的分段，并在该 tab 标题上显示红点。

## 跨 tab 联动

所有 tab 共用同一个 `model`，因此 `ProFormDependency` 可以读到其他 tab 的字段。

<code src="./demo/cross-tab.vue" title="跨 tab 联动"></code>

## 提交错误跳转

第 1 与第 3 个 tab 留空后提交，会跳到第 1 个 tab，两个 tab 标题都带红点。

<code src="./demo/error-jump.vue" title="提交错误跳转"></code>

## TabForm Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `Record<string, unknown>` | 必填 | 全部 tab 共享的数据对象。 |
| `active` | `string \| number` | - | 当前激活的 tab；传 `v-model:active` 可受控。 |
| `defaultActive` | `string \| number` | 第一个分段 | 非受控模式下的初始激活 tab。 |
| `tabsProps` | `Partial<TabsProps>` | `{}` | 透传给 `ElTabs`，如 `type`、`tabPosition`。 |
| `submitter` | `false \| TabFormSubmitter` | `{}` | 底部按钮配置；传 `false` 不渲染内置按钮。 |
| `readonly` | `boolean` | `false` | 全部 tab 只读，分段显式传值时以分段为准。 |
| `disabled` | `boolean` | - | 全部 tab 禁用，分段显式传值时以分段为准。 |
| `formProps` | `Partial<ProFormProps>` | `{}` | 每个分段的表单公共配置。 |
| `onFinish` | `(values) => boolean \| void \| Promise` | - | 全部校验通过后触发，参数是 `model` 的浅拷贝；返回 `false` 时不重置。 |

`submitter` 支持 `submitText`、`resetText`、`showSubmit`、`showReset`。

## TabForm.Item Props

除 `model` 外的属性与 `ProForm` 一致，另外支持：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 必填 | 分段标识，同一 `TabForm` 内唯一，同时作为 `ElTabPane` 的 `name`。 |
| `title` | `string` | - | tab 标题。 |
| `tabDisabled` | `boolean` | `false` | 是否禁止切换到该 tab。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:active` | `active` | 激活 tab 变化时触发，配合 `v-model:active` 使用。 |
| `activeChange` | `active` | 激活 tab 变化时触发。 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ active }` | tab 内容，放 `TabForm.Item`。 |
| `submitter` | `{ loading, submit, reset }` | 替换底部按钮。 |

## Ref

通过 `ref<TabFormAction>()` 获取实例（类型从 `@wapri/element-pro` 导入）。

| 方法 | 说明 |
| --- | --- |
| `submit()` | 校验全部 tab，失败时切到第一个出错的分段并返回 `false`。 |
| `resetFields()` | 重置全部字段并清除错误标记。 |
| `getFormInstance(name?)` | 取指定分段的表单实例，不传时取当前分段。 |
| `getInvalidTabs()` | 最近一次提交校验失败的分段名，不触发新校验。 |

## 注意事项

- 分段 `name` 必须唯一；重复时保留先注册的分段并给出警告。
- 所有 tab 共用一份 `model`，字段名跨 tab 应保持唯一，否则会互相覆盖。
- tab 切换不校验，校验只发生在提交时。
