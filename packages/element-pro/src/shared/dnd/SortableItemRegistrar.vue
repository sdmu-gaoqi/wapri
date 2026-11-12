<script setup lang="ts">
import type { Component } from 'vue'
import { makeSortableItem, type MaybeElement } from '@vue-dnd-kit/core'

/**
 * 拖拽排序的无渲染注册器。
 *
 * `@vue-dnd-kit/core` 的 `makeSortableItem` 必须在组件 setup 中调用（它靠 `inject` 找到所属列表），
 * 而 `ElTable`、`ElUpload` 这类内部渲染的组件没法把 ref 挂到自己的行/项上，
 * 所以这里用「挂个组件、把目标元素传进来」的方式注册：
 * - 表格：把手柄组件挂进单元格，用 `closest('tr')` 把整行交给拖拽；
 * - 上传列表：在列表外层按 index 取 `.el-upload-list__item`。
 */
interface Props {
  /** 当前项对应的数据，拖拽事件里会作为 `active.data` 带出 */
  item: unknown
  /** 当前项在页面上的元素；返回空表示还没渲染好，注册会自动跳过 */
  target: () => MaybeElement
  /** 只允许从这个元素开始拖拽；不传时整个 target 都可拖 */
  handle?: () => MaybeElement
  /** 拖拽浮层组件；不传时使用 @vue-dnd-kit/core 的默认克隆 */
  overlay?: Component
  /** 禁用当前项的拖拽 */
  disabled?: boolean
}

const props = defineProps<Props>()

makeSortableItem(() => props.target() ?? undefined, {
  item: () => props.item,
  handle: () => props.handle?.() ?? undefined,
  overlay: props.overlay,
  disabled: () => props.disabled === true,
})
</script>

<template>
  <slot></slot>
</template>
