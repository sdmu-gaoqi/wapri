import { isEmpty } from 'lodash-es'

export const obj2url = (obj: any): string => {
  const urls = []
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      let value = obj[k]
      if (value === '' || value === undefined || value === null) {
        continue
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      value = encodeURIComponent(value)
      urls.push(`${k}=${value}`)
    }
  }

  const str = urls.join('&')
  return str
}

const parse = (url: string) => {
  const reg = /([^?=&]+)=([^?=&]+)/g
  const arr = url.match(reg) || []
  const obj = {} as Record<string, string>
  arr.forEach((item) => {
    const res = item.split('=')
    obj[res[0]] = ['undefined', 'null'].includes(res[1]) ? '' : decodeURIComponent(res[1])
  })
  return obj
}
export function getUrlParam(key: string, params?: string): string
export function getUrlParam(): Record<string, string>

export function getUrlParam(key?: string, params?: string) {
  if (!params) {
    const url = window.location.search || window.location.hash
    if (url.indexOf('?') !== -1) {
      params = url
    }
    if (!params) {
      return key ? undefined : {}
    }
  }
  const index = params.indexOf('?')
  if (index > -1) {
    params = params.slice(1 + index)
  }

  const obj = parse(params)

  return key ? obj[key] : obj
}

export const removeUrlParams = (keys: string[]) => {
  const urlParams = getUrlParam()
  keys.forEach((i) => delete urlParams[i])
  const searchStr = obj2url(urlParams)
  const search = isEmpty(searchStr) ? '' : `?${obj2url(urlParams)}`

  history.replaceState(null, '', `${location.href.replace(location.search, search)}`)
}

export type UrlParamValue = any
export type UrlParams = Record<string, UrlParamValue>

/** 拆出地址的 base（不含 query）与 query 串，兼容 hash 路由（如 `/#/home?page=1`）。 */
const splitUrl = (href: string) => {
  const hashIndex = href.indexOf('#')
  if (hashIndex > -1) {
    const hash = href.slice(hashIndex)
    const hashQueryIndex = hash.indexOf('?')
    if (hashQueryIndex > -1) {
      return { base: href.slice(0, hashIndex) + hash.slice(0, hashQueryIndex), query: hash.slice(hashQueryIndex) }
    }
  }
  const queryIndex = href.indexOf('?')
  if (queryIndex > -1) {
    return { base: href.slice(0, queryIndex), query: href.slice(queryIndex) }
  }
  return { base: href, query: '' }
}

/**
 * 通过 history.replaceState 修改地址栏参数，不触发页面刷新。
 *
 * - 同名参数以传入值为准，未传入的原有参数保持不变
 * - 值为 `null` / `undefined` / `''` 时删除该参数
 * - hash 路由（`/#/home?page=1`）时参数写在 hash 内
 *
 * @param params 需要合并进地址的参数
 * @param url 目标地址，默认为当前页面地址
 * @returns 替换后的完整地址
 */
export function replaceUrl(params: UrlParams, url?: string): string {
  const href = url || (typeof window === 'undefined' ? '' : window.location.href)
  const { base, query } = splitUrl(href)
  const searchStr = obj2url({ ...parse(query), ...params })
  const newUrl = searchStr ? `${base}?${searchStr}` : base

  if (typeof window !== 'undefined' && typeof window.history?.replaceState === 'function') {
    window.history.replaceState(window.history.state, '', newUrl)
  }

  return newUrl
}
