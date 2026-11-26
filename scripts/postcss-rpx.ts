/**
 * 文档站的 rpx → rem 转换插件。
 *
 * `@wapri/vant-pro` 的样式统一按 750 设计稿写 rpx，构建时换算成 rem：
 * `rootValue: 32` 表示「32rpx = 1rem」，文档站再把根字号设成 `视口宽 / 750 * 32`，
 * 于是 375 视口下 1rem = 16px，2rpx 正好等于 1px，与设计稿等宽。
 *
 * 只处理 rpx：node_modules 里的 Vant / dumi 样式都是 px，天然不受影响；
 * 引用方（业务 H5）用同一份配置即可复现文档站的效果。
 */

/** 只声明用到的那部分 PostCSS 节点，避免把 postcss 变成直接依赖 */
interface PostcssDeclaration {
  value: string
}

interface PostcssAtRule {
  params: string
}

interface PostcssRoot {
  walkDecls: (callback: (decl: PostcssDeclaration) => void) => void
  walkAtRules: (callback: (rule: PostcssAtRule) => void) => void
}

interface PostcssHelpers {
  result: { opts: { from?: string } }
}

export interface RpxToRemOptions {
  /** 多少 rpx 等于 1rem，默认 32（750 设计稿） */
  rootValue?: number
  /** 换算后保留的小数位，默认 5 */
  precision?: number
  /** 命中的文件跳过转换，默认跳过 node_modules */
  exclude?: (file: string) => boolean
}

/** `url()`、引号里的内容原样保留，只换算裸露的 rpx 数值（`content`、图片路径不会被误改） */
const RPX_PATTERN = /url\([^)]*\)|"[^"]*"|'[^']*'|(-?\d*\.?\d+)rpx/g

export const createRpxToRemPlugin = (options: RpxToRemOptions = {}) => {
  const rootValue = options.rootValue ?? 32
  const precision = options.precision ?? 5
  const exclude = options.exclude ?? ((file: string) => file.includes('node_modules'))

  const convert = (value: string): string =>
    value.replace(RPX_PATTERN, (match: string, amount: string | undefined) => {
      if (amount === undefined) return match

      const rem = Number(amount) / rootValue

      return `${Number(rem.toFixed(precision))}rem`
    })

  return {
    postcssPlugin: 'postcss-rpx-to-rem',
    Once(root: PostcssRoot, helpers: PostcssHelpers) {
      if (exclude(helpers.result.opts.from ?? '')) return

      root.walkDecls((decl) => {
        if (!decl.value.includes('rpx')) return

        decl.value = convert(decl.value)
      })

      root.walkAtRules((rule) => {
        if (!rule.params.includes('rpx')) return

        rule.params = convert(rule.params)
      })
    },
  }
}
