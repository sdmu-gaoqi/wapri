---
nav:
  title: utils
  order: 1
title: 简介
group:
  order: -10
---

# utils

utils，是一个面向业务封装的`函数库`

## 安装

```bash
pnpm add @wapri/gutils
```

## 使用示例

```typescript
import { copy } from '@wapri/gutils';

const msg = 'hello world!';
const copyData = copy(msg);
```