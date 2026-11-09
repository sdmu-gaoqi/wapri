import { toPath } from '@wapri/gutils'

/**
 * 字段路径。
 *
 * 一个 `name` 表示**一个**路径：`'profile.nickname'` 与 `['profile', 'nickname']` 等价。
 * 在 `ProFormList` 行内时是相对当前行的路径。
 */
export type ProFormFieldName = string | string[]

/**
 * 字段路径的数组形式。
 *
 * 统一用字符串分段：`ElFormItem.prop` 的类型是 `string | string[]`，
 * 而 `get` / `set` 对 `['users', '0', 'name']` 与 `['users', 0, 'name']` 等价。
 */
export type ProFormPath = string[]

/** 把 `name` 归一化为路径数组；未传 `name` 时返回空数组。 */
export const normalizePath = (name?: ProFormFieldName): ProFormPath => toPath(name) as ProFormPath

/** 把行前缀与字段自身路径拼成完整路径；无前缀时等价于 `normalizePath(name)`。 */
export const joinPath = (prefix: ProFormPath | undefined, name?: ProFormFieldName): ProFormPath => {
  const own = normalizePath(name)
  if (!prefix?.length) return own
  return [...prefix, ...own]
}
