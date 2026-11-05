---
title: TagSelector 标签选择器
group:
  title: 表单
  order: 3
---

# TagSelector 标签选择器

用于从一组枚举值中进行单选或多选。适合状态、分类等轻量筛选；`ProTable` 的 `valueType: 'tag'` 搜索项也使用此组件。

## 基础用法

<code src="./demo/basic.vue"></code>

点击“全部”会清空选择：单选时写入 `undefined`，多选时写入 `[]`。再次点击已选中项同样会取消选择——单选回落到“全部”，多选则从结果中移除该项。禁用项不允许选中。

## 使用

从 `@wapri/element-pro` 导入 `TagSelector`，可单独执行 `app.use(TagSelector)` 注册。

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { TagSelector } from '@wapri/element-pro'

const status = ref<string | undefined>()
const options = [
  { text: '待处理', value: 'pending' },
  { text: '已完成', value: 'completed' },
]
</script>

<template>
  <TagSelector v-model="status" :options="options" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `TagSelectorValue \| TagSelectorValue[]` | - | 当前选中值，使用 `v-model`。 |
| `options` | `TagSelectorOption[]` | - | 选项列表，`text` 和 `value` 必填，`disabled` 可禁用单项。 |
| `multiple` | `boolean` | `false` | 是否多选。 |
| `showAll` | `boolean` | `true` | 是否展示清空选择的“全部”项。 |
| `allText` | `string` | `'全部'` | 清空选择项的文案。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `TagSelectorValue \| TagSelectorValue[] \| undefined` | 用户选择、取消选择或点击“全部”时触发。 |

## 类型

```ts
type TagSelectorValue = string | number

interface TagSelectorOption {
  text: string
  value: TagSelectorValue
  disabled?: boolean
}
```
