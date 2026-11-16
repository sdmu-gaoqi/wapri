---
nav:
  title: element-pro
  order: 0
toc: false
title: 简介
group:
  order: -10
---

# element-pro

element-pro 是一个面向业务封装的组件库, 基于 Vue 3 + TS + element plus

## 安装

### yarn

```shell
yarn add @wapri/element-pro
```

### npm

```shell
npm i @wapri/element-pro
```

## 使用

```vue | pure
<script setup lang="ts">
import { ComponentName } from '@wapri/element-pro'
</script>

<template>
  <ComponentName>element-pro</ComponentName>
</template>
```

## 全局配置

使用 `ProConfigProvider` 包裹组件子树可统一配置 `size` 和 `prefix`。详情见 [ProConfigProvider](/element-pros/config-provider)。

```vue | pure
<ProConfigProvider
  size="small"
  prefix="acme"
>
  <ProTable :columns="columns" />
</ProConfigProvider>
```

## Element Plus 组件

element-plus 的组件、hooks、指令、locale 与类型都从本包统一透出，业务只依赖 `@wapri/element-pro` 就够了：

```ts
import { ElButton, ElMessage, vLoading } from '@wapri/element-pro'
import type { FormInstance, FormItemRule } from '@wapri/element-pro'
```

需要拿到完整的 element-plus 实例做 `app.use` 或挂全局属性时，用默认导出 `ElementPlus`：

```ts
import { ElementPlus } from '@wapri/element-pro'

app.use(ElementPlus)
```

Element Plus 的主题样式已由包入口引入（`import 'element-plus/dist/index.css'`），宿主不需要再单独引。图标仍从 `@element-plus/icons-vue` 引入：它与 element-plus 都有 `Loading` 导出，不做二次透出。
