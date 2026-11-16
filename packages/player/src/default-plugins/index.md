---
title: 默认插件
group:
  title: 内置插件
  order: 0
---

# 默认插件

不传 `plugins` 时，`VideoPlayer` 只装两个插件：画面调节与网页全屏。其余十六个插件都按需声明，不会出现在右侧菜单里。

| key | 右侧菜单 | 默认状态 | 说明 |
| --- | --- | --- | --- |
| `filter` | 画面调节 | 参数生效（均为 100%） | 亮度、对比度、饱和度三根滑杆 |
| `webFullscreen` | 网页全屏 | 关闭 | 铺满浏览器视口 |

<code src="./demo/all.vue"></code>

## 在默认之上追加

`defaultPlayerPlugins` 是默认列表，展开后拼上自己需要的插件即可：

```ts
import { defaultPlayerPlugins, VideoPlayer } from '@wapri/gplayer'

const plugins = [...defaultPlayerPlugins, 'screenshot', 'mosaic', 'pip']
```

```html
<VideoPlayer
  url="..."
  :plugins="plugins"
/>
```

需要连配置一起给时用 `pluginEntry`：

```ts
import { defaultPlayerPlugins, pluginEntry } from '@wapri/gplayer'

const plugins = [
  ...defaultPlayerPlugins,
  pluginEntry('mosaic', (config) => ({ ...config, enabled: true, size: 24 })),
]
```

## 换掉默认值

`plugins` 一旦传入就整体替换默认值，传空数组等于不装任何插件：

```html
<!-- 只要倍速与画中画 -->
<VideoPlayer
  url="..."
  :plugins="['playbackRate', 'pip']"
/>

<!-- 回到纯原生控制条 -->
<VideoPlayer
  url="..."
  :plugins="[]"
/>
```

## 注意

- 默认插件在右侧设置菜单的顺序与上表一致。
- 截图、马赛克、模糊、绿幕、视频滤镜等都需要显式写进 `plugins`，未声明时不会创建菜单项。
- 视频源跨域时帧效果会降级，绿幕取色会提示失败，详见[绿幕](/players/chroma-key)。
