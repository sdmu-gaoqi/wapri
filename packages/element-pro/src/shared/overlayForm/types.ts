import type { DialogProps, DrawerProps, FormInstance, FormProps } from 'element-plus'

export interface OverlayFormProps {
  open?: boolean
  model: Record<string, unknown>
  title?: string
  formProps?: Partial<Omit<FormProps, 'model'>>
  onFinish?: (values: Record<string, unknown>) => boolean | void | Promise<boolean | void>
  submitText?: string
  cancelText?: string
  submitter?: boolean
  resetOnClose?: boolean
  /** 只读：所有字段渲染纯文本。 */
  readonly?: boolean
  /** 标签宽度，透传给内部表单。 */
  labelWidth?: string | number
}

export interface ModalFormProps extends OverlayFormProps {
  modalProps?: Partial<Omit<DialogProps, 'modelValue'>>
}

export interface DrawerFormProps extends OverlayFormProps {
  drawerProps?: Partial<Omit<DrawerProps, 'modelValue'>>
}

export interface OverlayFormAction {
  submit: () => Promise<boolean>
  resetFields: () => void
  validate: () => ReturnType<FormInstance['validate']> | undefined
  clearValidate: FormInstance['clearValidate']
}
