---
title: screenfull
group:
  title: 基础
  order: 1
---

# screenfull

全屏 API 的跨浏览器封装，从 `@wapri/gutils` 统一透出（底层来自 `@wapri/gbase`），业务里不用再单独安装。

## 快捷方法

平时开 / 关全屏用 `fullscreen`，不用先判断 `isEnabled`，也不用挑 `request` / `exit` / `toggle`：

```ts
import { fullscreen } from '@wapri/gutils'

await fullscreen.on() // 开启全屏；环境不支持时返回 false
await fullscreen.off() // 关闭全屏；本来就不在全屏时返回 false
await fullscreen.switch() // 切换；返回切换后是否全屏

// 只全屏某个元素，比如播放器
await fullscreen.on(document.querySelector('.player')!)

fullscreen.isEnabled // 当前环境是否允许全屏
fullscreen.isFullscreen // 当前是否处于全屏
```

三个方法都返回 `Promise<boolean>`：`on` / `switch` 返回操作是否生效（`switch` 是切换后的状态），`off` 在本来就不在全屏时返回 `false`，可以直接拿来控制按钮文案。

> `fullscreen.on` / `fullscreen.off` 是「开启 / 关闭全屏」，和事件监听无关；监听变化仍然用 `screenfull.on('change', handler)`。

## 原始 API

需要监听事件、拿全屏元素或传 `FullscreenOptions` 时，直接用 `screenfull`：

```ts
import { screenfull } from '@wapri/gutils'

if (screenfull.isEnabled) {
  // 全屏整个页面
  await screenfull.request()

  // 全屏指定元素
  await screenfull.request(document.querySelector('.player')!)

  // 退出全屏
  await screenfull.exit()

  // 切换全屏
  await screenfull.toggle()
}
```

## 监听全屏变化

```ts
import { screenfull } from '@wapri/gutils'

const handleChange = () => {
  console.log('是否全屏：', screenfull.isFullscreen)
}

if (screenfull.isEnabled) {
  screenfull.on('change', handleChange)
  screenfull.on('error', (event) => {
    console.error('进入全屏失败', event)
  })
}

// 组件卸载时记得移除
screenfull.off('change', handleChange)
```

## 常用成员

| 成员 | 说明 |
| --- | --- |
| `fullscreen.on(element?)` | 开启全屏，返回是否成功，环境不支持时返回 `false` |
| `fullscreen.off()` | 关闭全屏，返回是否真的退出过 |
| `fullscreen.switch(element?)` | 切换全屏，返回切换后是否全屏 |
| `fullscreen.isEnabled` / `fullscreen.isFullscreen` | 是否允许全屏 / 当前是否全屏 |
| `isEnabled` | 当前环境是否允许全屏 |
| `isFullscreen` | 当前是否处于全屏 |
| `element` | 当前全屏的元素 |
| `request(element?, options?)` | 进入全屏 |
| `exit()` | 退出全屏 |
| `toggle(element?, options?)` | 切换全屏 |
| `on(event, handler)` / `off(event, handler)` | 监听 / 移除 `change`、`error` 事件 |
| `raw` | 浏览器实际使用的前缀属性名 |

同时导出了 `ScreenfullEventName`（`'change' | 'error'`）与 `ScreenfullRawEventNames` 类型。

## 注意事项

- 进入全屏必须由用户手势触发（点击、触摸、按键），不要在页面加载时自动调用。
- 全屏请求被浏览器拒绝时，`fullscreen.on()` / `fullscreen.switch()` 可能 reject（取决于浏览器是否返回 Promise），需要 `try/catch`；`isEnabled` 为 `false` 时则直接返回 `false`，不会进 reject。
- 页面在 iframe 里时，需要给 iframe 加 `allowfullscreen`（以及 `webkitallowfullscreen`、`mozallowfullscreen`）。
- SSR 或无 `document` 的环境里，`screenfull` 会退化为 `{ isEnabled: false }`，`fullscreen.on()` / `off()` / `switch()` 都会直接返回 `false`，不会抛错。
