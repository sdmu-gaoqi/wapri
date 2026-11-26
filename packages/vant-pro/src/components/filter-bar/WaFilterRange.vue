<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { WaNumberRange } from '../../types'
import { toRangeValue } from './useFilterModel'
import type { WaFilterRangeProps } from './types'

import './styles/index.css'

defineOptions({ name: 'WaFilterRange' })

const props = withDefaults(defineProps<WaFilterRangeProps>(), {
  modelValue: undefined,
  inline: false,
  hideLabel: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: WaNumberRange | undefined]
}>()

const range = computed(() => toRangeValue(props.modelValue) ?? {})

const readText = (side: 'min' | 'max'): string => {
  const value = range.value[side]

  return value === undefined ? '' : String(value)
}

/** 输入过程中先留在本地，失焦 / 回车时才归一化提交，避免每敲一位就四舍五入 */
const minText = ref(readText('min'))
const maxText = ref(readText('max'))

watch(
  range,
  () => {
    minText.value = readText('min')
    maxText.value = readText('max')
  },
  { deep: true },
)

const normalize = (raw: string): number | undefined => {
  const trimmed = raw.trim()

  if (!trimmed) return undefined

  const parsed = Number(trimmed)

  if (!Number.isFinite(parsed)) return undefined

  // 按 precision 四舍五入，再夹到字段上下限：业务方不用在 onChange 里再兜一次
  const precision = props.field.precision
  const rounded = precision === undefined ? parsed : Number(parsed.toFixed(precision))
  const min = props.field.min ?? Number.NEGATIVE_INFINITY
  const max = props.field.max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(rounded, min), max)
}

const commit = (side: 'min' | 'max') => {
  const next: WaNumberRange = { ...range.value }
  const value = normalize(side === 'min' ? minText.value : maxText.value)

  if (value === undefined) delete next[side]
  else next[side] = value

  // 回写归一化后的文本，用户能看到被夹到上下限的结果
  if (side === 'min') minText.value = value === undefined ? '' : String(value)
  else maxText.value = value === undefined ? '' : String(value)

  emit('update:modelValue', next.min === undefined && next.max === undefined ? undefined : next)
}
</script>

<template>
  <div class="wa-mobile-filter-bar__field">
    <div
      v-if="!inline && !hideLabel"
      class="wa-mobile-filter-bar__label"
    >
      {{ field.label }}
    </div>

    <div
      class="wa-mobile-filter-bar__range"
      :class="{ 'wa-mobile-filter-bar__range--inline': inline }"
    >
      <van-field
        v-model="minText"
        class="wa-mobile-filter-bar__range-input"
        type="number"
        inputmode="decimal"
        :placeholder="field.placeholder?.[0] ?? '最小值'"
        :border="false"
        input-align="center"
        @blur="commit('min')"
        @keydown.enter="commit('min')"
      />
      <span class="wa-mobile-filter-bar__range-separator">至</span>
      <van-field
        v-model="maxText"
        class="wa-mobile-filter-bar__range-input"
        type="number"
        inputmode="decimal"
        :placeholder="field.placeholder?.[1] ?? '最大值'"
        :border="false"
        input-align="center"
        @blur="commit('max')"
        @keydown.enter="commit('max')"
      />
      <span
        v-if="field.unit"
        class="wa-mobile-filter-bar__range-unit"
      >
        {{ field.unit }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__range {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 内层 van-field 走格子样式，靠 .van-cell 提权压掉单元格默认样式 */
.wa-mobile-filter-bar__range-input.van-cell {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  height: var(--wa-mobile-cell-height, 80rpx);
  padding: 0 16rpx;
  border-radius: var(--wa-mobile-radius, 16rpx);
  background: var(--wa-mobile-background, #f7f8fa);
  font-size: var(--wa-mobile-font-size, 30rpx);
}

.wa-mobile-filter-bar__range-input.van-cell::after {
  display: none;
}

/* van-field 内部三层容器都要撑满并居中，否则文字会贴着格子上沿 */
.wa-mobile-filter-bar__range-input .van-field__value,
.wa-mobile-filter-bar__range-input .van-field__body {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.wa-mobile-filter-bar__range-input .van-field__control {
  height: 100%;
  padding: 0;
  line-height: 1;
}

.wa-mobile-filter-bar__range--inline .wa-mobile-filter-bar__range-input.van-cell {
  height: 64rpx;
  font-size: 26rpx;
}

.wa-mobile-filter-bar__range-separator {
  padding: 0 20rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
}

.wa-mobile-filter-bar__range-unit {
  padding-left: 16rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
  font-size: 26rpx;
}
</style>
