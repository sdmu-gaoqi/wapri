<script setup lang="ts" generic="T extends object, U extends Record<string, unknown>">
import type { Component } from 'vue'
import { DnDProvider } from '@vue-dnd-kit/core'
import DragSortTableBodyComp from './components/DragSortTableBody.vue'
import type { DragSortTableProps } from './types'

defineOptions({ name: 'DragSortTable', inheritAttrs: false })

defineProps<DragSortTableProps<T, U>>()

/**
 * 外层只做搬运：props 已在上面按泛型声明过，这里放宽类型免得再走一遍泛型推断。
 */
const DragSortTableBody = DragSortTableBodyComp as Component
</script>

<template>
  <!--
    每个实例一个私有 provider：业务不用在应用根部包 DnDProvider，
    也不会和页面上其它拖拽区域（另一个表格、看板）互相抢落点。
  -->
  <DnDProvider>
    <DragSortTableBody v-bind="{ ...$props, ...$attrs }">
      <template
        v-for="(_, slotName) in $slots"
        #[slotName]="slotProps"
      >
        <slot
          :name="slotName"
          v-bind="slotProps ?? {}"
        ></slot>
      </template>
    </DragSortTableBody>
  </DnDProvider>
</template>

<style lang="scss" src="./styles/index.scss" />
