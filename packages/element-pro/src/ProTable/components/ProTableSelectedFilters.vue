<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import { ElTag } from 'element-plus'
import { formatCellValue, getDataIndexKey } from '../utils'
import type { ProColumn, ProTableDateQuickSelection } from '../types'
import { useConfig } from '../../ConfigProvider/context'

const props = defineProps<{
  columns: ProColumn<T>[]
  searchValues: Record<string, unknown>
  quickDateSelections?: Record<string, ProTableDateQuickSelection>
  /** 前缀文案，如"已筛选" */
  title?: string
}>()

const emit = defineEmits<{
  clear: [key: string]
  clearAll: []
}>()
const { prefix } = useConfig()

defineOptions({ name: 'ProTableSelectedFilters' })

function isSameValue(value: unknown, target: string | [string, string]): boolean {
  if (typeof target === 'string') return value === target
  return Array.isArray(value) && value.length === target.length && value.every((item, index) => item === target[index])
}

function formatValue(value: unknown, column: ProColumn<T>, key: string): string {
  const quickSelection = props.quickDateSelections?.[key]
  if (quickSelection && isSameValue(value, quickSelection.value)) return quickSelection.label
  return formatCellValue(value, false, column.valueEnum)
}

/** 已选条件条目（按 columns 顺序，过滤掉空值与不可搜索字段） */
const items = computed(() => {
  const out: { key: string; title: string; displayValue: string }[] = []
  props.columns.forEach((column) => {
    if (column.hideInForm || column.search === false) return
    const key = getDataIndexKey(column.dataIndex)
    const value = props.searchValues[key]
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value) && value.length === 0) return
    out.push({
      key,
      title: column.title,
      displayValue: formatValue(value, column, key),
    })
  })
  return out
})
</script>

<template>
  <div
    v-if="items.length"
    :class="`${prefix}-pro-table__selected-filters`"
  >
    <span :class="`${prefix}-pro-table__selected-filters-title`">{{ title ?? '已筛选' }}</span>
    <div :class="`${prefix}-pro-table__selected-filters-content`">
      <ElTag
        v-for="item in items"
        :key="item.key"
        type="primary"
        effect="light"
        :class="`${prefix}-pro-table__selected-filters-tag`"
        closable
        @close="emit('clear', item.key)"
      >
        {{ item.title }}：{{ item.displayValue }}
      </ElTag>
    </div>
  </div>
</template>

<style scoped>
.wa-ui-pro-table__selected-filters {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0 16px 12px;
  font-size: 13px;
}
.wa-ui-pro-table__selected-filters--inline {
  padding: 0;
}
.wa-ui-pro-table__selected-filters-title {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
  line-height: 24px;
  white-space: nowrap;
}
.wa-ui-pro-table__selected-filters-content {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
.wa-ui-pro-table__selected-filters-tag {
  margin: 0;
}
.wa-ui-pro-table__selected-filters-clear-all {
  color: var(--el-color-primary);
  cursor: pointer;
  margin-left: 4px;
  text-decoration: none;
}
.wa-ui-pro-table__selected-filters-clear-all:hover {
  text-decoration: underline;
}
</style>
