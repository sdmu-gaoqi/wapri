---
title: loadResource
group:
  title: 业务
  order: 2
---

# loadResource

动态加载外部 JS / CSS 资源：按后缀自动区分脚本与样式，支持去重、加载状态标记、加载完成后自动移除节点。

## 如何使用

```typescript
import { loadResource } from '@wapri/gutils'

// 加载 JS（默认）
await loadResource('/static/sdk.js')

// 加载 CSS（以 .css 结尾或 css! 前缀）
await loadResource('/static/theme.css')

// 带自定义属性 + 加载完成后移除节点
await loadResource('/static/sdk.js', { id: 'sdk' }, true)
```

## 说明

| 参数     | 类型                  | 说明                                              |
| -------- | --------------------- | ------------------------------------------------- |
| `path`   | `string`              | 资源地址，`.css` 后缀或 `css!` 前缀按样式加载，其余按脚本 |
| `props`  | `Record<string, any>` | 附加到元素上的属性（如 `id` / `crossorigin`）      |
| `remove` | `boolean`             | 加载完成后是否移除注入的节点（默认 `false`）       |

- **去重**：同一资源已注入且加载成功（`data-loaded="ready"`）时，直接 resolve，不会重复注入
- **状态标记**：注入节点带 `data-loaded="loading" | "ready" | "error"`，可据此在 DOM 中感知加载状态
- **返回值**：`Promise<'ready' | 'error'>`（`path` 为空时 resolve `undefined`）