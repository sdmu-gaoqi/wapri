---
title: 默认插件
group:
  title: 内置插件
  order: 0
---

# 默认插件

不传 `plugins` 时，`VideoPlayer` 会装上下面六个插件。开箱就有画面调节、截图、网页全屏，外加马赛克、模糊、绿幕三个画面效果的入口。

| key | 右侧菜单 | 默认状态 | 说明 |
| --- | --- | --- | --- |
| `filter` | 画面调节 | 参数生效（均为 100%） | 亮度、对比度、饱和度三根滑杆 |
| `screenshot` | 截图 | 可用 | 重绘当前帧并下载 |
| `webFullscreen` | 网页全屏 | 关闭 | 铺满浏览器视口 |
| `mosaic` | 马赛克 | 关闭 | 块大小可调 |
| `blur` | 模糊 | 关闭 | 整画面模糊 |
| `chromaKey` | 绿幕 | 关闭 | 吸管取色 + 相似度 + 羽化 |

<code src="./demo/all.vue"></code>

## 在默认之上追加

`defaultPlayerPlugins` 是默认列表，展开后拼上自己需要的插件即可：

```ts
import { defaultPlayerPlugins, VideoPlayer } from '@wapri/gplayer'

const plugins = [...defaultPlayerPlugins, 'playbackRate', 'pip']
```

```vue
<VideoPlayer
  url="..."
  :plugins="plugins"
/>
```

## 换掉默认值

`plugins` 一旦传入就整体替换默认值，传空数组等于不装任何插件：

```vue
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

- `mosaic`、`blur`、`chromaKey` 默认只占菜单项，不建 canvas、不跑渲染循环，打开开关后才开始处理画面。
- 默认插件在右侧设置菜单的顺序与上表一致。
- 视频源跨域时帧效果会降级，绿幕取色会提示失败，详见[绿幕](/players/chroma-key)。
