import type { FormItemProps, FormItemRule } from 'element-plus'
import type { ProFormFieldName } from '../shared/form/path'

/** 数组字段容器。 */
export interface ProFormListProps {
  /** 数组字段路径，对应 `ElForm` 的 `model` 键；同时作为 `ElFormItem` 的 `prop`。 */
  name: ProFormFieldName
  /** 标签文案。 */
  label?: string
  /** 数组级校验规则，例如 `{ type: 'array', min: 1 }`。 */
  rules?: FormItemRule | FormItemRule[]
  /** 是否必填，用于展示必填星号；校验仍以 `rules` 为准。 */
  required?: boolean
  /** 只读：行内字段渲染纯文本，且隐藏增删改操作。 */
  readonly?: boolean
  /** 禁用：行内字段禁用，且隐藏增删改操作。 */
  disabled?: boolean
  /** 新增行的初始值；按行深拷贝，避免多行共享引用。 */
  initialValue?: Record<string, unknown>
  /** 空态文案，默认「暂无数据」；传 `false` 不展示空态。 */
  emptyText?: string | false
  /** 新增按钮文案，默认「新增」。 */
  addText?: string
  /** 是否展示复制按钮，默认 `true`。 */
  copyable?: boolean
  /** 是否展示移动按钮，默认 `true`。 */
  movable?: boolean
  /** 是否展示删除按钮，默认 `true`。 */
  removable?: boolean
  /** 最多行数，达到后新增按钮禁用。 */
  max?: number
  /** 最少行数，达到后删除按钮禁用。 */
  min?: number
  /** 标签旁的提示文案。 */
  tooltip?: string
  /** 透传给 `ElFormItem` 的属性。 */
  formItemProps?: Partial<FormItemProps> & Record<string, unknown>
}

/** 数组字段容器暴露的操作。 */
export interface ProFormListAction {
  /** 在末尾追加一行。 */
  add: () => void
  /** 删除指定行。 */
  remove: (index: number) => void
  /** 复制指定行到其后。 */
  copy: (index: number) => void
  /** 上移指定行。 */
  moveUp: (index: number) => void
  /** 下移指定行。 */
  moveDown: (index: number) => void
  /** 当前行数。 */
  length: () => number
}
