import type { CheckCardGroupValue, CheckCardValue } from './types'

export function isChecked(current: CheckCardGroupValue, value: CheckCardValue): boolean {
  return Array.isArray(current) ? current.includes(value) : current === value
}

export function toggleValue(
  current: CheckCardGroupValue,
  value: CheckCardValue,
  multiple: boolean,
): CheckCardGroupValue {
  if (!multiple) return current === value ? null : value
  const values = Array.isArray(current) ? current : current === null ? [] : [current]
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}
