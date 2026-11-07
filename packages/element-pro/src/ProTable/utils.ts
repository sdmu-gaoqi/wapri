import type { DataIndex, Key } from '../shared/field/types'

// 字段级工具已上移到 shared/field，这里保持原有导出名，表格内部与业务的 import 路径不变。
export {
  findEnumPath,
  formatCellValue,
  getValueEnumOptions,
  toTreeOptions,
  type TreeSelectOption,
} from '../shared/field/utils'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getDataIndexValue<T extends object>(record: T, dataIndex: DataIndex): unknown {
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex]
  let current: unknown = record

  for (const key of path) {
    if (!isRecord(current)) return undefined
    current = current[key]
  }

  return current
}

export function getDataIndexKey(dataIndex: DataIndex): string {
  return Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex
}

export function getRecordKey<T extends object>(
  record: T,
  index: number,
  rowKey?: string | ((record: T, index: number) => Key),
): Key {
  const value =
    typeof rowKey === 'function'
      ? rowKey(record, index)
      : rowKey
        ? getDataIndexValue(record, rowKey)
        : getDataIndexValue(record, 'id')

  return typeof value === 'string' || typeof value === 'number' ? value : index
}
