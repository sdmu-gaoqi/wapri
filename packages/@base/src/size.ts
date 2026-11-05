import { default as Cookies } from 'js-cookie'

export const getSize = () => {
  return Cookies.get('size')
}
