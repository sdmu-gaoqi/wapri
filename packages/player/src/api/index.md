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
| `plugins` | 插件配置 | `PluginInput[]` | `['filter', 'screenshot', 'webFullscreen', 'mosaic', 'blur', 'chromaKey']` |
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

## 帧渲染器

需要逐帧改画面的插件，往 `frame` 里写参数即可，不用自己管 canvas 与渲染循环：

```ts
install({ frame, onCleanup }, config) {
  frame.set('blur', { radius: 8 })
  onCleanup(() => frame.set('blur', null))
}
```

- 可选 key：`mosaic`、`blur`、`backgroundBlur`、`chromaKey`、`videoFilter`、`vertical`、`stabilizer`，参数类型见 `FrameEffectMap`。
- 不同 key 会叠加，同一个 key 后写的覆盖先写的；全部清空后覆盖层自动移除。
- `frame.pickColor(clientX, clientY)` 返回该点的 `#rrggbb`，视频未就绪或跨域被拦时返回 `null`。
- 写 `video.style.filter` 请走 `cssFilter.set(key, fragment)`，避免和画面调节、视频滤镜互相覆盖。

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
| `WebFullscreenConfig` / `VideoFilterConfig` / `MosaicConfig` | 画面类插件配置 |
| `BlurConfig` / `BackgroundBlurConfig` / `StabilizerConfig` | 帧效果插件配置 |
| `ChromaKeyConfig` / `VerticalConfig` / `ReverseConfig` | 帧效果与播放控制插件配置 |
| `IntroConfig` / `OverlayConfig` / `OverlayType` | 覆盖层插件配置 |
| `FrameRenderer` / `FrameEffectMap` / `FrameEffectKey` | 帧渲染器与效果参数 |
| `CssFilterStack` | filter 合成栈，自定义插件写 `video.style.filter` 时用它 |

## 注意

- `plugins` 与 `options` 变化会重建实例，播放进度与播放状态会自动接上；全屏、画中画状态不保留。
- `url` 变化走 artplayer 的切换逻辑，不会重建实例。
- 组件卸载时先执行插件的 `onCleanup`，再销毁 artplayer 实例。
