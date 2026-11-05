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

使用 `ConfigProvider` 包裹组件子树可统一配置 `size` 和 `prefix`。详情见 [ConfigProvider](/element-pros/config-provider)。

```vue | pure
<ConfigProvider
  size="small"
  prefix="acme"
>
  <ProTable :columns="columns" />
</ConfigProvider>
```
