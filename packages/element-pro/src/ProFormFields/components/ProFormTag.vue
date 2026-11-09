<script setup lang="ts">
import { computed } from 'vue'
import ProFormField from './ProFormField.vue'
import { fieldEmptyText } from '../../constant'
import { omitUndefined } from '../../shared/form/props'
import type { ProFormTagProps } from '../types'

// emptyText 的类型包含 Boolean，Vue 会把未传的布尔型 prop 归一成 false；
// 这里补上默认值，再把 undefined 过滤掉，避免外壳把内核的默认值顶掉。
const props = withDefaults(defineProps<ProFormTagProps>(), {
  emptyText: fieldEmptyText,
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能拿到「未设置」，
  // 否则外壳会把 false 透传给内核，短路 Element Plus 的表单级回退。
  disabled: undefined,
})
const passedProps = computed(() => omitUndefined(props))

defineOptions({ name: 'ProFormTag' })
</script>

<template>
  <ProFormField
    v-bind="passedProps"
    value-type="tag"
  />
</template>
