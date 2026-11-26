<template>
  <div
    :class="['wa-mobile-vh100', props.class]"
    :style="[{ height: `${height}px` }, props.style]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useVh100 } from '@wapri/ghooks'
import type { WaVH100Props } from './types'

defineOptions({ name: 'WaVH100' })

const props = defineProps<WaVH100Props>()

/** 视口高度：监听 resize 更新，避免移动端地址栏收起后留白 */
const height = useVh100()
</script>

<style scoped>
.wa-mobile-vh100 {
  box-sizing: border-box;
  width: 100%;
  overflow: auto;
}
</style>
