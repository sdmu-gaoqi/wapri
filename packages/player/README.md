# @wapri/gplayer

基于 [artplayer](https://artplayer.org) 的 Vue 3 视频播放器组件：`<VideoPlayer>` 一个标签就能播，卸载时实例与监听一起回收；插件用 `key` 声明，内置插件各占右侧菜单一项。

## 安装

```bash
pnpm add @wapri/gplayer artplayer
```

## 快速开始

```vue
<template>
  <VideoPlayer
    url="https://www.w3schools.com/html/mov_bbb.mp4#t=0.1"
    :plugins="['screenshot', { key: 'pip', setting: () => ({ autoEnter: true }) }]"
  />
</template>

<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'
</script>
```

## 插件

`plugins` 的每一项可以是字符串（存在即启用，走默认配置），也可以是 `{ key, setting }`：

- `setting` 收到该插件的完整默认配置，返回要覆盖的字段。
- 同一个 key 只安装一次，后出现的配置覆盖先出现的；未注册的 key 警告后跳过。
- 需要在 `setting` 里读字段时用 `pluginEntry('key', fn)`，`config` 会带上该插件的类型。

内置插件：`playbackRate`、`aspectRatio`、`flip`、`screenshot`、`pip`、`abLoop`、`filter`。

自定义插件：

```ts
import { definePlugin, registerPlugin } from '@wapri/gplayer'

registerPlugin(
  definePlugin({
    key: 'watermark',
    label: '水印',
    defaultConfig: { text: 'wapri' },
    install({ art, setting, onCleanup }, config) {
      // setting 与内置插件共用同一套右侧菜单 API
    },
  }),
)
```

## API

| 能力 | 说明 |
| --- | --- |
| Props | `url`、`poster`、`theme`、`lang`、`autoplay`、`muted`、`loop`、`volume`、`height`、`plugins`、`options` |
| Events | `ready`、`play`、`pause`、`ended`、`timeupdate`、`seek`、`error`、`volumechange`、`ratechange`、`flip`、`pip`、`screenshot`、`fullscreen`、`fullscreen-web`、`destroy` |
| 实例方法 | `player`、`play`、`pause`、`toggle`、`seek`、`screenshot`、`fullscreen` |
| 注册表 | `registerPlugin`、`definePlugin`、`pluginEntry`、`getPlugin`、`listPlugins`、`builtinPlugins` |

## 注意

- `plugins` 与 `options` 变化会重建实例，播放进度与播放状态会自动接上。
- 截图走 canvas 重绘，视频源需允许跨域；画面调节的滤镜会被一起画进截图。
- HLS / FLV 等流协议由业务通过 `options.customType` 或 artplayer 生态插件接入。

## 在线文档

https://sdmu-gaoqi.github.io/wapri/players
