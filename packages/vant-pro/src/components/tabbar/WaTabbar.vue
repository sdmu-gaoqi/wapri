<script setup lang="ts">
import type { WaTabbarEmits, WaTabbarProps } from './types'

defineOptions({ name: 'WaTabbar' })

const props = withDefaults(defineProps<WaTabbarProps>(), {
  fixed: true,
  safeAreaInsetBottom: true,
  placeholder: false,
  border: true,
  activeColor: undefined,
  inactiveColor: undefined,
  zIndex: undefined,
})
const emit = defineEmits<WaTabbarEmits>()

const handleChange = (active: unknown) => {
  // van-tabbar 的 change 给的是 name（number | string），这里统一转成业务 key
  const key = String(active)
  emit('update:modelValue', key)
  const item = props.items.find((current) => current.key === key)
  if (item) emit('change', item)
}
</script>

<template>
  <van-tabbar
    class="wa-mobile-tabbar"
    :model-value="modelValue"
    :route="false"
    :fixed="fixed"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    :placeholder="placeholder"
    :border="border"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :z-index="zIndex"
    @change="handleChange"
  >
    <van-tabbar-item
      v-for="item in items"
      :key="item.key"
      class="wa-mobile-tabbar__item"
      :name="item.key"
      :badge="item.badge"
      :dot="item.dot"
    >
      <template #icon>
        <slot
          name="icon"
          :item="item"
          :active="item.key === modelValue"
        >
          <van-icon
            v-if="item.icon || item.activeIcon"
            class="wa-mobile-tabbar__icon"
            :name="item.key === modelValue && item.activeIcon ? item.activeIcon : item.icon"
          />
        </slot>
      </template>
      <span class="wa-mobile-tabbar__title">{{ item.title }}</span>
    </van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>
.wa-mobile-tabbar__icon {
  display: block;
  font-size: 40rpx;
}

.wa-mobile-tabbar__title {
  font-size: 24rpx;
  line-height: 1.2;
}
</style>
