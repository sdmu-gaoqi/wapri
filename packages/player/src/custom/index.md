---
title: 自定义插件
group:
  title: 扩展
  order: 2
---

# 自定义插件

`registerPlugin` 注册后即可像内置插件一样按 key 启用；`install` 拿到的 `setting` 就是右侧菜单，用法与内置插件一致。

```ts
import { definePlugin, registerPlugin } from '@wapri/gplayer'

registerPlugin(
  definePlugin({
    key: 'watermark',
    label: '水印',
    defaultConfig: { text: 'wapri', opacity: 0.35 },
    install({ art, setting, onCleanup }, config) {
      // art：artplayer 实例
      // setting：往右侧菜单追加一项，返回菜单项本体
      // onCleanup：注册卸载回调，组件销毁前执行
    },
  }),
)
```

<code src="./demo/basic.vue"></code>

## 安装上下文

| 成员 | 说明 |
| --- | --- |
| `art` | artplayer 实例，事件、图层、属性都从这里拿 |
| `setting(option)` | 往右侧菜单追加一项，返回菜单项本体，可回写 `html` / `tooltip` / `switch` |
| `onCleanup(fn)` | 注册清理回调，实例销毁前统一执行；`setTimeout`、DOM 监听、`video.style` 这类副作用要在这里收尾 |

## 菜单项的返回值

artplayer 会把菜单项回调的返回值写回右侧副标题，写插件时可以直接返回文案：

| 类型 | 回调 | 返回值 |
| --- | --- | --- |
| 选择型 | `onSelect` | 新副标题 |
| 开关型 | `onSwitch` | 新的开关态（`boolean`） |
| 滑杆型 | `onChange` | 新副标题 |
| 按钮型 | `onClick` | 新副标题 |

```ts
install({ art, setting }, config) {
  const stop = setting({
    html: '循环 10 秒',
    icon: art.icons.config,
    switch: false,
    onSwitch: (item) => {
      const next = !item.switch
      // ... 开 / 关逻辑
      return next
    },
  })

  console.log(stop.html) // 循环 10 秒
}
```

## 相关导出

| 导出 | 说明 |
| --- | --- |
| `registerPlugin(definition)` | 注册插件，同 key 覆盖 |
| `definePlugin(definition)` | 声明插件，只做类型推导 |
| `pluginEntry(key, setting)` | 生成插件条目，`setting` 入参带内置插件的配置类型 |
| `getPlugin(key)` | 按 key 取插件定义 |
| `listPlugins()` | 当前已注册的插件列表 |
| `builtinPlugins` | 内置插件定义数组 |
