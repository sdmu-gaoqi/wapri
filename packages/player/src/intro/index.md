---
title: 开场动画
group:
  title: 内置插件
  order: 17
---

# 开场动画 `intro`

播放开始时盖一层品牌片头：图片、文字或两者叠加，停留一段时间后淡出。菜单里只有一项「重播开场」，随时可以再看一遍。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `image` | 图片地址，留空只显示文字 | `string` | `''` |
| `text` | 文案，留空只显示图片 | `string` | `'wapri'` |
| `duration` | 停留时长（毫秒） | `number` | `1600` |
| `delay` | 延迟出现（毫秒） | `number` | `0` |
| `once` | 只在首次播放出现；`false` 时每次播放都出现 | `boolean` | `true` |

## 用法

```ts
plugins: ['intro']
```

```ts
pluginEntry('intro', (config) => ({
  ...config,
  image: 'https://example.com/logo.png',
  text: '',
  duration: 2200,
}))
```

## 注意

- 覆盖层是 DOM 层，盖在画面之上、控制条之下，不拦截点击。
- 片头不会阻断播放，播放进度照常前进；需要「播完片头才出画面」时请用业务侧的遮罩。
