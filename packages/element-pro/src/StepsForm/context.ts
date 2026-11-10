import { inject } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'
import type { StepProps } from 'element-plus'
import type { ProFormAction, ProFormProps } from '../ProForm'

/** 步骤向内层注册的信息。 */
export interface StepsFormStepRegistration {
  /** 步骤标识，同一容器内唯一。 */
  name: string
  /** 读取步骤条标题。 */
  getTitle: () => string | undefined
  /** 读取步骤条描述。 */
  getDescription: () => string | undefined
  /** 读取步骤条图标。 */
  getIcon: () => StepProps['icon']
  /** 该步骤自己的数据对象，由 `StepsFormStep` 创建。 */
  model: Record<string, unknown>
  /** 读取最新的表单实例（实例挂载后才可用，因此用 getter）。 */
  getForm: () => ProFormAction | undefined
  /** 进入下一步前的钩子，返回 `false` 阻止前进。 */
  runFinish: () => boolean | void | Promise<boolean | void>
}

/** 容器向下层提供的能力。 */
export interface StepsFormContext {
  /** 当前步骤，从 `0` 开始。 */
  current: ComputedRef<number>
  /** 容器级只读。 */
  readonly: ComputedRef<boolean>
  /** 容器级禁用。 */
  disabled: ComputedRef<boolean | undefined>
  /** 容器级表单配置，步骤未显式设置时生效。 */
  formProps: ComputedRef<Partial<Omit<ProFormProps, 'model' | 'onFinish'>>>
  /** 注册步骤，返回注销函数。 */
  registerStep: (step: StepsFormStepRegistration) => () => void
  /** 指定 `name` 的步骤当前是否可见。 */
  isActive: (name: string) => boolean
}

export const stepsFormContextKey: InjectionKey<StepsFormContext> = Symbol('stepsFormContextKey')

/** 读取分步表单上下文；不在 `StepsForm` 内时返回 `undefined`。 */
export const useStepsFormContext = (): StepsFormContext | undefined => inject(stepsFormContextKey, undefined)
