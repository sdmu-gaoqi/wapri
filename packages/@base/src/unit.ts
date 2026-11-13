/**
 * 尺寸归一化：数字按 `px` 处理，字符串（`12rem` / `40%`）原样返回。
 *
 * 组件里接 `number | string` 的尺寸配置时，直接写进 CSS 变量前先过一遍。
 */
export const toCssSize = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value)
