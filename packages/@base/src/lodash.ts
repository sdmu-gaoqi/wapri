/* eslint-disable import/export */
export * from 'lodash-es'

// 覆写一些lodash方法
export const isObject = (item: any): boolean => {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

export const isNumber = (value: any) => typeof value === 'number' && !isNaN(value) && Math.abs(value) !== Infinity

export const isEmpty = (obj: any): boolean => {
  if (!obj && obj !== 0 && obj !== false) {
    return true
  }

  if (Object.prototype.toString.call(obj) === '[object Array]' && obj.length === 0) {
    return true
  }

  if (Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length === 0) {
    return true
  }

  return false
}
