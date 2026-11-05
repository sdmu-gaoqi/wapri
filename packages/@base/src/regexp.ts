import { regexpEmail, regexpPhone } from './constant/regexp'

/**
 * 校验邮箱
 * 正则构造或匹配失败（如浏览器不支持对应语法）时返回 false，不向上抛错
 * @param value 待校验的值
 */
export const isEmail = (value?: string | null): boolean => {
  try {
    return regexpEmail().test(value ?? '')
  } catch {
    return false
  }
}

/**
 * 校验手机号（中国大陆 11 位）
 * 正则构造或匹配失败（如浏览器不支持对应语法）时返回 false，不向上抛错
 * @param value 待校验的值
 */
export const isPhone = (value?: string | null): boolean => {
  try {
    return regexpPhone().test(value ?? '')
  } catch {
    return false
  }
}
