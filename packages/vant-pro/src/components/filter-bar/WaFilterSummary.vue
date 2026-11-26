<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WaFilterSummaryEmits, WaFilterSummaryProps } from './types'

/**
 * 已选条件摘要（内部组件）。
 * 收起状态属于展示细节，放在这里可以让筛选栏只关心「选了什么、要清哪个」。
 */
defineOptions({ name: 'WaFilterSummary' })

const props = withDefaults(defineProps<WaFilterSummaryProps>(), {
  collapsible: true,
})
const emit = defineEmits<WaFilterSummaryEmits>()

const collapsed = ref(false)
const canCollapse = computed(() => props.collapsible && props.chips.length > 1)
const visibleChips = computed(() => (collapsed.value ? props.chips.slice(0, 1) : props.chips))

const handleClose = (key: string) => emit('close', key)
</script>

<template>
  <div class="wa-mobile-filter-bar__summary">
    <button
      v-for="chip in visibleChips"
      :key="chip.key"
      type="button"
      class="wa-mobile-filter-bar__chip"
      :aria-label="`移除 ${chip.label}`"
      @click="handleClose(chip.key)"
    >
      <span class="wa-mobile-filter-bar__chip-text">{{ chip.text }}</span>
      <van-icon name="cross" />
    </button>
    <button
      v-if="canCollapse"
      class="wa-mobile-filter-bar__toggle"
      type="button"
      @click="collapsed = !collapsed"
    >
      {{ collapsed ? `展开(${chips.length})` : '收起' }}
    </button>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 20rpx 24rpx 8rpx;
}

/* 条件胶囊：一条最多占七成宽，剩下的位置留给「展开」 */
.wa-mobile-filter-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  max-width: 70%;
  height: 56rpx;
  margin: 0 16rpx 16rpx 0;
  padding: 0 20rpx;
  border: 0;
  border-radius: 28rpx;
  background: var(--wa-mobile-color-primary-light, #e8f0ff);
  color: var(--wa-mobile-color-primary, #1989fa);
  font-family: inherit;
  font-size: 26rpx;
  cursor: pointer;
}

.wa-mobile-filter-bar__chip-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wa-mobile-filter-bar__chip .van-icon {
  flex: 0 0 auto;
  font-size: 24rpx;
}

.wa-mobile-filter-bar__toggle {
  margin: 0 0 16rpx;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wa-mobile-text-color-weak, #969799);
  font-family: inherit;
  font-size: 26rpx;
  cursor: pointer;
}
</style>
