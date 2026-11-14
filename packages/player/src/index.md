---
nav:
  title: player
  order: 1
title: 简介
group:
  order: -10
---

# player

`@wapri/gplayer` 把 [artplayer](https://artplayer.org) 封装成 Vue 3 组件：`<VideoPlayer>` 一个标签就能播，卸载时实例与监听一起回收；插件用 `key` 声明，内置插件各占右侧设置菜单一项。

## 安装

```bash
pnpm add @wapri/gplayer artplayer
```

`vue` 是 peer 依赖，使用方自己的 Vue 3（>= 3.3）即可。

## 快速开始

```vue
<template>
  <VideoPlayer
    url="https://www.w3schools.com/html/mov_bbb.mp4#t=0.1"
    theme="#ff6b35"
  />
</template>

<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'
</script>
```

<code src="./demo/basic.vue" title="基础播放与实例方法"></code>

## 插件

`plugins` 接受两种写法，可以混用：

```ts
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

const plugins = [
  // 字符串：存在即启用，使用默认配置
  'abLoop',
  // 对象：启用并按 setting 覆盖默认配置
  { key: 'pip', setting: () => ({ autoEnter: true }) },
]
```

`setting` 收到该插件的**完整默认配置**，返回要覆盖的字段即可。需要在 `setting` 里读字段时，用 `pluginEntry` 生成条目，`config` 会带上该插件的类型：

```ts
pluginEntry('playbackRate', (config) => ({
  ...config,
  rates: config.rates.filter((rate) => rate >= 1),
}))
```

规则：

- 同一个 key 只安装一次，后出现的配置覆盖先出现的。
- 未注册的 key 会跳过，并在控制台给出警告。
- `plugins` 变化会重建实例，播放进度与播放状态自动接上。

## 内置插件

每个插件在右侧设置菜单里占一项，点插件名查看用法与 demo：

| key | 右侧菜单 | 行为 |
| --- | --- | --- |
| [`playbackRate`](/players/playback-rate) | 播放速度 | 选择语速 |
| [`aspectRatio`](/players/aspect-ratio) | 画面比例 | 选择比例 |
| [`flip`](/players/flip) | 画面翻转 | 水平 / 垂直翻转 |
| [`screenshot`](/players/screenshot) | 截图 | 重绘当前帧并下载 |
| [`pip`](/players/pip) | 画中画 | 开关画中画 |
| [`abLoop`](/players/ab-loop) | AB 循环 | 设 A 点 / 设 B 点 / 清除 |
| [`filter`](/players/filter) | 画面调节 | 亮度、对比度、饱和度 |

## 更多

- [自定义插件](/players/custom)：`registerPlugin` + `definePlugin`，与内置插件共用同一套右侧菜单 API。
- [API](/players/api)：Props、Events、实例方法与导出类型。

## 注意

- 截图走 canvas 重绘，视频源需要允许跨域，否则浏览器会拦下来。
- 同一时刻只保留一个实例在播放（artplayer 的 `mutex`），页面里有多个播放器时互斥。
- HLS / FLV 等流协议由业务通过 `options.customType` 或 artplayer 生态插件接入，包内不内置解析器。
