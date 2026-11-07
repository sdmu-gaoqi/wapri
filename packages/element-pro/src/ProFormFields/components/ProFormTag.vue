<script setup lang="ts">
import { computed } from 'vue'
import ProFormField from './ProFormField.vue'
import { fieldEmptyText } from '../../constant'
import { omitUndefined } from '../utils'
import type { ProFormTagProps } from '../types'

// emptyText 的类型包含 Boolean，Vue 会把未传的布尔型 prop 归一成 false；
// 这里补上默认值，再把 undefined 过滤掉，避免外壳把内核的默认值顶掉。
const props = withDefaults(defineProps<ProFormTagProps>(), { emptyText: fieldEmptyText })
const passedProps = computed(() => omitUndefined(props))

defineOptions({ name: 'ProFormTag' })
</script>

<template>
  <ProFormField
    v-bind="passedProps"
    value-type="tag"
  />
</template>
