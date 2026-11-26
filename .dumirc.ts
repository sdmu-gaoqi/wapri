import { defineConfig } from 'dumi'

import { TextDecoder, TextEncoder } from 'util'
import { createRpxToRemPlugin } from './scripts/postcss-rpx'

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
    /*
     * 移动端 demo 的预览框。
     * demo 由 md 里的 `iframe` 指定高度，这里把宽度固定成 375，去掉 dumi 默认画的那圈「浏览器窗口」，
     * demo 内部的 rpx 由 extraPostCSSPlugins 换算成 rem，再跟着 headScripts 设置的根字号自适应。
     */
    `
    .dumi-default-previewer-demo[data-iframe] {
      display: flex;
      justify-content: center;
      padding: 20px 16px !important;
      border-top: 0 !important;
      background: #f7f8fa !important;
    }

    .dumi-default-previewer-demo[data-iframe]::before,
    .dumi-default-previewer-demo[data-iframe]::after {
      display: none !important;
      content: none !important;
    }

    .dumi-default-previewer-demo[data-iframe] iframe {
      display: block;
      width: 375px !important;
      max-width: 100%;
      margin: 0;
      border: 1px solid #ebedf0;
      border-radius: 12px;
      background: #fff;
      box-sizing: border-box;
    }
  `,
  ],
  /*
   * 移动端 demo 的根字号：750 设计稿下 32rpx = 1rem。
   * 只作用于 demo 文档（iframe 内或 /~demos/ 路由），文档站外壳保持浏览器默认字号。
   */
  headScripts: [
    `
    (function () {
      var inFrame = window.self !== window.top;
      var isDemoRoute = window.location.pathname.indexOf('/~demos/') >= 0;
      if (!inFrame && !isDemoRoute) return;
      var DESIGN_WIDTH = 750;
      var ROOT_VALUE = 32;
      var MAX_WIDTH = 750;
      function apply() {
        var width = document.documentElement.clientWidth || DESIGN_WIDTH;
        width = Math.min(width, MAX_WIDTH);
        document.documentElement.style.fontSize = (width / DESIGN_WIDTH) * ROOT_VALUE + 'px';
      }
      apply();
      window.addEventListener('resize', apply);
      window.addEventListener('orientationchange', apply);
    })();
    `,
  ],
  extraPostCSSPlugins: [
    // rpx → rem：unit 是 rpx，node_modules 里的 px 样式不会被误改
    createRpxToRemPlugin({ rootValue: 32 }),
  ],
  themeConfig: {
    name: SITE_NAME,
    logo: LOGO_PATH,
    footer: '',
    nav: [
      { title: '指南', link: '/guide' },
      { title: 'changelog', link: '/changelog/base' },
      { title: 'element-pro', link: '/element-pros' },
      { title: 'vant-pro', link: '/vant-pros' },
      { title: 'player', link: '/players' },
      { title: 'preview', link: '/previews' },
      { title: 'hooks', link: '/hooks' },
      { title: 'utils', link: '/utils' },
      { title: 'jsbridge', link: '/jsbridges' },
      { title: 'mcp', link: '/mcps' },
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
        type: 'vant-pro',
        dir: 'packages/vant-pro/src',
      },
      {
        // 组件实现与文档同在 src/components/<组件>/index.md，单独登记一层，
        // 让组件页落在 /vant-pros/<组件>，与包简介的 /vant-pros 并存
        type: 'vant-pro',
        dir: 'packages/vant-pro/src/components',
      },
      {
        type: 'preview',
        dir: 'packages/preview/src',
      },
      {
        type: 'player',
        dir: 'packages/player/src',
      },
      {
        type: 'mcp',
        dir: 'packages/mcp/src',
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
    '@wapri/vant-pro': `${process.cwd()}/packages/vant-pro/src`,
    '@wapri/preview': `${process.cwd()}/packages/preview/src`,
    '@wapri/gplayer': `${process.cwd()}/packages/player/src`,
    // mcp 是 Node 侧包（node:fs / node:url），只在文档里引用代码片段，不要在任何浏览器 demo 里 import
    '@wapri/mcp': `${process.cwd()}/packages/mcp/src`,
  },
  jsMinifierOptions: {
    target: ['chrome80', 'es2020'],
  },
  define: {
    'process.env.DEBUG': '1',
    // /mcps 页的「添加到我的项目」面板要按部署子路径去取 skills 静态文件
    '__DOC_PUBLIC_PATH__': BASE_PATH,
  },
})
