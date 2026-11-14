---
title: 倒放
group:
  title: 内置插件
  order: 16
---

# 倒放 `reverse`

打开开关后暂停原生播放，逐帧回退 `currentTime`，画面从当前位置倒着走；到底后循环素材会跳回末尾继续，非循环素材会停在起点并关掉开关。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否开启倒放 | `boolean` | `false` |
| `rate` | 初始倒放速率 | `number` | `1` |

## 用法

```ts
plugins: ['reverse']
```

```ts
pluginEntry('reverse', (config) => ({ ...config, rate: 2 }))
```

## 注意

- 浏览器不支持负的 `playbackRate`，这里是脚本回退，需要按帧 seek，性能弱于正向播放。
- 反向 seek 的精度取决于关键帧间隔，长 GOP 素材会有跳帧感。
- 用户点播放时倒放会自动关闭，避免两套播放控制打架。
