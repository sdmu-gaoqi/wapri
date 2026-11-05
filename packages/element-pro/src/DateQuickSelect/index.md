---
title: DateQuickSelect 日期快捷选择
group:
  title: 表单
  order: 3
---

# DateQuickSelect 日期快捷选择

将 `ElDatePicker` 与“昨天”“今天”“近 N 天”等快捷项组合为日期录入组件。适合筛选表单，也供 `ProTable` 的日期搜索项使用。

## 基础用法

<code src="./demo/basic.vue"></code>

快捷项通过 `quick-select` 事件返回，调用方应将 `selection.value` 写回受控值；手动选择则通过 `update:modelValue` 返回。传入 `quickSelection` 时对应快捷项高亮，日期选择器保持为空，便于区分快捷筛选和手动输入。

## 使用

从 `@wapri/element-pro` 导入 `DateQuickSelect`，可单独执行 `app.use(DateQuickSelect)` 注册。

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { DateQuickSelect } from '@wapri/element-pro'
import type { DateQuickSelectSelection } from '@wapri/element-pro'

const createdAt = ref<[string, string]>()

function selectQuickDate(selection: DateQuickSelectSelection) {
  if (Array.isArray(selection.value)) createdAt.value = selection.value
}
</script>

<template>
  <DateQuickSelect
    v-model="createdAt"
    value-type="dateRange"
    :quick-select="{ showYesterday: true, recentDays: [7, 30] }"
    @quick-select="selectQuickDate"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `DateQuickSelectValue` | - | 当前日期值，使用 `v-model`。 |
| `valueType` | `DateQuickSelectValueType` | - | `date`、`dateRange`、`time` 或 `timeRange`。 |
| `quickSelect` | `DateQuickSelectConfig \| false` | `false` | 快捷项配置。`false` 时不显示快捷项。 |
| `quickSelection` | `DateQuickSelectSelection` | - | 当前激活的快捷项，用于高亮并清空日期输入框显示。 |
| `datePickerProps` | `Record<string, unknown>` | `{}` | 透传给 `ElDatePicker` 的属性；`valueFormat` 会同步用于快捷项值。 |
| `placeholder` | `string` | - | 单值日期选择器的占位文案。 |
| `clearable` | `boolean` | `true` | 是否允许清空。 |

当 `valueType` 为 `timeRange` 且未传 `datePickerProps.defaultTime` 时，开始时间默认 `00:00:00`，结束时间默认 `23:59:59`。范围类型默认显示“近 7 天”“近 30 天”；单值类型仅显示“昨天”“今天”。

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `DateQuickSelectValue \| undefined` | 用户手动选择或清空日期时触发。 |
| `quick-select` | `DateQuickSelectSelection` | 用户点击快捷项时触发。 |

## 类型

```ts
type DateQuickSelectValue = string | [string, string]
type DateQuickSelectValueType = 'date' | 'dateRange' | 'time' | 'timeRange'

interface DateQuickSelectConfig {
  showYesterday?: boolean
  showToday?: boolean
  recentDays?: number[]
}

interface DateQuickSelectSelection {
  key: string
  label: string
  value: DateQuickSelectValue
}
```
