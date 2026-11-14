---
title: API
group:
  title: API
  order: 3
---

# API

## Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `url` | 视频地址 | `string` | - |
| `poster` | 封面图 | `string` | - |
| `theme` | 主题色 | `string` | `#f00`（artplayer 默认） |
| `lang` | 提示语言 | `string` | `zh-cn` |
| `autoplay` | 是否自动播放 | `boolean` | `false` |
| `muted` | 是否静音 | `boolean` | `false` |
| `loop` | 是否循环播放 | `boolean` | `false` |
| `volume` | 初始音量，0–1 | `number` | `0.7` |
| `height` | 容器高度，数字按 px；不传按 16:9 | `number \| string` | - |
| `plugins` | 插件配置 | `PluginInput[]` | `[]` |
| `options` | 其余 [artplayer 配置](https://artplayer.org/document/) 原样透传 | `PlayerOption` | `{}` |

组件默认打开右侧设置菜单、全屏按钮与迷你进度条，其余按钮（`playbackRate`、`screenshot`、`pip` 等）默认关闭，交给插件接管；需要原生按钮时用 `options` 打开。

同名配置同时出现在 `options` 与顶层 props 时，以顶层 props 为准。

## Events

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `ready` | 播放器就绪 | - |
| `play` / `pause` / `ended` | 播放、暂停、结束 | - |
| `timeupdate` | 播放进度变化 | - |
| `volumechange` / `ratechange` | 音量、语速变化 | - |
| `seek` | 跳转完成 | `currentTime`、`time` |
| `error` | 播放出错 | `error`、`reconnectTime` |
| `flip` | 翻转方向变化 | `mode` |
| `pip` | 画中画开关 | `state` |
| `screenshot` | 截图完成 | `dataUri` |
| `fullscreen` / `fullscreen-web` | 全屏状态变化 | `state` |
| `destroy` | 实例销毁 | - |

## 实例方法

```vue
<VideoPlayer
  ref="playerRef"
  url="..."
/>

<script setup lang="ts">
import { ref } from 'vue'
import type { VideoPlayerInstance } from '@wapri/gplayer'

const playerRef = ref<VideoPlayerInstance>()
playerRef.value?.seek(3)
</script>
```

| 方法 / 属性 | 说明 |
| --- | --- |
| `player` | 原始 `Artplayer` 实例，未就绪时为 `undefined` |
| `play()` / `pause()` / `toggle()` | 播放控制 |
| `seek(time)` | 跳到指定秒数 |
| `screenshot(name?)` | 截图，返回 dataURL |
| `fullscreen(state?)` | 进入 / 退出全屏，不传则切换 |

## 类型

| 类型 | 说明 |
| --- | --- |
| `VideoPlayerProps` / `VideoPlayerInstance` / `VideoPlayerEmits` | 组件属性、实例方法、事件签名 |
| `PlayerOption` | 透传给 artplayer 的配置（去掉 `container` / `url` / `plugins`） |
| `PluginInput` / `PluginEntry` / `PluginSetting` | 插件配置入参 |
| `PluginDefinition` / `PluginContext` | 插件定义与安装上下文 |
| `PluginConfigMap` / `BuiltinPluginKey` | 内置插件配置映射与 key |
| `PlaybackRateConfig` / `AspectRatioConfig` / `FlipConfig` | 内置插件配置 |
| `ScreenshotConfig` / `ScreenshotResult` | 截图插件配置与结果 |
| `PipConfig` / `AbLoopConfig` / `FilterConfig` | 其余内置插件配置 |

## 注意

- `plugins` 与 `options` 变化会重建实例，播放进度与播放状态会自动接上；全屏、画中画状态不保留。
- `url` 变化走 artplayer 的切换逻辑，不会重建实例。
- 组件卸载时先执行插件的 `onCleanup`，再销毁 artplayer 实例。
