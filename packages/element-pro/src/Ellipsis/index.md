---
title: Ellipsis 文本省略
group:
  title: 布局
  order: 2
---

# Ellipsis 文本省略

根据容器可用宽度截断纯文本，支持单行或多行、头部/尾部/中间省略，以及展开与收起操作。

<code src="./demo/basic.vue" title="基础用法"></code>

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `content` | 要截断的纯文本 | `string` | `''` |
| `direction` | 省略位置 | `'start' \| 'end' \| 'middle'` | `'end'` |
| `rows` | 最多展示的行数 | `number` | `1` |
| `expandText` | 展开操作文案或节点；仅内容实际截断时展示 | `VNodeChild` | - |
| `collapseText` | 收起操作文案或节点；仅展开且内容实际截断时展示 | `VNodeChild` | - |
| `defaultExpanded` | 初始是否展开 | `boolean` | `false` |
| `stopPropagationForActionButtons` | 展开、收起按钮需要阻止冒泡的事件类型 | `Array<'click' \| 'mousedown' \| 'mouseup' \| 'touchstart' \| 'touchend'>` | `[]` |

## 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `expand` | 点击展开或收起时触发 | `(expanded: boolean, info: { event: MouseEvent })` |
| `content-click` | 点击纯文本区域时触发；点击操作按钮不会触发 | `(event: MouseEvent)` |
