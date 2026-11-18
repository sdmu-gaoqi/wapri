---
title: dayjs
group:
  title: 基础
  order: 1
---

# dayjs

`dayjs` 从 `@wapri/gutils` 统一透出（底层来自 `@wapri/gbase`），业务里不用再单独安装。

## 如何使用

```ts
import { dayjs } from '@wapri/gutils'

dayjs().format('YYYY-MM-DD HH:mm:ss')
dayjs('2026-11-18').add(7, 'day').format('YYYY-MM-DD')
dayjs().startOf('month').toDate()
```

## 说明

- `@wapri/gutils` 只透出 `dayjs` 本体，没有自动加载插件。需要 `relativeTime`、`weekday`、`duration` 等能力时，在业务入口显式 `dayjs.extend(...)`。
- 需要固定语言或时区时，建议在应用入口统一配置，不要在组件里零散设置。
