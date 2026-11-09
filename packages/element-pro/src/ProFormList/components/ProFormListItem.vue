<script setup lang="ts">
import { provideProFormPath } from '../../shared/form/context'
import type { ProFormPath } from '../../shared/form/path'

/**
 * `ProFormList` 的单行容器。
 *
 * 存在的唯一理由是 `provide` 按组件实例生效：`v-for` 里无法为每一行注入不同的路径前缀，
 * 所以每行需要一个独立实例来提供自己的上下文。
 */
const props = defineProps<{
  /** 当前行的完整路径前缀，例如 `['users', 0]`。 */
  prefix: ProFormPath
  /** 列表级只读。 */
  readonly?: boolean
  /** 列表级禁用。 */
  disabled?: boolean
}>()

defineOptions({ name: 'ProFormListItem' })

provideProFormPath(() => ({
  prefix: props.prefix,
  readonly: props.readonly,
  disabled: props.disabled,
}))
</script>

<template>
  <slot></slot>
</template>
