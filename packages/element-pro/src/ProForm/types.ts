import type { FormInstance, FormProps } from 'element-plus'

/** `ProForm` 暴露给父组件的方法。 */
export interface ProFormAction {
  /** 校验全部字段，失败时 reject 字段错误。 */
  validate: FormInstance['validate']
  /** 校验指定字段。 */
  validateField: FormInstance['validateField']
  /** 重置字段到挂载时的初始值并清除校验。 */
  resetFields: FormInstance['resetFields']
  /** 清除指定字段或全部字段的校验。 */
  clearValidate: FormInstance['clearValidate']
  /** 滚动到指定字段。 */
  scrollToField: FormInstance['scrollToField']
  /** 底层 `ElForm` 实例。 */
  formRef: FormInstance | undefined
}

export interface ProFormProps {
  /** 表单数据对象，字段组件通过 `name` 读写它。 */
  model: Record<string, unknown>
  /** 表单级校验规则，与字段自身 `rules` 合并生效。 */
  rules?: FormProps['rules']
  /** 标签宽度；不传时沿用 `ElForm` 默认值，也可通过 `formProps.labelWidth` 设置。 */
  labelWidth?: string | number
  /** 标签位置。 */
  labelPosition?: FormProps['labelPosition']
  /** 标签后缀。 */
  labelSuffix?: string
  /** 是否行内表单。 */
  inline?: boolean
  /** 是否禁用全部字段。 */
  disabled?: boolean
  /** 是否只读：所有字段渲染纯文本。 */
  readonly?: boolean
  /** 控件尺寸。 */
  size?: FormProps['size']
  /** 是否展示校验错误信息。 */
  showMessage?: boolean
  /** 是否隐藏必填星号。 */
  hideRequiredAsterisk?: boolean
  /** 必填星号位置。 */
  requireAsteriskPosition?: FormProps['requireAsteriskPosition']
  /** 校验失败时是否滚动到第一个错误字段。 */
  scrollToError?: boolean
  /** 透传给 `ElForm` 的其余属性。 */
  formProps?: Partial<Omit<FormProps, 'model' | 'rules'>>
}
