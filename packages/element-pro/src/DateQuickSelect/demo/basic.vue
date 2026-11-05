<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElRadioButton, ElRadioGroup, ElTag } from 'element-plus'
import { DateQuickSelect } from '@wapri/element-pro'
import type { DateQuickSelectSelection, DateQuickSelectValue, DateQuickSelectValueType } from '@wapri/element-pro'

const valueType = ref<DateQuickSelectValueType>('dateRange')
const value = ref<DateQuickSelectValue>()
const source = ref('未选择')

function updateValue(nextValue: DateQuickSelectValue | undefined) {
  value.value = nextValue
  source.value = nextValue === undefined ? '未选择' : '手动选择'
}

function selectQuickDate(selection: DateQuickSelectSelection) {
  value.value = selection.value
  source.value = `快捷项：${selection.label}`
}

watch(valueType, () => {
  value.value = undefined
  source.value = '未选择'
})
</script>

<template>
  <div class="date-quick-select-demo">
    <ElRadioGroup
      v-model="valueType"
      size="small"
    >
      <ElRadioButton value="dateRange">日期范围</ElRadioButton>
      <ElRadioButton value="timeRange">日期时间范围</ElRadioButton>
    </ElRadioGroup>

    <DateQuickSelect
      :model-value="value"
      :value-type="valueType"
      :quick-select="{ showYesterday: true, recentDays: [3, 7, 30] }"
      @update:model-value="updateValue"
      @quick-select="selectQuickDate"
    />

    <div class="date-quick-select-demo__result">
      值来源：
      <ElTag size="small">{{ source }}</ElTag>
      <span>{{ Array.isArray(value) ? value.join(' 至 ') : value || '—' }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-quick-select-demo {
  display: grid;
  gap: 16px;

  &__result {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--el-text-color-regular);
    font-size: 14px;
  }
}
</style>
