<script setup lang="ts">
import { Ellipsis } from '@wapri/element-pro'

const content =
  'wa 的企业级产品是一个庞大且复杂的体系。这类产品不仅量级巨大且变动频繁，设计与开发需要快速响应，并将相似页面中稳定且高复用的内容抽象为组件。'
</script>

<template>
  <div style="display: grid; gap: 16px; max-width: 480px">
    <h1>尾部省略</h1>
    <Ellipsis :content="content" />
    <h1>头部省略</h1>
    <Ellipsis
      :content="content"
      direction="start"
    />
    <h1>中间省略</h1>
    <Ellipsis
      :content="content"
      direction="middle"
    />
    <h1>多行省略</h1>
    <Ellipsis
      :content="content"
      :rows="3"
      expand-text="展开"
      collapse-text="收起"
    />
    <h1>展开收起</h1>
    <Ellipsis
      :content="content"
      :rows="2"
      default-expanded
      expand-text="展开"
      collapse-text="收起"
    />
  </div>
</template>
