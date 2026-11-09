import { computed, inject, provide } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'

/**
 * 字段路径上下文。
 *
 * `ProFormList` 的每一行由 `ProFormListItem` 提供一份，行内字段组件把自身 `name` 拼到 `prefix` 之后，
 * 使值读写与 `ElFormItem.prop` 都落在 `model[listName][index][name]` 上。
 */
export interface ProFormPathContext {
  /** 当前行在 `ElForm.model` 中的路径前缀，例如 `['users', '0']`。 */
  prefix: string[]
  /** 列表级只读，行内字段未显式传值时继承。 */
  readonly?: boolean
  /** 列表级禁用，行内字段未显式传值时继承。 */
  disabled?: boolean
}

export const proFormPathKey: InjectionKey<ComputedRef<ProFormPathContext>> = Symbol('proFormPathKey')

/** 表单级只读，由 `ProForm` 提供，字段组件未显式传 `readonly` 时继承。 */
export const proFormReadonlyKey: InjectionKey<ComputedRef<boolean>> = Symbol('proFormReadonlyKey')

/** 表单级禁用，由 `ProForm` 提供，列表容器用它决定是否展示增删改操作。 */
export const proFormDisabledKey: InjectionKey<ComputedRef<boolean | undefined>> = Symbol('proFormDisabledKey')

/** 读取最近的字段路径上下文；不在 `ProFormList` 内时返回 `undefined`。 */
export const useProFormPath = (): ComputedRef<ProFormPathContext> | undefined => inject(proFormPathKey, undefined)

/** 读取表单级只读；不在 `ProForm` 内时返回 `undefined`。 */
export const useProFormReadonly = (): ComputedRef<boolean> | undefined => inject(proFormReadonlyKey, undefined)

/** 读取表单级禁用；不在 `ProForm` 内时返回 `undefined`。 */
export const useProFormDisabled = (): ComputedRef<boolean | undefined> | undefined =>
  inject(proFormDisabledKey, undefined)

/** 供 `ProFormListItem` 向下提供路径上下文；传 getter 以保证行下标变化时同步。 */
export const provideProFormPath = (source: () => ProFormPathContext): void => {
  provide(proFormPathKey, computed(source))
}
