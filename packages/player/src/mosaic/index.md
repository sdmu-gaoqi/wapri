---
title: 马赛克
group:
  title: 内置插件
  order: 10
---

# 马赛克 `mosaic`

把整帧降采样再放大，得到块状模糊。菜单里一行开关、一行块大小，块越大越糊；拖滑杆时会自动打开开关。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `size` | 初始块大小，单位为工作画布像素 | `number` | `16` |
| `min` / `max` / `step` | 块大小滑杆的区间与步长 | `number` | `2` / `64` / `1` |

## 用法

```ts
plugins: ['mosaic']
```

```ts
pluginEntry('mosaic', (config) => ({ ...config, enabled: true, size: 32 }))
```

## 注意

- 效果作用在整帧上，不能只糊一块区域；需要局部打码时建议在业务侧叠一层遮罩。
- 走 canvas 重绘，视频源需要允许跨域，否则部分浏览器会拒绝读帧。
