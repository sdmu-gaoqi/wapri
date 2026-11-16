/** 组件名归一化：忽略大小写与分隔符，`DragSortTable` 与 `drag-sort-table` 视为同一个名字。 */
export const normalizeName = (value: string): string => value.replace(/[\s_-]/g, '').toLowerCase()

/** `ProFormFields` → `pro-form-fields`，与文档目录名对齐。 */
export const toKebab = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()

/** 取路径的最后一段，用于「文件不存在」时给候选。 */
export const getBaseName = (value: string): string => value.slice(value.lastIndexOf('/') + 1)

/** 两个字符串的公共前缀长度，用于挑最相近的候选路径。 */
export const commonPrefixLength = (a: string, b: string): number => {
  let index = 0
  while (index < a.length && index < b.length && a[index] === b[index]) index += 1
  return index
}
