---
title: 网页全屏
group:
  title: 内置插件
  order: 8
---

# 网页全屏 `webFullscreen`

把播放器铺满整个浏览器视口，不触发浏览器的全屏 API，因此不受全屏权限与 `allowfullscreen` 限制。菜单里是一个开关，退出时可点开关或按 ESC。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `defaultOn` | 实例就绪后是否直接进入网页全屏 | `boolean` | `false` |

## 用法

```ts
plugins: ['webFullscreen']
```

```ts
// 打开页面就铺满
pluginEntry('webFullscreen', (config) => ({ ...config, defaultOn: true }))
```

## 注意

- 网页全屏与浏览器全屏是两套状态，事件分别走 `fullscreen-web` 与 `fullscreen`。
- 用户按 ESC 退出时，菜单开关会跟着回写。
