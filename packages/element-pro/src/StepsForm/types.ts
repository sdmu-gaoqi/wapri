import type { StepsProps, StepProps } from 'element-plus'
import type { ProFormAction, ProFormProps } from '../ProForm'

/** 分步表单的按钮文案配置。 */
export interface StepsFormSubmitter {
  /** 上一步按钮文案。 */
  previousText?: string
  /** 下一步按钮文案。 */
  nextText?: string
  /** 提交按钮文案。 */
  submitText?: string
  /** 是否展示上一步按钮，默认 `true`。 */
  showPrevious?: boolean
  /** 是否展示下一步按钮，默认 `true`。 */
  showNext?: boolean
  /** 是否展示提交按钮，默认 `true`。 */
  showSubmit?: boolean
}

/** 分步表单容器。 */
export interface StepsFormProps {
  /** 当前步骤，从 `0` 开始；传入时受控，配合同名事件更新。 */
  current?: number
  /** 非受控模式下的初始步骤，默认 `0`。 */
  defaultCurrent?: number
  /** 是否允许点击步骤条切换，默认 `false`；切换时不触发校验。 */
  allowStepSelect?: boolean
  /** 透传给 `ElSteps` 的属性，如 `direction: 'vertical'`。 */
  stepsProps?: Partial<StepsProps>
  /** 底部按钮配置；传 `false` 不渲染内置按钮。 */
  submitter?: false | StepsFormSubmitter
  /** 全部步骤只读；步骤显式传值时以步骤为准。 */
  readonly?: boolean
  /** 全部步骤禁用；步骤显式传值时以步骤为准。 */
  disabled?: boolean
  /** 每步提交前的公共配置，可被 `StepsFormStep` 上的同名属性覆盖。 */
  formProps?: Partial<Omit<ProFormProps, 'model'>>
  /**
   * 最后一步提交成功时触发，参数是各步骤合并后的字段值。
   * 返回 `false` 时不重置表单、不回到第一步。
   */
  onFinish?: (values: Record<string, unknown>) => boolean | void | Promise<boolean | void>
}

/** 单个步骤，除 `name` 外的表单配置与 `ProForm` 一致。 */
export interface StepsFormStepProps extends Omit<ProFormProps, 'model'> {
  /** 步骤标识，同一 `StepsForm` 内必须唯一。 */
  name: string
  /** 步骤条标题。 */
  title?: string
  /** 步骤条描述。 */
  description?: string
  /** 步骤条图标。 */
  icon?: StepProps['icon']
  /** 本步骤的初始值，挂载时写入；已存在的键不覆盖。 */
  initialValues?: Record<string, unknown>
  /** 本步骤完成时触发，返回 `false` 阻止进入下一步。 */
  onFinish?: (values: Record<string, unknown>) => boolean | void | Promise<boolean | void>
}

/** `StepsForm` 暴露给父组件的方法。 */
export interface StepsFormAction {
  /** 当前步骤，从 `0` 开始。 */
  current: number
  /** 前进到下一步；最后一步等价于 `submit()`。校验失败时返回 `false`。 */
  next: () => Promise<boolean>
  /** 返回上一步，不触发校验。 */
  prev: () => void
  /** 校验当前步骤并提交，`onFinish` 返回 `false` 时返回 `false`。 */
  submit: () => Promise<boolean>
  /** 重置全部步骤并回到第一步。 */
  resetFields: () => void
  /** 合并各步骤字段值，不触发校验。 */
  getAllFieldsValue: () => Record<string, unknown>
  /** 取指定步骤的表单实例；不传 name 时取当前步骤。 */
  getFormInstance: (name?: string) => ProFormAction | undefined
}
