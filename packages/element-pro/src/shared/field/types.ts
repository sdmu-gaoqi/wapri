/** 值的唯一标识，用于表格行键、枚举值等场景。 */
export type Key = string | number

/** 字段路径，支持数组形式声明层级，如 `['profile', 'name']`。 */
export type DataIndex = string | string[]

/**
 * 字段值类型。`ProTable` 的查询控件与 `ProFormFields` 的字段组件共用这一组取值，
 * 保证同一份配置在表格与表单中含义一致。
 */
export type ValueType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'digit'
  | 'money'
  | 'select'
  | 'tag'
  | 'treeSelect'
  | 'cascader'
  | 'date'
  | 'dateRange'
  | 'time'
  | 'timeRange'
  | 'switch'
  | 'customer'

export interface ValueEnumItem {
  text: string
  value: Key
  status?: string
  disabled?: boolean
  children?: ValueEnumItem[]
}

/** 枚举声明：对象写法按 key 生成值，数组写法直接声明完整选项。 */
export type ValueEnum = Record<string, string | number | Omit<ValueEnumItem, 'value'>> | ValueEnumItem[]
