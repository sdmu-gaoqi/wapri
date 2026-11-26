<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WaDateRange } from '../../types'
import { coerceToDateType, createDefaultShortcuts, formatDate, formatRangeText } from './date'
import { toDateValue } from './useFilterModel'
import type { DateShortcut, WaFilterDateProps } from './types'

import './styles/index.css'

defineOptions({ name: 'WaFilterDate' })

const props = withDefaults(defineProps<WaFilterDateProps>(), {
  modelValue: undefined,
  inline: false,
  hideLabel: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: WaDateRange | undefined]
}>()

/**
 * 滚轮可选范围：往前 2 年到今年年底。
 * 日期选择器按年 / 月 / 日三列滚，范围给太宽只影响滚动手感，不影响渲染量。
 */
const THIS_YEAR = new Date().getFullYear()
const MIN_DATE = new Date(THIS_YEAR - 2, 0, 1)
const MAX_DATE = new Date(THIS_YEAR, 11, 31)

const dateType = computed(() => props.field.dateType ?? 'date')
// 显式传空数组表示不要快捷项；不传才用内置的四个
const shortcuts = computed(() => props.field.shortcuts ?? createDefaultShortcuts())
const value = computed(() => toDateValue(props.modelValue))
const activeShortcut = computed(() => value.value?.shortcut ?? '')

const startText = computed(() => value.value?.start ?? '')
const endText = computed(() => value.value?.end ?? '')

/** 滚轮列：month 只要年月，date / datetime 都要到日 */
const columnsType = computed<('year' | 'month' | 'day')[]>(() =>
  dateType.value === 'month' ? ['year', 'month'] : ['year', 'month', 'day'],
)

const pickerVisible = ref(false)
const pickerTarget = ref<'start' | 'end'>('start')
const pickerValue = ref<string[]>([])

const pickerTitle = computed(() => (pickerTarget.value === 'start' ? '选择开始日期' : '选择结束日期'))

/** 统一值 → 滚轮初值：'YYYY-MM-DD HH:mm:ss' → ['YYYY', 'MM', 'DD'] */
const toPickerValue = (text: string): string[] => {
  const date = text || formatDate(new Date(), dateType.value)
  const [year, month, day] = date.slice(0, 10).split('-')

  if (dateType.value === 'month') return [year, month]

  return [year, month, day]
}

const openPicker = (target: 'start' | 'end') => {
  pickerTarget.value = target
  pickerValue.value = toPickerValue(target === 'start' ? startText.value : endText.value)
  pickerVisible.value = true
}

/** 区间统一走 coerceToDateType：datetime 补时分秒，结束取 23:59:59 */
const emitRange = (start: string, end: string, shortcut?: string) => {
  if (!start && !end) {
    emit('update:modelValue', undefined)

    return
  }

  emit('update:modelValue', {
    start: coerceToDateType(start, dateType.value, 'start'),
    end: coerceToDateType(end, dateType.value, 'end'),
    shortcut,
  })
}

const handleConfirm = (payload: { selectedValues: string[] }) => {
  pickerVisible.value = false

  const [year, month, day] = payload.selectedValues
  const picked = dateType.value === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`
  const target = pickerTarget.value

  let start = target === 'start' ? picked : startText.value
  let end = target === 'end' ? picked : endText.value

  // 只选了一端时，另一端跟着走，避免出现「只有开始」的中间态
  if (!start) start = end
  if (!end) end = start

  // 开始晚于结束时，把刚改的那端顶到另一端，保证区间始终有序
  if (start && end && start > end) {
    if (target === 'start') end = start
    else start = end
  }

  emitRange(start, end)
}

const applyShortcut = (shortcut: DateShortcut) => {
  const [start, end] = shortcut.range()

  emitRange(start, end, shortcut.name)
}

const clear = () => emit('update:modelValue', undefined)
</script>

<template>
  <!-- 必须单根：多根会把父级传下来的 class（内联布局）丢掉，还会触发 Vue 的 fragment 警告 -->
  <div class="wa-mobile-filter-bar__date">
    <div class="wa-mobile-filter-bar__field">
      <div
        v-if="!inline && !hideLabel"
        class="wa-mobile-filter-bar__label"
      >
        {{ field.label }}
      </div>

      <div class="wa-mobile-filter-bar__date-row">
        <button
          type="button"
          class="wa-mobile-filter-bar__cell"
          :class="{ 'wa-mobile-filter-bar__cell--placeholder': !startText }"
          @click="openPicker('start')"
        >
          {{ startText || field.placeholder || '开始日期' }}
        </button>
        <span class="wa-mobile-filter-bar__date-separator">至</span>
        <button
          type="button"
          class="wa-mobile-filter-bar__cell"
          :class="{ 'wa-mobile-filter-bar__cell--placeholder': !endText }"
          @click="openPicker('end')"
        >
          {{ endText || field.placeholder || '结束日期' }}
        </button>
      </div>

      <!-- 快捷项放在面板里：内联态一行放不下，硬塞会把筛选条挤爆 -->
      <div
        v-if="!inline && shortcuts.length > 0"
        class="wa-mobile-filter-bar__shortcuts"
      >
        <button
          v-for="shortcut in shortcuts"
          :key="shortcut.name"
          type="button"
          class="wa-mobile-filter-bar__option"
          :class="{ 'is-active': activeShortcut === shortcut.name }"
          @click="applyShortcut(shortcut)"
        >
          {{ shortcut.name }}
        </button>
      </div>

      <div
        v-if="!inline && value"
        class="wa-mobile-filter-bar__date-foot"
      >
        <span class="wa-mobile-filter-bar__date-summary">{{ formatRangeText(startText, endText) }}</span>
        <button
          type="button"
          class="wa-mobile-filter-bar__date-clear"
          @click="clear"
        >
          清除
        </button>
      </div>
    </div>

    <van-popup
      v-model:show="pickerVisible"
      class="wa-mobile-filter-bar__picker"
      position="bottom"
      round
      teleport="body"
    >
      <van-date-picker
        v-model="pickerValue"
        :title="pickerTitle"
        :columns-type="columnsType"
        :min-date="MIN_DATE"
        :max-date="MAX_DATE"
        @confirm="handleConfirm"
        @cancel="pickerVisible = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__date-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.wa-mobile-filter-bar__date-separator {
  padding: 0 20rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
}

/* 快捷项四列等宽，跟业务里的「今日 / 昨日 / 近7天 / 近30天」排法一致 */
.wa-mobile-filter-bar__shortcuts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: 24rpx;
}

.wa-mobile-filter-bar__date-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}

.wa-mobile-filter-bar__date-summary {
  color: var(--wa-mobile-text-color-weak, #969799);
  font-size: 26rpx;
}

.wa-mobile-filter-bar__date-clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wa-mobile-color-primary, #1989fa);
  font-family: inherit;
  font-size: 26rpx;
  cursor: pointer;
}
</style>
