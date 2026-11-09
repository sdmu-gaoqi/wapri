<script setup lang="ts">
import { computed } from 'vue'
import { useFormItem } from 'element-plus'
import { get } from '@wapri/gutils'
import { useProFormPath } from '../shared/form/context'
import { joinPath } from '../shared/form/path'
import type { ProFormDependencyProps } from './types'

const props = defineProps<ProFormDependencyProps>()

defineOptions({ name: 'ProFormDependency' })

const { form } = useFormItem()
const pathContext = useProFormPath()

const model = computed<Record<string, unknown> | undefined>(() => {
  const raw: unknown = form?.model
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
})

/**
 * 依赖值集合。
 *
 * 键名保持业务书写的原始字符串（含点分形式），值按「行前缀 + 路径」解析，
 * 因此在 `ProFormList` 行内使用时自动读到当前行的值。
 */
const values = computed<Record<string, unknown>>(() => {
  const target = model.value
  const result: Record<string, unknown> = {}
  for (const name of props.names) {
    result[name] = target ? (get(target, joinPath(pathContext?.value.prefix, name)) as unknown) : undefined
  }
  return result
})
</script>

<template>
  <slot v-bind="values"></slot>
</template>
