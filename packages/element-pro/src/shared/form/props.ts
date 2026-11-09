/**
 * 过滤值为 `undefined` 的键。
 *
 * Vue 认为「键存在」即已赋值：`v-bind` 展开后若某个键的值为 `undefined`，
 * 会跳过组件自身的默认值，也会短路 Element Plus 的表单级回退（例如 `disabled`）。
 */
export const omitUndefined = <T extends object>(source: T): Partial<T> => {
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) result[key as keyof T] = value
  }
  return result
}
