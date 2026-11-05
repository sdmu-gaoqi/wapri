import { isUndefined, isNull } from 'lodash-es'

export const tryParse = <T>(value: string, backstop: T) => {
  if (isUndefined(value)) {
    return value
  }
  try {
    return JSON.parse(value) as T
  } catch (error) {
    return backstop
  }
}

export const safeString = (data: unknown) => {
  if (isNull(data) || isUndefined(data)) {
    return ''
  }
  return String(data)
}
