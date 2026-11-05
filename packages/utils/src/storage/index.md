---
title: storage
group:
  title: 基础
  order: 1
---

# storage

浏览器存储封装。请通过 `@wapri/gutils` 导出的实例读写数据，避免直接访问浏览器存储；运行环境不支持对应存储时，会自动回退到内存存储。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `storage` | `MyStorage` | 默认本地存储实例 |
| `session` | `MyStorage` | 会话存储实例 |
| `MyStorage` | class | 支持按需创建本地或会话存储实例 |

每个 `MyStorage` 实例均提供 `getItem`、`setItem`、`removeItem` 和 `clear`，方法签名与浏览器 Storage API 一致。

## 代码演示

输入 key 和 value 后，点击按钮体验本地存储的读写。

<code src="./demo/basic.vue" iframe></code>

## 如何使用

```ts
import { MyStorage, session, storage } from '@wapri/gutils'

// 长期保存的数据
storage.setItem('token', 'value')
const token = storage.getItem('token')

// 当前会话有效的数据
session.setItem('current-step', '2')

// 按需创建独立实例
const wizardStorage = new MyStorage('sessionStorage')
wizardStorage.setItem('form-draft', 'draft')
```

`MyStorage#noSupportLS` 用于表示实例对应的浏览器存储是否不可用；为 `true` 时，数据仅保留在当前运行时的内存中。
