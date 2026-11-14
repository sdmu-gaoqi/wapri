import {
  TOS_IMAGE_MAX_SIZE,
  TOS_IMAGE_PROCESS_KEY,
  TOS_IMAGE_PROCESS_PREFIX,
  TOS_IMAGE_QUALITY_RANGE,
} from './constant/image'
import type { TosImageProcessOptions } from './types/image'

/** 带协议的地址，如 `http:`、`data:`、`blob:`、`file:` */
const SCHEME_REG = /^[a-z][a-z0-9+.-]*:/i

/**
 * 能否在地址后面追加 query。
 *
 * 相对路径、绝对路径、object key、协议相对地址（`//cdn/xx.jpg`）都可以直接拼；
 * 只有带协议且不是 http(s) 的地址（`data:`、`blob:`、`file:` 等）拼了会失效，需要原样返回。
 */
const canAppendQuery = (value: string) => !SCHEME_REG.test(value) || /^https?:/i.test(value)

/** 像素值归一化到 [1, TOS_IMAGE_MAX_SIZE]，非法值返回 undefined 表示不参与处理 */
const toPixels = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }

  return Math.min(Math.max(Math.round(value), 1), TOS_IMAGE_MAX_SIZE)
}

/** 质量归一化到 [1, 100]，非法值返回 undefined 表示不参与处理 */
const toQuality = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }

  return Math.min(Math.max(Math.round(value), TOS_IMAGE_QUALITY_RANGE.min), TOS_IMAGE_QUALITY_RANGE.max)
}

/** 拆出 base / query / hash，query 不含 `?`，hash 含 `#` */
const splitHref = (href: string) => {
  const hashIndex = href.indexOf('#')
  const hash = hashIndex > -1 ? href.slice(hashIndex) : ''
  const rest = hashIndex > -1 ? href.slice(0, hashIndex) : href
  const queryIndex = rest.indexOf('?')

  return {
    base: queryIndex > -1 ? rest.slice(0, queryIndex) : rest,
    query: queryIndex > -1 ? rest.slice(queryIndex + 1) : '',
    hash,
  }
}

/** query 串切成 `key=value` 数组 */
const toParams = (query: string) => (query ? query.split('&').filter(Boolean) : [])

const getParamKey = (param: string) => {
  const index = param.indexOf('=')

  return index === -1 ? param : param.slice(0, index)
}

const getParamValue = (param: string) => {
  const index = param.indexOf('=')

  return index === -1 ? '' : param.slice(index + 1)
}

/**
 * 拼图片处理串，例如 `image/resize,w_300/format,webp`。
 *
 * 参数顺序固定为「自适应方向 → 缩放 → 质量 → 格式」，格式转换放最后，
 * 保证输出的是目标格式，而不是缩放过程中的中间图。
 *
 * @param options 处理参数，全部为空时返回空串
 * @returns 可直接放进 `x-tos-process` 的处理串
 */
export const buildTosImageProcess = (options: TosImageProcessOptions = {}): string => {
  const {
    width,
    height,
    longEdge,
    shortEdge,
    resizeMode,
    quality,
    qualityType = 'absolute',
    format,
    autoOrient = false,
  } = options
  const w = toPixels(width)
  const h = toPixels(height)
  const l = toPixels(longEdge)
  const s = toPixels(shortEdge)
  const hasBox = w !== undefined || h !== undefined
  const hasEdge = !hasBox && (l !== undefined || s !== undefined)

  const actions: string[] = []

  if (autoOrient) {
    actions.push('auto-orient,1')
  }

  if (hasBox || hasEdge) {
    const params: string[] = []

    if (hasBox) {
      if (w !== undefined) {
        params.push(`w_${w}`)
      }
      if (h !== undefined) {
        params.push(`h_${h}`)
      }
    } else {
      if (l !== undefined) {
        params.push(`l_${l}`)
      }
      if (s !== undefined) {
        params.push(`s_${s}`)
      }
    }

    if (resizeMode) {
      params.push(`m_${resizeMode}`)
    }

    actions.push(`resize,${params.join(',')}`)
  }

  const q = toQuality(quality)

  if (q !== undefined) {
    actions.push(`quality,${qualityType === 'relative' ? 'q' : 'Q'}_${q}`)
  }

  if (format) {
    actions.push(`format,${format}`)
  }

  return actions.length ? `${TOS_IMAGE_PROCESS_PREFIX}/${actions.join('/')}` : ''
}

/**
 * 给 tos 图片地址加上处理参数，返回新的地址。
 *
 * 完整 URL、相对路径、object key、协议相对地址都支持，不要求带域名。
 *
 * - 已有 `x-tos-process` 会被替换，避免两个处理串叠加
 * - 其余 query 参数与 `#hash` 原样保留
 * - `data:` / `blob:` 等非 http(s) 协议的地址、或没有任何处理参数时原样返回
 *
 * @param url 图片地址，可以是完整 URL，也可以是相对路径或 object key
 * @param options 处理参数
 */
export const withTosImageProcess = (url: string, options?: TosImageProcessOptions): string => {
  if (!url || !canAppendQuery(url)) {
    return url
  }

  const process = buildTosImageProcess(options)

  if (!process) {
    return url
  }

  const { base, query, hash } = splitHref(url)
  const params = toParams(query).filter((param) => getParamKey(param) !== TOS_IMAGE_PROCESS_KEY)

  params.push(`${TOS_IMAGE_PROCESS_KEY}=${process}`)

  return `${base}?${params.join('&')}${hash}`
}

/**
 * 读取地址上已有的处理串，便于在原有处理上追加逻辑。
 *
 * @param url 图片地址
 * @returns 处理串，没有返回空串
 */
export const getTosImageProcess = (url: string): string => {
  if (!url) {
    return ''
  }

  const { query } = splitHref(url)
  const param = toParams(query).find((item) => getParamKey(item) === TOS_IMAGE_PROCESS_KEY)

  return param ? getParamValue(param) : ''
}

/**
 * 去掉地址上的处理参数，还原为原图地址。
 *
 * @param url 图片地址
 */
export const removeTosImageProcess = (url: string): string => {
  if (!url) {
    return url
  }

  const { base, query, hash } = splitHref(url)
  const params = toParams(query).filter((param) => getParamKey(param) !== TOS_IMAGE_PROCESS_KEY)

  return `${base}${params.length ? `?${params.join('&')}` : ''}${hash}`
}
