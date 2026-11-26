---
title: WaVH100 视口高度容器
group:
  title: 布局
  order: 6
---

# WaVH100 视口高度容器

高度等于当前视口高度的容器，监听 `resize` 实时更新，避开移动端地址栏收起后 `100vh` 留白的问题。内部用 `@wapri/ghooks` 的 `useVh100`。

<code src="./demo/basic.vue" iframe="640"></code>

## 何时使用

- 页面骨架要「一屏铺满」，滚动交给容器内部。
- 移动端 H5 需要按真实视口高度排版，而不是 CSS 的 `100vh`。

## 如何使用

```vue | pure
<template>
  <WaVH100 class="page">
    <header>标题</header>
    <main>内容超出一屏时容器自己滚动</main>
  </WaVH100>
</template>

<script setup lang="ts">
import { WaVH100 } from '@wapri/vant-pro'
</script>
```

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `style` | `CSSProperties` | — | 追加样式，与组件算出的高度合并；想固定高度时直接覆盖 `height` |
| `class` | `string` | — | 追加类名，与根类 `wa-mobile-vh100` 合并 |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 容器内容 |

## 注意

- 高度取 `window.innerHeight`，SSR 首屏是 `0`，挂载后才拿到真实值。
- 根元素带 `overflow: auto`，内容超出一屏时在容器内部滚动，不会把页面撑高。
