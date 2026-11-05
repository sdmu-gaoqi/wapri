---
title: useLottie
group:
  title: 动效多媒体
  order: 1
---

# useLottie

对第三方 [lottie-web](https://www.npmjs.com/package/lottie-web) 常用能力的封装，组件卸载时会自动 `destroy`。内部结合 [lottie-api](https://www.npmjs.com/package/lottie-api) 支持按图层名动态替换图片。

## 示例

<code src="./demo/basic.vue" compact></code>

## 远程资源

`animationData` 传 `null`、改为传 `options.path`，由 lottie-web 自己去请求远程 json。远程加载是异步的，可通过 `onReady` 拿到加载结果，也可用 `on('data_failed')` 监听加载失败。

<code src="./demo/remote.vue" compact></code>

远程资源需要目标地址**允许跨域**（响应带 `Access-Control-Allow-Origin`），否则浏览器会拦截请求、触发 `data_failed`。

## 使用

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { useLottie } from '@wapri/ghooks'

const container = ref<HTMLElement>()

// animationData 传 null 时用 options.path 从 http 加载
const { play, pause, stop, playAnimation, instance } = useLottie(container, null, {
  path: 'https://example.com/lottie-loading/data.json',
  loop: false,
  onReady: (item) => console.log('loaded', item.totalFrames),
})
</script>

<template>
  <div ref="container" />
  <button @click="play">播放</button>
  <button @click="pause">暂停</button>
  <button @click="stop">停止</button>
</template>
```

`target` 支持三种写法：直接传 DOM 元素、传 `ref`，或传返回元素的 getter（`() => element`）。用 `ref` 时元素在 `onMounted` 阶段才会就绪，Hook 内部已等到 `onMounted` 再初始化。

## 动态化 lottie

动态化是指把 lottie 中指定的图片变量做替换，从而用一个 lottie 支持不同素材、同类场景的播放复用。支持两种方式：

- 初始化时通过 `dynamic` 参数替换
- 运行时通过 `dynamicReplaceImg` 方法替换

```ts | pure
import { useLottie } from '@wapri/ghooks'

const { dynamicReplaceImg } = useLottie(container, animationData, {
  // 方式一：初始化时替换
  dynamic: { '图层名': 'https://example.com/a.png' },
})

// 方式二：运行时替换
dynamicReplaceImg({ '图层名': 'https://example.com/b.png' })
```

`dynamic` 的 key 是 lottie 里的图层名，value 是图片地址。svg 渲染器会替换 `<image>` 的 `xlink:href`，canvas 渲染器则替换 `Image.src`，Hook 内部按 `renderer` 自动区分。

## API

### Params

| 参数             | 说明                          | 类型                                                              | 默认值  |
| ---------------- | ----------------------------- | ----------------------------------------------------------------- | ------- |
| target           | 动画容器，支持元素 / ref / getter | `Element \| Ref<Element> \| (() => Element)`                   | -       |
| animationData    | lottie 的 json 数据           | `Record<string, unknown> \| null`                                 | -       |
| options.renderer | 渲染器                        | `'svg' \| 'canvas' \| 'html'`                                     | `'svg'` |
| options.loop     | 是否循环播放                  | `boolean \| number`                                               | `true`  |
| options.autoplay | 是否自动播放                  | `boolean`                                                         | `true`  |
| options.name     | 动画名，多实例场景用于区分    | `string`                                                          | -       |
| options.path     | 使用 http 资源时的 json 地址  | `string`                                                          | -       |
| options.dynamic  | 初始化时按图层名替换的图片    | `Record<string, string>`                                          | -       |
| options.onReady  | 动画加载完成回调              | `(instance: AnimationItem) => void`                               | -       |

### Result

| 参数              | 说明                                                          | 类型                                            |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| instance          | lottie 实例，未加载完成时为 `null`                            | `Ref<AnimationItem \| null>`                    |
| play              | 播放                                                          | `() => void`                                    |
| pause             | 暂停，保持当前播放状态                                        | `() => void`                                    |
| stop              | 停止并回到初始状态                                            | `() => void`                                    |
| playSegments      | 播放指定区间，第二个参数控制是否立即执行（默认 `true`）       | `(segments, forceFlag?) => void`                |
| playAnimation     | 异步播放指定区间，播放完成后 resolve                           | `(segments, forceFlag?) => Promise<void>`       |
| goToAndPlay       | 跳到某个时刻/帧并播放，第二个参数控制是否基于帧（默认 `false`） | `(value, isFrame?, name?) => void`            |
| goToAndStop       | 跳到某个时刻/帧并停止                                         | `(value, isFrame?, name?) => void`              |
| getDuration       | 以帧（`true`）/ 秒（`false`）返回持续时间                     | `(inFrames?: boolean) => number`                |
| on                | 订阅实例事件                                                  | `(name, callback) => void`                      |
| off               | 取消订阅                                                      | `(name, callback?) => void`                     |
| dynamicReplaceImg | 按图层名动态替换图片                                          | `(dynamicList: Record<string, string>) => void` |
| setLoop           | 设置循环                                                      | `(value: number \| boolean) => void`            |
| destroy           | 销毁实例                                                      | `() => void`                                    |

### 事件名

`on` / `off` 的 `name` 取 lottie-web 的 `AnimationEventName`：

```ts | pure
type AnimationEventName =
  | 'drawnFrame'
  | 'enterFrame'
  | 'loopComplete'
  | 'complete'
  | 'segmentStart'
  | 'destroy'
  | 'config_ready'
  | 'data_ready'
  | 'DOMLoaded'
  | 'error'
  | 'data_failed'
  | 'loaded_images'
```
