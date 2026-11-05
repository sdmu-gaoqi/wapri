import { dayjs } from '@wapri/gutils'
import type {
  DateQuickSelectConfig,
  DateQuickSelectSelection,
  DateQuickSelectValue,
  DateQuickSelectValueType,
} from './types'

export function isDateRangeValueType(valueType: DateQuickSelectValueType): boolean {
  return valueType === 'dateRange' || valueType === 'timeRange'
}

export function isSameDateQuickValue(value: unknown, target: DateQuickSelectValue): boolean {
  if (typeof target === 'string') return value === target
  return Array.isArray(value) && value.length === 2 && value[0] === target[0] && value[1] === target[1]
}

export function getDateQuickSelections({
  valueType,
  config,
  valueFormat,
}: {
  valueType: DateQuickSelectValueType
  config: DateQuickSelectConfig | false
  valueFormat?: string
}): DateQuickSelectSelection[] {
  if (config === false) return []

  const format =
    valueFormat ?? (valueType === 'time' || valueType === 'timeRange' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
  const range = isDateRangeValueType(valueType)
  const formatDate = (date: ReturnType<typeof dayjs>) => date.format(format)
  const quickDateValue = (daysAgo: number): string | [string, string] => {
    const date = dayjs().subtract(daysAgo, 'day')
    if (!range) return formatDate(date.startOf('day'))
    return [formatDate(date.startOf('day')), formatDate(date.endOf('day'))]
  }
  const recentDaysValue = (days: number): [string, string] => [
    formatDate(
      dayjs()
        .subtract(days - 1, 'day')
        .startOf('day'),
    ),
    formatDate(dayjs().endOf('day')),
  ]

  const options: DateQuickSelectSelection[] = []
  if (config.showYesterday === true) options.push({ key: 'yesterday', label: '昨天', value: quickDateValue(1) })
  if (config.showToday !== false) options.push({ key: 'today', label: '今天', value: quickDateValue(0) })
  if (range) {
    ;(config.recentDays ?? [7, 30])
      .filter((days) => Number.isInteger(days) && days > 0)
      .forEach((days) => {
        options.push({ key: `recent-${days}`, label: `近 ${days} 天`, value: recentDaysValue(days) })
      })
  }
  return options
}
