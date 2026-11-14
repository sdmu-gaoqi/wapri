---
title: 画中画
group:
  title: 内置插件
  order: 5
---

# 画中画 `pip`

右侧菜单里是一个开关项，切换后写入 `player.pip`。用户从浏览器原生控件退出画中画时，开关态会同步回来；浏览器不支持画中画时给出提示，不抛错。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `autoEnter` | 页面切到后台且正在播放时，自动进入画中画 | `boolean` | `false` |

## 用法

```ts
// 默认配置
plugins: ['pip']

// 或者开启后台自动进入画中画
plugins: [pluginEntry('pip', (config) => ({ ...config, autoEnter: true }))]
```
