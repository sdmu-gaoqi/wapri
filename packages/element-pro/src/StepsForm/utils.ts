/**
 * 合并各步骤的数据对象。
 *
 * 浅合并：后声明的步骤覆盖先声明步骤的同名键；嵌套对象保持引用，不做深拷贝。
 */
export const mergeStepValues = (models: Record<string, unknown>[]): Record<string, unknown> =>
  models.reduce<Record<string, unknown>>((merged, model) => Object.assign(merged, model), {})

/** 把初始值写入数据对象，已存在的键不覆盖。 */
export const applyInitialValues = (model: Record<string, unknown>, initialValues?: Record<string, unknown>): void => {
  if (!initialValues) return
  for (const [key, value] of Object.entries(initialValues)) {
    if (model[key] === undefined) model[key] = value
  }
}
