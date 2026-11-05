<template>
  <div
    :style="{ height: height + 'px' }"
    :class="[`${prefix}-vh100`, props.class]"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useVh100 } from '@wapri/ghooks'
import { type CSSProperties } from 'vue'
import { useConfig } from '../ConfigProvider/context'

const props = defineProps<VH100Props>()

defineOptions({ name: 'VH100' })

export type VH100Props = { stype?: CSSProperties; class?: string }

const height = useVh100()
const { prefix } = useConfig()
</script>
