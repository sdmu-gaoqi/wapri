import { inject } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ProFormAction, ProFormProps } from '../ProForm'

/** 分段向内层注册的信息。 */
export interface TabFormItemRegistration {
  /** 分段标识，同一容器内唯一。 */
  name: string
  /** 读取 tab 标题。 */
  getTitle: () => string | undefined
  /** 读取 tab 是否禁用。 */
  getTabDisabled: () => boolean
  /** 读取最新的表单实例（实例挂载后才可用，因此用 getter）。 */
  getForm: () => ProFormAction | undefined
}

/** 注册结果：`accepted` 为 `false` 表示 `name` 重复，分段不应渲染。 */
export interface TabFormRegisterResult {
  accepted: boolean
  unregister: () => void
}

/** 容器向下层提供的能力。 */
export interface TabFormContext {
  /** 全部 tab 共享的数据对象。 */
  model: ComputedRef<Record<string, unknown>>
  /** 当前激活的 tab。 */
  active: ComputedRef<string | number | undefined>
  /** 容器级只读。 */
  readonly: ComputedRef<boolean>
  /** 容器级禁用。 */
  disabled: ComputedRef<boolean | undefined>
  /** 容器级表单配置，分段未显式设置时生效。 */
  formProps: ComputedRef<Partial<Omit<ProFormProps, 'model'>>>
  /** 最近一次提交校验失败的分段名。 */
  invalidTabs: ComputedRef<string[]>
  /** 注册分段，返回是否被接受与注销函数。 */
  registerItem: (item: TabFormItemRegistration) => TabFormRegisterResult
}

export const tabFormContextKey: InjectionKey<TabFormContext> = Symbol('tabFormContextKey')

/** 读取多 tab 表单上下文；不在 `TabForm` 内时返回 `undefined`。 */
export const useTabFormContext = (): TabFormContext | undefined => inject(tabFormContextKey, undefined)
