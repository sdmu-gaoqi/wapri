import type { ColProps, FormItemProps, FormItemRule } from 'element-plus'
import type { Key, ValueEnum, ValueType } from '../shared/field/types'
import type { ProFormFieldName } from '../shared/form/path'

/** 字段宽度预设：`xs` 104 / `sm` 216 / `md` 328 / `lg` 440 / `xl` 552，传数字按像素处理。 */
export type ProFormFieldWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

/** 字段选项；`label` 语义对齐 `ElOption`，`children` 用于树形与级联。 */
export interface ProFormFieldOption {
  label: string
  value: Key
  disabled?: boolean
  children?: ProFormFieldOption[]
}

/** 字段级 valueType：与 `ProTable` 的 `ValueType` 共用取值，去掉表格专属的 `customer`。 */
export type ProFormFieldValueType = Exclude<ValueType, 'customer'>

/**
 * 全部字段组件共享的 props。
 *
 * 组件自身的 props 属于 `ElFormItem`（`label`、`rules` 等）；底层控件的属性统一走 `fieldProps`，
 * 例如 `multiple`、`showAll`、`precision`、`valueFormat`。
 */
export interface ProFormFieldProps {
  /** 字段路径，对应 `ElForm` 的 `model` 键；同时作为 `ElFormItem` 的 `prop`。 */
  name?: ProFormFieldName
  /** 标签文案。 */
  label?: string
  /** 校验规则，透传给 `ElFormItem`。 */
  rules?: FormItemRule | FormItemRule[]
  /** 是否必填，用于展示必填星号；校验仍以 `rules` 为准。 */
  required?: boolean
  /** 只读：渲染纯文本而不是禁用控件。 */
  readonly?: boolean
  /** 禁用控件。 */
  disabled?: boolean
  /** 占位文案；不传时按 `valueType` 与 `label` 推导。 */
  placeholder?: string
  /** 字段初始值：挂载时若 model 中该路径为 `undefined` 则写入。 */
  initialValue?: unknown
  /** 只读态与空值的占位文本，默认 `'-'`；传 `false` 展示空字符串。 */
  emptyText?: string | false
  /** 枚举声明，同时驱动可选项与只读文本。 */
  valueEnum?: ValueEnum
  /** 显式选项，优先于 `valueEnum`。 */
  options?: ProFormFieldOption[]
  /** 控件宽度。 */
  width?: ProFormFieldWidth
  /** 栅格占位，透传给外层 `ElCol`；未传时占满一行。 */
  colProps?: ColProps
  /** 标签旁的提示文案。 */
  tooltip?: string
  /** 透传给底层控件的属性，优先级高于组件上的同名 props。 */
  fieldProps?: Record<string, unknown>
  /** 透传给 `ElFormItem` 的属性。 */
  formItemProps?: Partial<FormItemProps> & Record<string, unknown>
}

/** 文本输入。 */
export type ProFormTextProps = ProFormFieldProps

/** 密码输入。 */
export type ProFormPasswordProps = ProFormFieldProps

/** 多行文本。 */
export type ProFormTextAreaProps = ProFormFieldProps

/** 数字输入。 */
export type ProFormDigitProps = ProFormFieldProps

/** 金额输入。 */
export type ProFormMoneyProps = ProFormFieldProps

/** 下拉选择。 */
export type ProFormSelectProps = ProFormFieldProps

/** 标签选择器。 */
export type ProFormTagProps = ProFormFieldProps

/** 树形选择。 */
export type ProFormTreeSelectProps = ProFormFieldProps

/** 级联选择。 */
export type ProFormCascaderProps = ProFormFieldProps

/** 日期选择。 */
export type ProFormDatePickerProps = ProFormFieldProps

/** 日期范围。 */
export type ProFormDateRangePickerProps = ProFormFieldProps

/** 日期时间。 */
export type ProFormDateTimePickerProps = ProFormFieldProps

/** 日期时间范围。 */
export type ProFormDateTimeRangePickerProps = ProFormFieldProps

/** 开关。 */
export type ProFormSwitchProps = ProFormFieldProps
