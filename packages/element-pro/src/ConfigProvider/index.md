---
title: ConfigProvider 全局配置
group:
  title: 配置
  order: 0
---

# ConfigProvider 全局配置

`ConfigProvider` 参考 Element Plus 与 Ant Design 的配置容器模式：包裹其子树后，element-pro 组件会继承 `size`、`prefix` 和 `iconfont`。嵌套容器仅覆盖自己传入的字段，未传字段继续继承外层配置。

```vue | pure
<script setup lang="ts">
import { ConfigProvider, ProTable } from '@wapri/element-pro'
</script>

<template>
  <ConfigProvider
    size="small"
    prefix="acme"
  >
    <ProTable :columns="columns" />
  </ConfigProvider>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| size | `large` / `default` / `small` | `default` | 子树中支持尺寸的 element-pro 组件使用该尺寸；目前包括 ProTable 和 CheckCard。 |
| prefix | string | `wa-ui` | 子树中 element-pro 组件 class 名的前缀。 |
| iconfont | string | — | 图标集脚本地址，供子树里的 `SvgIcon` 使用；不传则不加载任何外部图标源。 |

`ConfigProvider` 不额外渲染 DOM 节点，只负责向后代组件提供配置。配置自定义 `prefix` 后，组件会输出对应的 class 名（如 `acme-pro-table`）。`iconfont` 由使用方按自己的图标库注入，库内不内置图标地址。

## 主题

主题不走 `ConfigProvider`，而是与 Element Plus 一致，全部通过 CSS 变量定制：element-pro 的样式产物里已经在 `:root` 上声明了一套 `--wa-ui-*` 变量，宿主只要在自己的样式里覆盖同名变量即可，不需要引入任何 scss 或 JS 配置。可覆盖的变量见 [Sidebar 侧栏导航](/element-pros/sidebar) 与组件各自的文档。
