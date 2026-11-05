---
title: ShareButton 分享按钮
group:
  title: 基础
  order: 1
---

# ShareButton 分享按钮

用于「分享 / 打开 App」类入口。点击时先判断当前是否在微信内置浏览器：

- **非微信环境**：直接跳转到 `link`；
- **微信内置浏览器**：微信会拦截 App Scheme 唤起，改为弹出全屏引导浮层，提示用户「在浏览器中打开」，并提供一键复制链接。

环境判断复用 `@wapri/gbase` 的 `os.isWeixin()`（匹配 UA 中的 `micromessenger`）。

<code src="./demo/basic.vue" title="基础用法"></code>

## 引导浮层

微信内点击不会跳转，而是渲染一个全屏遮罩浮层：右上角有一根指向微信「···」的引导箭头，文本块靠上左对齐，底部一条通栏主色按钮。默认内容为「微信内无法直接唤起 App」+ 三步引导 + 「复制链接，到浏览器打开」。

浮层弹出时会自动复制一次 `link`，并在步骤下方居中给出结果文案：

- 复制成功 → 「已复制，请到浏览器打开」
- 复制失败（微信内 Clipboard API 常静默失败）→「复制失败，请手动复制地址栏链接」

点击底部按钮可再次复制；点击遮罩空白处关闭。步骤文案里用 `**包裹**` 的片段会加粗渲染，便于突出「在浏览器中打开」这类关键动作。

`guideTitle`、`guideSteps`、`actionText` 可覆盖默认文案；`forceGuide` 用于在非微信环境强制预览该浮层。

```vue | pure
<ShareButton
  link="demoapp://find/community/detail?postId=10086"
  guide-title="请在浏览器中打开"
  :guide-steps="['点右上角 ···', '选择在浏览器中打开', '即可拉起 App']"
  action-text="复制链接"
/>
```

## 使用

从 `@wapri/element-pro` 导入 `ShareButton`，支持单独 `app.use(ShareButton)` 注册。按钮本体基于 `ElButton`，未声明的属性（如 `type`、`plain`、`size`）会透传给 `ElButton`；默认文案通过 `text` 或默认插槽指定。样式使用组件库的 `@wapri/element-pro/dist/style.css`。

## Props

| 属性         | 说明                                                             | 类型       | 默认值                                     |
| ------------ | ---------------------------------------------------------------- | ---------- | ------------------------------------------ |
| `link`       | 分享目标链接；非微信内点击直接跳转，微信内改为弹引导浮层         | `string`   | -                                          |
| `text`       | 按钮文案，默认插槽未传内容时使用                                 | `string`   | `'分享'`                                   |
| `disabled`   | 是否禁用                                                         | `boolean`  | `false`                                    |
| `forceGuide` | 强制展示引导浮层，便于非微信环境预览调试                         | `boolean`  | `false`                                    |
| `guideTitle` | 引导浮层标题                                                     | `string`   | `'微信内无法直接唤起 App'`                 |
| `showArrow`  | 是否展示右上角指向微信「···」的引导箭头                           | `boolean`  | `true`                                     |
| `guideSteps` | 引导浮层步骤文案，按序展示；`**文案**` 会渲染为加粗      | `string[]` | `['点右上角 **···**', '选择 **在浏览器中打开**', '在 **Safari/Chrome** 中即可正常拉起']` |
| `actionText` | 引导浮层底部按钮文案，点击后复制 `link`                          | `string`   | `'复制链接，到浏览器打开'`                 |

## Events

| 事件名  | 说明                                             | 回调参数      |
| ------- | ------------------------------------------------ | ------------- |
| `share` | 点击时触发，无论最终跳转还是弹引导浮层           | `(link: string)` |
| `copy`  | 浮层内复制链接成功后触发（自动复制与点击按钮都会触发） | `(link: string)` |

## 说明

- 引导浮层通过 `Teleport` 挂到 `body`，打开期间会锁定 `body` 滚动，关闭或组件卸载时恢复。
- 引导箭头的位置与大小可通过 CSS 变量覆盖：`--wa-ui-share-button-arrow-size`（默认 `30px`）、`--wa-ui-share-button-arrow-top`（`28px`）、`--wa-ui-share-button-arrow-right`（`24px`）。
- `link` 为 App Scheme（如 `demoapp://`）时，在微信内必须走引导浮层，否则无法唤起 App。
