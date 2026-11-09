import type { FormItemRule } from 'element-plus'

/** 判断一组规则里是否声明了必填。 */
export const hasRequiredRule = (rules?: FormItemRule | FormItemRule[]): boolean => {
  if (!rules) return false
  const list = Array.isArray(rules) ? rules : [rules]
  return list.some((rule) => rule.required === true)
}
