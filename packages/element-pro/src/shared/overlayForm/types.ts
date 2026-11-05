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
