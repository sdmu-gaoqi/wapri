import type { TabFormItemRegistration } from './context'

/**
 * 按声明顺序逐个校验分段，返回校验失败的分段名（保持声明顺序）。
 *
 * 串行而非并行：需要「第一个出错的 tab」，串行天然有序；分段数量通常在 10 以内，开销可忽略。
 */
export const collectInvalidTabs = async (items: TabFormItemRegistration[]): Promise<string[]> => {
  const invalid: string[] = []
  for (const item of items) {
    const form = item.getForm()
    if (!form) continue
    const ok = await form
      .validate()
      .then(() => true)
      .catch(() => false)
    if (!ok) invalid.push(item.name)
  }
  return invalid
}

/** 把 `model` 浅拷贝成提交值，避免业务在回调里改到表单内部状态。 */
export const snapshotModel = (model: Record<string, unknown>): Record<string, unknown> => ({ ...model })

/** 尺寸归一化：数字按 `px` 处理，字符串（`12rem` / `40%`）原样返回。 */
export const toCssSize = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value)
