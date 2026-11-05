<script setup lang="ts">
import { computed } from 'vue'
import { ElPagination } from 'element-plus'
import type { PaginationConfig } from '../types'
import { useConfig } from '../../ConfigProvider/context'

const props = withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    pagination?: false | PaginationConfig
  }>(),
  { pagination: undefined },
)

const emit = defineEmits<{
  change: [page: number]
  pageSizeChange: [pageSize: number]
}>()
const { prefix } = useConfig()

defineOptions({ name: 'ProTablePagination' })

const pageSizes = computed(() =>
  props.pagination !== false ? (props.pagination?.pageSizeOptions ?? [10, 20, 50, 100]) : [],
)

const layout = computed(() => {
  if (props.pagination === false) return ''
  const parts: string[] = []
  if (props.pagination?.showTotal !== false) parts.push('total')
  parts.push('sizes', 'prev', 'pager', 'next')
  if (props.pagination?.showQuickJumper !== false) parts.push('jumper')
  return parts.join(', ')
})

function onCurrentChange(page: number): void {
  emit('change', page)
}

function onSizeChange(pageSize: number): void {
  emit('pageSizeChange', pageSize)
}
</script>

<template>
  <div
    v-if="pagination !== false"
    :class="`${prefix}-pro-table__pagination`"
  >
    <ElPagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      background
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
    />
  </div>
</template>
