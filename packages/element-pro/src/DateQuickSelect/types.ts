export type DateQuickSelectValue = string | [string, string]
export type DateQuickSelectValueType = 'date' | 'dateRange' | 'time' | 'timeRange'

/** 日期快捷选择配置。设为 false 可隐藏全部快捷项。 */
export interface DateQuickSelectConfig {
  /** 是否展示“昨天”，默认 false。 */
  showYesterday?: boolean
  /** 是否展示“今天”，默认 true。 */
  showToday?: boolean
  /** 范围选择器的“近 n 天”选项，默认 [7, 30]。 */
  recentDays?: number[]
}

export interface DateQuickSelectSelection {
  /** 快捷项标识：yesterday、today 或 recent-{天数}。 */
  key: string
  /** 快捷项显示名称。 */
  label: string
  /** 快捷项对应的值。 */
  value: DateQuickSelectValue
}
