import { defineConfig } from 'dumi'

import { TextDecoder, TextEncoder } from 'util'

if (typeof window !== 'undefined') {
  if (!window.TextEncoder) {
    ;(window as any).TextEncoder = TextEncoder
  }

  if (!window.TextDecoder) {
    ;(window as any).TextDecoder = TextDecoder
  }
}

/** 文档站的部署子路径，默认部署在站点根目录；需要子路径时用 DOC_BASE_PATH 注入。 */
const rawBasePath = process.env.DOC_BASE_PATH || '/'
const BASE_PATH = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`

/** 站点品牌信息与代理目标都通过环境变量注入，仓库内不写死业务品牌与地址。 */
const SITE_NAME = process.env.DOC_SITE_NAME || 'wapri'
const SITE_TITLE = process.env.DOC_SITE_TITLE || 'wapri SDK'
const LOGO_PATH = `${BASE_PATH}${process.env.DOC_LOGO || 'logo.png'}`
const PROXY_TARGET = process.env.DOC_PROXY_TARGET || ''
/** 未配置代理目标时不注册代理，避免仓库内写死业务网关地址 */
const proxy = PROXY_TARGET
  ? {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
    }
  : undefined

export default defineConfig({
  outputPath: 'docs-dist',
  mfsu: false,
  // utoopack: {},
  presets: ['@dumijs/preset-vue'],
  styles: [
    `
    body {
    margin: 0;
    }
  `,
  ],
  themeConfig: {
    name: SITE_NAME,
    logo: LOGO_PATH,
    footer: '',
    nav: [
      { title: '指南', link: '/guide' },
      { title: 'changelog', link: '/changelog/base' },
      { title: 'element-pro', link: '/element-pros' },
      { title: 'player', link: '/players' },
      { title: 'preview', link: '/previews' },
      { title: 'hooks', link: '/hooks' },
      { title: 'utils', link: '/utils' },
      { title: 'jsbridge', link: '/jsbridges' },
    ],
    prefersColor: { default: 'auto', switch: true },
    hd: { rules: [] },
  },
  resolve: {
    atomDirs: [
      {
        type: 'utils',
        dir: 'packages/utils/src',
      },
      {
        type: 'jsbridge',
        dir: 'packages/jsbridge/src',
      },
      {
        type: 'jsbridge',
        dir: 'packages/jsbridge/src/registers',
      },
      {
        type: 'hooks',
        dir: 'packages/hooks/src',
      },
      {
        type: 'base',
        dir: 'packages/@base/src',
      },
      {
        type: 'element-pro',
        dir: 'packages/element-pro/src',
      },
      {
        type: 'preview',
        dir: 'packages/preview/src',
      },
      {
        type: 'player',
        dir: 'packages/player/src',
      },
    ],
  },
  favicons: [LOGO_PATH],
  base: BASE_PATH,
  publicPath: BASE_PATH,
  title: SITE_TITLE,
  metas: [
    { name: 'keywords', content: SITE_TITLE },
    { name: 'description', content: `${SITE_TITLE} 集成了 UI、Hooks 与公共函数` },
  ],
  // monorepoRedirect: {
  //   peerDeps: true,
  // },
  proxy,
  alias: {
    '@wapri/gbase': `${process.cwd()}/packages/@base/src`,
    '@wapri/gutils': `${process.cwd()}/packages/utils/src`,
    '@wapri/gjsbridge': `${process.cwd()}/packages/jsbridge/src`,
    '@wapri/ghooks': `${process.cwd()}/packages/hooks/src`,
    '@wapri/element-pro': `${process.cwd()}/packages/element-pro/src`,
    '@wapri/preview': `${process.cwd()}/packages/preview/src`,
    '@wapri/gplayer': `${process.cwd()}/packages/player/src`,
  },
  jsMinifierOptions: {
    target: ['chrome80', 'es2020'],
  },
  define: {
    'process.env.DEBUG': '1',
  },
})
