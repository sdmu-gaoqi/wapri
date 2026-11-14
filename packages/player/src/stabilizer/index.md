---
title: 防抖
group:
  title: 内置插件
  order: 13
---

# 防抖 `stabilizer`

把当前帧与上一帧按强度做时间域混合，压掉手持拍摄带来的高频闪烁与噪点。强度越高越稳，残影也越明显。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `strength` | 初始强度 0–1 | `number` | `0.35` |
| `min` / `max` / `step` | 强度滑杆的区间与步长 | `number` | `0` / `0.9` / `0.05` |

## 用法

```ts
plugins: ['stabilizer']
```

```ts
pluginEntry('stabilizer', (config) => ({ ...config, enabled: true, strength: 0.5 }))
```

## 注意

- 浏览器拿不到相机的陀螺仪数据，这里是帧间平滑，不等于相机端的物理防抖；快速摇镜会有拖影。
- 适合固定机位的手持素材，运动镜头建议把强度压到 0.2 以下。
