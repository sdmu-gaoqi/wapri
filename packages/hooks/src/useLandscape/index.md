---
title: useLandscape
group:
  title: 页面
  order: 1
---

# useLandscape

检测屏幕方向是否为横屏,支持在横屏时自动拦截展示

## 代码演示

### 基础用法

检测当前屏幕方向,横屏/竖屏状态实时变化

<code src="./demo/basic.vue" iframe></code>

### 禁止横屏展示 

新开链接以手机模式预览,开启拦截后,横屏时页面被全屏遮罩覆盖,提示旋转屏幕;恢复竖屏后遮罩自动消失

<code src="./demo/lock.vue" iframe></code>

## 如何使用

```typescript
import { useLandscape } from '@wapri/ghooks'

// 仅检测横屏状态,由业务自行处理展示
const isLandscape = useLandscape()

// 检测到横屏时自动展示遮罩层(禁止横屏浏览),旋转回竖屏后遮罩自动消失
useLandscape({
  lock: true,
  tip: '请旋转您的屏幕,切换至竖屏模式',
  zIndex: 9999,
})
```

## API

### useLandscape

```typescript
const isLandscape = useLandscape(options?)
```

#### 参数

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| options | 配置项 | `UseLandscapeOptions` |

#### 返回值

| 返回值 | 说明 | 类型 |
| --- | --- | --- |
| isLandscape | 是否处于横屏 | `Ref<boolean>` |

### UseLandscapeOptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| lock | 横屏时自动展示遮罩层阻止横屏浏览,竖屏后自动消失 | `boolean` | `false` |
| tip | 遮罩层的提示文案 | `string` | `'请旋转您的屏幕,切换至竖屏模式'` |
| zIndex | 遮罩层的层级 | `number \| string` | `9999` |