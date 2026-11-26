---
nav:
  title: vant-pro
  order: 0
toc: false
title: 简介
group:
  order: -10
---

# vant-pro

`@wapri/vant-pro` 是基于 Vue 3 + Vant 4 的**业务无关** H5 组件库：组件内部不 import 任何接口、store、路由或业务常量，取图、跳转、上传这些外部行为全部通过 props（含函数类型 props）与 emits 注入。

## 安装

```bash
pnpm add @wapri/vant-pro vant vue
```

`vant`（`^4.9`）与 `vue`（`^3.4`）是 `peerDependencies`，本包不安装、不打包它们，避免出现两份实例。Vant 的样式由宿主引入：

```ts
import 'vant/lib/index.css'
```

## 引入方式

全量注册，插件按各组件 `defineOptions({ name })` 的名字注册：

```ts
import { createApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import WaVantPro from '@wapri/vant-pro'

createApp(App).use(Vant).use(WaVantPro).mount('#app')
```

按需引入：

```ts
import { WaFilterBar, WaUpload, type UploadFileItem } from '@wapri/vant-pro'
```

也可以直接引单个 SFC，打包时只会带上用到的组件：

```ts
import WaUpload from '@wapri/vant-pro/src/components/upload/WaUpload.vue'
```

每个组件的样式都写在各自的 `<style scoped>` 里，随组件一起进产物，**不需要额外引 CSS**；`src/styles/index.css` 只是可选的公共变量与基础类，不引也有兜底颜色。

## 通用约定

- **BEM + `wa-mobile-` 前缀**：`wa-mobile-upload`、`wa-mobile-upload__item`、`wa-mobile-upload--disabled`、`wa-mobile-filter-bar__field`
- **受控**：`v-model` 类组件只 emit 新值，绝不在内部 `splice` / `push`，父组件不接也能保持只读展示
- **主题**：颜色、圆角优先读 `--wa-mobile-*`，默认值再引用 Vant 的 `--van-*`，宿主换肤时自动跟随

```css
:root {
  --wa-mobile-color-primary: #ff6a00;
  --wa-mobile-radius: 24rpx;
}
```

- **类型**：`defineProps<...>()` / `defineEmits<...>()` 一律 type-based，对外类型集中在各组件目录的 `types.ts` 并从包入口导出

## 单位与适配

样式统一按 **750 设计稿写 `rpx`**，构建时换算成 rem（`1rem = 32rpx`）：375 宽度下 32rpx 正好是 16px，640rpx 就是 320px。

宿主用 `postcss-pxtorem` 打开 `rpx` 即可，配置与文档站一致：

```ts
import postcssPxtorem from 'postcss-pxtorem'

postcssPxtorem({
  rootValue: 32,
  unit: 'rpx', // 只换算 rpx，node_modules 里 Vant / dumi 的 px 不受影响
  propList: ['*'],
  replace: true,
  mediaQuery: false,
})
```

再让根字号跟着视口走（上限 750，避免桌面端被放大）：

```ts
const applyRootSize = () => {
  const width = Math.min(document.documentElement.clientWidth, 750)
  document.documentElement.style.fontSize = `${(width / 750) * 32}px`
}

applyRootSize()
window.addEventListener('resize', applyRootSize)
```

文档站本身没有装 `postcss-pxtorem`，同一套换算由 `scripts/postcss-rpx.ts`（文档站的 PostCSS 插件）完成，效果一致。

## 宿主接入要点

1. `vant` 必须由宿主提供，并在入口 `import 'vant/lib/index.css'`：`WaUpload` 的动作面板、`showToast` 等都依赖 Vant 的组件与样式。
2. 以工作区源码消费（本包当前以 `src` 作为入口）时，Vite 需要两条别名，否则 `vant` 会去组件库所在仓库找：

```ts
resolve: {
  alias: {
    '@wapri/vant-pro': 'D:/path/to/wapri/packages/vant-pro/src',
    vant: fileURLToPath(new URL('./node_modules/vant', import.meta.url)),
  },
  dedupe: ['vue', 'vant', '@vant/use'],
}
```

3. `tsconfig` 的 `paths` 同步这两条映射，`vue-tsc` 才能解析组件库源码里的 `vant` 类型。
4. 组件只用到 `Object.entries`、`padStart`、`Number.isFinite` 等 ES2017 能力，低构建目标（`safari12` / `chrome74`）不需要额外 polyfill。
