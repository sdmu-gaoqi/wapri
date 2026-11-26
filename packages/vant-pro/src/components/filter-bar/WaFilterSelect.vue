<script setup lang="ts">
import { computed, ref } from 'vue'
import { toSelectionList } from './useFilterModel'
import type { WaFilterSelectProps } from './types'

import './styles/index.css'

defineOptions({ name: 'WaFilterSelect' })

const props = withDefaults(defineProps<WaFilterSelectProps>(), {
  modelValue: undefined,
  inline: false,
  hideLabel: false,
  layout: 'grid',
})
const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined]
}>()

const popupVisible = ref(false)
const pickerValue = ref<string[]>([])
const multiValue = ref<string[]>([])

const selected = computed(() => toSelectionList(props.modelValue))
const displayText = computed(() =>
  selected.value
    .map((value) => props.field.options.find((option) => option.value === value)?.label ?? value)
    .join('、'),
)
const columns = computed(() => props.field.options.map((option) => ({ text: option.label, value: option.value })))

const openPopup = () => {
  // 每次打开都从当前值重建面板态，避免上次未确认的选择残留
  if (props.field.multiple) multiValue.value = [...selected.value]
  else pickerValue.value = selected.value.slice(0, 1)
  popupVisible.value = true
}

/** van-picker 的 confirm 参数是内部结构，这里只认 selectedValues 的第一项 */
const readSelectedValue = (payload: unknown): string | undefined => {
  if (typeof payload !== 'object' || payload === null) return undefined

  const values = (payload as { selectedValues?: unknown }).selectedValues

  if (!Array.isArray(values) || values.length === 0) return undefined

  return String(values[0])
}

const handlePickerConfirm = (payload: unknown) => {
  popupVisible.value = false
  emit('update:modelValue', readSelectedValue(payload))
}

/** 多选项直接点格子切换，点「确定」才提交，跟筛选面板里其它字段保持一致 */
const toggleMulti = (value: string, disabled?: boolean) => {
  if (disabled) return

  multiValue.value = multiValue.value.includes(value)
    ? multiValue.value.filter((item) => item !== value)
    : [...multiValue.value, value]
}

const confirmMulti = () => {
  popupVisible.value = false
  emit('update:modelValue', multiValue.value.length > 0 ? [...multiValue.value] : undefined)
}

/** 字段下拉里直接竖排选择，不再套一层底部弹层 */
const toggleListOption = (value: string, disabled?: boolean) => {
  if (disabled) return

  if (!props.field.multiple) {
    emit('update:modelValue', selected.value.includes(value) ? undefined : value)

    return
  }

  const next = selected.value.includes(value)
    ? selected.value.filter((item) => item !== value)
    : [...selected.value, value]

  emit('update:modelValue', next.length > 0 ? next : undefined)
}
</script>

<template>
  <!-- 必须单根：多根会把父级传下来的 class（内联布局）丢掉，还会触发 Vue 的 fragment 警告 -->
  <div class="wa-mobile-filter-bar__select">
    <div
      v-if="layout === 'list'"
      class="wa-mobile-filter-bar__list"
    >
      <van-cell
        v-for="option in field.options"
        :key="option.value"
        class="wa-mobile-filter-bar__list-item"
        :class="{ 'is-active': selected.includes(option.value), 'is-disabled': option.disabled }"
        :title="option.label"
        :clickable="!option.disabled"
        @click="toggleListOption(option.value, option.disabled)"
      >
        <template #value>
          <van-icon
            v-if="selected.includes(option.value)"
            name="success"
            class="wa-mobile-filter-bar__list-check"
          />
        </template>
      </van-cell>
    </div>

    <div
      v-else
      class="wa-mobile-filter-bar__field"
    >
      <div
        v-if="!inline && !hideLabel"
        class="wa-mobile-filter-bar__label"
      >
        {{ field.label }}
      </div>

      <button
        type="button"
        class="wa-mobile-filter-bar__cell wa-mobile-filter-bar__cell--select"
        @click="openPopup"
      >
        <span
          class="wa-mobile-filter-bar__select-text"
          :class="{ 'wa-mobile-filter-bar__cell--placeholder': !displayText }"
        >
          {{ displayText || field.placeholder || '请选择' }}
        </span>
        <van-icon
          name="arrow"
          class="wa-mobile-filter-bar__select-arrow"
        />
      </button>
    </div>

    <van-popup
      v-if="layout !== 'list'"
      v-model:show="popupVisible"
      class="wa-mobile-filter-bar__select-popup"
      position="bottom"
      round
      teleport="body"
    >
      <template v-if="field.multiple">
        <div class="wa-mobile-filter-bar__popup-title">{{ field.label }}</div>
        <div class="wa-mobile-filter-bar__popup-body">
          <div class="wa-mobile-filter-bar__options">
            <button
              v-for="option in field.options"
              :key="option.value"
              type="button"
              class="wa-mobile-filter-bar__option"
              :class="{ 'is-active': multiValue.includes(option.value), 'is-disabled': option.disabled }"
              :disabled="option.disabled"
              @click="toggleMulti(option.value, option.disabled)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="wa-mobile-filter-bar__popup-actions">
          <van-button
            class="wa-mobile-filter-bar__popup-action wa-mobile-filter-bar__popup-action--plain"
            @click="popupVisible = false"
          >
            取消
          </van-button>
          <van-button
            class="wa-mobile-filter-bar__popup-action"
            type="primary"
            @click="confirmMulti"
          >
            确定
          </van-button>
        </div>
      </template>
      <van-picker
        v-else
        v-model="pickerValue"
        :title="field.label"
        :columns="columns"
        @confirm="handlePickerConfirm"
        @cancel="popupVisible = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__select {
  width: 100%;
}

/* 下拉展示格子：左文右箭头 */
.wa-mobile-filter-bar__cell--select {
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}

.wa-mobile-filter-bar__select-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wa-mobile-filter-bar__select-arrow {
  flex: 0 0 auto;
  margin-left: 16rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
  font-size: 28rpx;
}

.wa-mobile-filter-bar__popup-title {
  padding: 32rpx 32rpx 8rpx;
  color: var(--wa-mobile-text-color, #323233);
  font-size: 34rpx;
  font-weight: 600;
}

.wa-mobile-filter-bar__popup-body {
  padding: 24rpx 32rpx 32rpx;
}

.wa-mobile-filter-bar__popup-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx calc(32rpx + env(safe-area-inset-bottom, 0rpx));
}

.wa-mobile-filter-bar__popup-action {
  flex: 1;
  height: 88rpx;
  border-radius: var(--wa-mobile-radius-lg, 44rpx);
  font-size: 32rpx;
}

.wa-mobile-filter-bar__popup-action--plain {
  background: var(--wa-mobile-background, #f7f8fa);
  color: var(--wa-mobile-text-color, #323233);
}
</style>
