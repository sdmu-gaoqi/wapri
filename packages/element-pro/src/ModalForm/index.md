---
title: ModalForm
group:
  title: 表单
  order: 3
---

# ModalForm

弹窗表单。通过 `v-model:open` 控制显示，直接绑定业务 `model`，默认插槽放字段组件即可，不需要再包 `ElForm`。

```vue | pure
<ModalForm
  v-model:open="open"
  title="新增记录"
  :model="model"
  :on-finish="save"
>
  <ProFormText
    name="name"
    label="名称"
  />
</ModalForm>
```

## 基础用法

<code src="./demo/basic.vue"></code>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| open | boolean | false | 显示状态，使用 `v-model:open` |
| model | Record<string, unknown> | 必填 | 表单数据对象，字段通过 v-model 直接绑定 |
| title | string | — | 标题，优先于容器配置的 title |
| formProps | Partial<Omit<FormProps, 'model'>> | — | Element Plus Form 属性，包括 rules、labelWidth、disabled 等 |
| modalProps | 容器属性对象 | — | Element Plus 容器配置，排除 modelValue；默认宽度为 520px |
| onFinish | (values) => boolean \| void \| Promise<boolean \| void> | — | 校验成功后执行；返回 false 保持打开，其他正常返回值关闭；抛错触发 finishFailed 并保留输入 |
| submitText | string | 确定 | 提交按钮文字 |
| cancelText | string | 取消 | 取消按钮文字 |
| submitter | boolean | true | 是否显示默认底部按钮 |
| resetOnClose | boolean | false | 关闭动画结束后重置字段，恢复挂载时的初始值 |
| readonly | boolean | false | 只读：所有字段渲染纯文本 |
| labelWidth | string \| number | — | 标签宽度 |

其他属性和容器生命周期事件透传给 Element Plus 容器。`beforeClose` 可通过容器配置传递，仅作用于容器原生关闭交互；底部取消按钮直接触发 cancel 并关闭。提交期间禁止重复提交及用户关闭；父组件仍可主动设置 open。父组件关闭或重新打开后，旧请求的完成结果不会关闭新会话。

校验失败不调用 onFinish，字段错误由表单展示。未配置 onFinish 时，校验成功会触发 finish 并关闭。业务保存请使用 onFinish，异步事件监听器的返回值不会被等待。组件不自动展示请求错误提示，请监听 finishFailed。

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| update:open | boolean | 请求更新显示状态 |
| finish | model | 提交成功 |
| finishFailed | unknown | 提交回调抛错，供业务提示错误 |
| cancel | — | 用户取消关闭 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| default | { model, submitting } | 表单字段 |
| header | Element Plus header 插槽参数 | 自定义标题 |
| footer | { submit, cancel, submitting } | 自定义底部，优先于 submitter |

## Ref

通过 `ref<OverlayFormAction>()` 获取实例（类型从 `@wapri/element-pro` 导入）。

| 方法 | 说明 |
| --- | --- |
| submit(): Promise<boolean> | 校验并提交，成功返回 true，校验失败、业务失败或重复提交返回 false |
| validate() | 校验全部字段；未挂载时返回 undefined |
| resetFields() | 重置字段到挂载时的初始值并清除校验 |
| clearValidate(fields?) | 清除指定字段或全部字段校验 |

`model` 不会因容器 destroyOnClose 自动清空。需要关闭后重置时使用 resetOnClose；需要编辑回填时，在打开前修改 model。
