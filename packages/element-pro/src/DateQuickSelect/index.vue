<script setup lang="ts">
import { computed } from 'vue'
import { ElButton, ElDatePicker } from 'element-plus'
import type { DateQuickSelectConfig, DateQuickSelectSelection, DateQuickSelectValueType } from './types'
import { getDateQuickSelections, isDateRangeValueType, isSameDateQuickValue } from './utils'
import { useConfig } from '../ConfigProvider/context'

const props = withDefaults(
  defineProps<{
    modelValue?: string | [string, string]
    valueType: DateQuickSelectValueType
    quickSelect?: DateQuickSelectConfig | false
    quickSelection?: DateQuickSelectSelection
    datePickerProps?: Record<string, unknown>
    placeholder?: string
    clearable?: boolean
  }>(),
  {
    quickSelect: false,
    datePickerProps: () => ({}),
    clearable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string] | undefined]
  'quickSelect': [selection: DateQuickSelectSelection]
}>()

defineOptions({ name: 'DateQuickSelect' })
const { prefix } = useConfig()

const valueFormat = computed(() => {
  const configured = props.datePickerProps.valueFormat
  if (typeof configured === 'string') return configured
  return props.valueType === 'time' || props.valueType === 'timeRange' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})
const options = computed(() =>
  getDateQuickSelections({
    valueType: props.valueType,
    config: props.quickSelect ?? false,
    valueFormat: valueFormat.value,
  }),
)
const isRange = computed(() => isDateRangeValueType(props.valueType))
const pickerType = computed(() => {
  if (props.valueType === 'date') return 'date'
  if (props.valueType === 'dateRange') return 'daterange'
  if (props.valueType === 'time') return 'datetime'
  return 'datetimerange'
})
const pickerProps = computed<Record<string, unknown>>(() => {
  if (props.valueType !== 'timeRange' || props.datePickerProps.defaultTime !== undefined) return props.datePickerProps
  return {
    defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
    ...props.datePickerProps,
  }
})
const pickerValue = computed(() => (props.quickSelection ? undefined : props.modelValue))
const startPlaceholder = computed(() =>
  typeof props.datePickerProps.startPlaceholder === 'string'
    ? props.datePickerProps.startPlaceholder
    : props.valueType === 'timeRange'
      ? '开始日期时间'
      : '开始日期',
)
const endPlaceholder = computed(() =>
  typeof props.datePickerProps.endPlaceholder === 'string'
    ? props.datePickerProps.endPlaceholder
    : props.valueType === 'timeRange'
      ? '结束日期时间'
      : '结束日期',
)

function isSelected(selection: DateQuickSelectSelection): boolean {
  return props.quickSelection !== undefined && isSameDateQuickValue(props.quickSelection.value, selection.value)
}

function updateValue(value: unknown): void {
  if (typeof value === 'string') {
    emit('update:modelValue', value)
    return
  }
  if (Array.isArray(value) && value.length === 2) {
    const [start, end] = value
    if (typeof start === 'string' && typeof end === 'string') {
      emit('update:modelValue', [start, end])
      return
    }
  }
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div :class="`${prefix}-date-quick-select`">
    <div
      v-if="options.length"
      :class="`${prefix}-date-quick-select-options`"
    >
      <ElButton
        v-for="option in options"
        :key="option.key"
        type="info"
        :class="[`${prefix}-date-quick-select-item`, isSelected(option) && 'is-selected']"
        :aria-pressed="isSelected(option)"
        round
        @click="emit('quickSelect', option)"
      >
        {{ option.label }}
      </ElButton>
    </div>
    <ElDatePicker
      v-bind="pickerProps"
      :model-value="pickerValue"
      :type="pickerType"
      :value-format="valueFormat"
      :placeholder="isRange ? undefined : placeholder"
      :start-placeholder="isRange ? startPlaceholder : undefined"
      :end-placeholder="isRange ? endPlaceholder : undefined"
      :clearable="clearable"
      @update:model-value="updateValue"
    />
  </div>
</template>

<style lang="scss">
.wa-ui-date-quick-select-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .el-button {
    margin-left: 0;
  }
}

.wa-ui-date-quick-select-item {
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled),
  &.is-selected {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}

.wa-ui-date-quick-select {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;

  .el-date-editor {
    flex: 1;
    min-width: 180px;
  }
}
</style>
