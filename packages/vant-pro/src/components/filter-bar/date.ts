import type { DateShortcut, FilterDateType } from './types'

/** 日期工具：筛选栏所有日期都以字符串流转，这里只做计算与格式统一 */

const pad = (value: number): string => String(value).padStart(2, '0')

/** 统一输出格式：date → YYYY-MM-DD，datetime → YYYY-MM-DD HH:mm:ss，month → YYYY-MM */
export const formatDate = (date: Date, dateType: FilterDateType = 'date'): string => {
  const ymd = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (dateType === 'month') return ymd.slice(0, 7)
  if (dateType === 'datetime') {
    return `${ymd} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }
  return ymd
}

const shiftDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** 快捷项固定产出 YYYY-MM-DD，用之前按字段精度补齐或截断，避免同一字段出现两种格式 */
export const coerceToDateType = (value: string, dateType: FilterDateType, edge: 'start' | 'end' = 'start'): string => {
  if (!value) return ''
  if (dateType === 'month') return value.slice(0, 7)
  if (dateType === 'datetime') {
    // 只有日期时按区间边界补时间：结束取 23:59:59，否则「近 7 天」会漏掉今天
    return value.length > 10 ? value.slice(0, 19) : `${value} ${edge === 'end' ? '23:59:59' : '00:00:00'}`
  }
  return value.slice(0, 10)
}

/**
 * 内置快捷项。
 * 数组每次调用都新建：跨天不刷新页面时，点开「近 7 天」仍能拿到当天为基准的区间。
 */
export const createDefaultShortcuts = (): DateShortcut[] => [
  {
    name: '今日',
    range: () => {
      const today = formatDate(new Date())

      return [today, today]
    },
  },
  {
    name: '昨日',
    range: () => {
      const yesterday = formatDate(shiftDays(new Date(), -1))

      return [yesterday, yesterday]
    },
  },
  {
    name: '近7天',
    range: () => {
      const now = new Date()

      return [formatDate(shiftDays(now, -6)), formatDate(now)]
    },
  },
  {
    name: '近30天',
    range: () => {
      const now = new Date()

      return [formatDate(shiftDays(now, -29)), formatDate(now)]
    },
  },
]

/** 摘要文案：有快捷项用快捷项名字，否则回落到 start ~ end */
export const formatRangeText = (start: string, end: string): string => {
  if (!start && !end) return ''
  if (!start || !end) return start || end
  if (start === end) return start
  return `${start} ~ ${end}`
}
