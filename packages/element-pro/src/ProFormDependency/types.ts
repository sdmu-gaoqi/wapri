/** 字段联动容器。 */
export interface ProFormDependencyProps {
  /**
   * 依赖的字段路径列表，每个元素是一个路径（`'profile.level'` 或 `'level'`）。
   *
   * 与字段组件的 `name` 区分：`name` 表示一个路径，`names` 表示多个路径。
   */
  names: string[]
}
