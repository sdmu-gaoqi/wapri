---
title: StepsForm 分步表单
group:
  title: 表单
  order: 3
---

# StepsForm 分步表单

把多个独立表单组织成向导：每一步单独校验，最后一步把所有步骤的字段合并后提交。

```vue | pure
<StepsForm :on-finish="handleFinish">
  <StepsForm.StepForm name="project" title="项目信息">
    <ProFormText name="projectName" label="项目名称" :rules="[{ required: true }]" />
  </StepsForm.StepForm>
  <StepsForm.StepForm name="owner" title="负责人">
    <ProFormText name="ownerName" label="负责人" />
  </StepsForm.StepForm>
</StepsForm>
```

## 基础用法

<code src="./demo/basic.vue" title="基础用法"></code>

点「下一步」会先校验当前步骤，未通过时停在原步骤；最后一步点「提交」时 `onFinish` 收到合并后的值。

## 纵向步骤

通过 `stepsProps` 透传给 `ElSteps`。

<code src="./demo/vertical.vue" title="纵向步骤"></code>

## 点击步骤切换

`allow-step-select` 打开后可直接点步骤条跳转，跳转时不校验。

<code src="./demo/selectable.vue" title="点击步骤切换"></code>

## StepsForm Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | `number` | - | 当前步骤，从 `0` 开始；传 `v-model:current` 可受控。 |
| `defaultCurrent` | `number` | `0` | 非受控模式下的初始步骤。 |
| `allowStepSelect` | `boolean` | `false` | 是否允许点击步骤条切换，切换时不校验。 |
| `stepsProps` | `Partial<StepsProps>` | `{}` | 透传给 `ElSteps`，如 `direction`、`simple`、`alignCenter`。 |
| `submitter` | `false \| StepsFormSubmitter` | `{}` | 底部按钮配置；传 `false` 不渲染内置按钮。 |
| `readonly` | `boolean` | `false` | 全部步骤只读，步骤显式传值时以步骤为准。 |
| `disabled` | `boolean` | - | 全部步骤禁用，步骤显式传值时以步骤为准。 |
| `formProps` | `Partial<ProFormProps>` | `{}` | 每个步骤的表单公共配置。 |
| `onFinish` | `(values) => boolean \| void \| Promise` | - | 最后一步提交成功时触发，返回 `false` 时不重置、不回到第一步。 |

`submitter` 支持 `previousText`、`nextText`、`submitText`、`showPrevious`、`showNext`、`showSubmit`。

## StepForm Props

除 `model` 外的属性与 `ProForm` 一致，另外支持：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 必填 | 步骤标识，同一 `StepsForm` 内唯一。 |
| `title` | `string` | - | 步骤条标题。 |
| `description` | `string` | - | 步骤条描述。 |
| `icon` | `Component` | - | 步骤条图标。 |
| `initialValues` | `Record<string, unknown>` | - | 本步骤初始值，只填充尚未有值的键。 |
| `onFinish` | `(values) => boolean \| void \| Promise` | - | 本步骤完成时触发，返回 `false` 阻止进入下一步。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:current` | `current` | 当前步骤变化时触发，配合 `v-model:current` 使用。 |
| `currentChange` | `current` | 当前步骤变化时触发。 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ current }` | 步骤内容，放 `StepsForm.StepForm`。 |
| `steps` | `{ current, steps, select }` | 替换步骤条区域。 |
| `submitter` | `{ current, loading, previous, next, submit }` | 替换底部按钮。 |

## Ref

通过 `ref<StepsFormAction>()` 获取实例（类型从 `@wapri/element-pro` 导入）。

| 方法 | 说明 |
| --- | --- |
| `next()` | 前进到下一步，校验失败返回 `false`；最后一步等价于 `submit()`。 |
| `prev()` | 返回上一步，不校验。 |
| `submit()` | 校验当前步骤并提交，`onFinish` 返回 `false` 时返回 `false`。 |
| `resetFields()` | 重置全部步骤并回到第一步。 |
| `getAllFieldsValue()` | 合并各步骤字段值，不触发校验。 |
| `getFormInstance(name?)` | 取指定步骤的表单实例，不传时取当前步骤。 |

## 注意事项

- `name` 必须唯一；重复时保留先注册的步骤并给出警告。
- 每个步骤有独立的 `model`，同名 `name` 在不同步骤互不影响。
- 合并时后声明的步骤覆盖同名键；需要隔离时用不同的 `name`。
- 点击步骤条切换（`allowStepSelect`）不校验，提交时只校验当前步骤。
