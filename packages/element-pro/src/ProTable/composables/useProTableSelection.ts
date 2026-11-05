import { computed, ref, shallowRef, type ShallowRef } from 'vue'
import { getRecordKey } from '../utils'
import type { Key, RowSelectionConfig } from '../types'

export function useProTableSelection<T extends object>(
  rows: ShallowRef<T[]>,
  config: false | RowSelectionConfig<T> | undefined,
  rowKey: string | ((record: T, index: number) => Key) | undefined,
) {
  const selectedRowKeys = ref<Key[]>(
    config !== undefined && config !== false ? [...(config.selectedRowKeys ?? [])] : [],
  )
  const selectedRows = shallowRef<T[]>([])

  const hasSelection = computed(() => selectedRowKeys.value.length > 0)

  function notifyChange(): void {
    if (config !== undefined && config !== false) {
      config.onChange?.(selectedRowKeys.value, selectedRows.value)
    }
  }

  /** 由 el-table 的 selection-change 事件同步选中状态（以表格内部为真源）。 */
  function setSelection(nextRows: T[]): void {
    selectedRows.value = nextRows
    const keySet = new Set<Key>()
    nextRows.forEach((row, index) => {
      keySet.add(getRecordKey(row, index, rowKey))
    })
    selectedRowKeys.value = [...keySet]
    notifyChange()
  }

  function clearSelected(): void {
    selectedRowKeys.value = []
    selectedRows.value = []
    notifyChange()
  }

  return { selectedRowKeys, selectedRows, hasSelection, setSelection, clearSelected }
}
