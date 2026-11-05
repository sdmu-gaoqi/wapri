<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { Key } from '../types'
import { useConfig } from '../../ConfigProvider/context'

const props = defineProps<{
  selectedRowKeys: Key[]
  selectedRows: unknown[]
}>()

const emit = defineEmits<{ clear: [] }>()
const { prefix } = useConfig()

defineOptions({ name: 'ProTableSelectionActions' })
</script>

<template>
  <div
    :class="`${prefix}-pro-table__selection-actions`"
    role="status"
  >
    <span :class="`${prefix}-pro-table__selection-count`">已选 {{ props.selectedRowKeys.length }} 项</span>
    <div :class="`${prefix}-pro-table__selection-action-list`">
      <slot
        :selected-row-keys="props.selectedRowKeys"
        :selected-rows="props.selectedRows"
        :clear-selected="() => emit('clear')"
      ></slot>
    </div>
    <ElButton
      link
      type="primary"
      :class="`${prefix}-pro-table__selection-clear`"
      @click="emit('clear')"
    >
      取消选择
    </ElButton>
  </div>
</template>

<style scoped>
.wa-ui-pro-table__selection-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 50px;
  padding: 4px 0 12px;
}

.wa-ui-pro-table__selection-count {
  flex: 0 0 auto;
  color: var(--el-text-color-regular);
  font-size: 14px;
  white-space: nowrap;
}

.wa-ui-pro-table__selection-action-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.wa-ui-pro-table__selection-clear {
  margin-left: 4px;
}
</style>
