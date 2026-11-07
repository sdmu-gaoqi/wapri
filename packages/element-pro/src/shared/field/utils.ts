import type { Key, ValueEnum, ValueEnumItem } from './types'

/** 树形枚举转换后的节点，兼容 el-tree-select 的 TreeData 与 el-cascader 的 CascaderOption。 */
export interface TreeSelectOption {
  label: string
  value: Key
  disabled?: boolean
  children?: TreeSelectOption[]
  /** 索引签名：兼容 el-cascader 的 CascaderOption 结构。 */
  [key: string]: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 把 `valueEnum` 归一化为带 `text` / `value` 的选项数组。 */
export function getValueEnumOptions(valueEnum?: ValueEnum): ValueEnumItem[] {
  if (!valueEnum) return []
  if (Array.isArray(valueEnum)) return valueEnum

  return Object.entries(valueEnum).map(([value, item]) => {
    const key: Key = Number.isNaN(Number(value)) ? value : Number(value)
    if (typeof item === 'object' && item !== null) {
      return { value: key, ...item }
    }
    return { value: key, text: String(item) }
  })
}

/** 将 valueEnum 转为 el-tree-select / el-cascader 可用的树形数据。 */
export function toTreeOptions(valueEnum?: ValueEnum): TreeSelectOption[] {
  return getValueEnumOptions(valueEnum).map((item) => ({
    label: item.text,
    value: item.value,
    disabled: item.disabled,
    children: item.children?.length ? toTreeOptions(item.children) : undefined,
  }))
}

/** 在树形枚举中查找值的完整路径（含自身），未命中返回 null。 */
export function findEnumPath(options: ValueEnumItem[], target: Key): ValueEnumItem[] | null {
  for (const item of options) {
    if (item.value === target) return [item]
    if (item.children?.length) {
      const subPath = findEnumPath(item.children, target)
      if (subPath) return [item, ...subPath]
    }
  }
  return null
}

function enumTextOf(options: ValueEnumItem[], value: Key): string | null {
  const path = findEnumPath(options, value)
  return path ? path.map((item) => item.text).join(' / ') : null
}

/**
 * 格式化单元格 / 只读字段的展示文本：
 * - 空值返回占位符
 * - valueEnum 命中（支持 children 深层）返回枚举文本，深层值用 " / " 拼接父级
 * - 数组值（dateRange / timeRange / cascader 路径）逐项解析后用 " ~ " 连接
 */
export function formatCellValue(value: unknown, columnEmptyText: string | false = '-', valueEnum?: ValueEnum): string {
  if (value === undefined || value === null || value === '') {
    return columnEmptyText === false ? '' : columnEmptyText
  }

  const options = getValueEnumOptions(valueEnum)

  if (Array.isArray(value)) {
    const texts = value
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return enumTextOf(options, item) ?? String(item)
        }
        return null
      })
      .filter((text): text is string => text !== null)
    return texts.length > 0 ? texts.join(' ~ ') : JSON.stringify(value)
  }

  if (typeof value === 'boolean') {
    const boolOption = options.find((item) => String(item.value) === String(value))
    if (boolOption) return boolOption.text
    return value ? '是' : '否'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const enumText = enumTextOf(options, value)
    if (enumText) return enumText
  }

  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** 判断一个值是否是可用于枚举查询的标量。 */
export function isEnumScalar(value: unknown): value is Key {
  return typeof value === 'string' || typeof value === 'number'
}

/** 把值收窄为对象，供字段读写路径时使用。 */
export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined
}
