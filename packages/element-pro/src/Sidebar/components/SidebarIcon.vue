<script setup lang="ts">
import { computed, defineComponent, type Component, type VNodeChild } from 'vue'
import { ElIcon } from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { SidebarIconRender } from '../types'

const props = defineProps<{
  /** 图标名称 */
  icon?: string
  /** 自定义图标渲染函数 */
  renderIcon?: SidebarIconRender
}>()

const elementPlusIcons: Record<string, Component> = { ...ElementPlusIcons }

/** 把 `goods-filled` 这类连字符写法转成 Element Plus 的 `GoodsFilled` */
function toPascalCase(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * 取 Element Plus 图标名，支持 `Setting`、`setting`、`el-icon-setting` 三种写法，未命中返回空串。
 */
function getElementPlusIconName(icon: string): string {
  if (Object.prototype.hasOwnProperty.call(elementPlusIcons, icon)) return icon
  const kebab = icon.startsWith('el-icon-') ? icon.slice('el-icon-'.length) : icon
  if (Object.prototype.hasOwnProperty.call(elementPlusIcons, kebab)) return kebab
  const pascal = toPascalCase(kebab)
  return Object.prototype.hasOwnProperty.call(elementPlusIcons, pascal) ? pascal : ''
}

const elementIconName = computed(() => (props.icon ? getElementPlusIconName(props.icon) : ''))

const elementIconComponent = computed<Component | undefined>(() =>
  elementIconName.value ? elementPlusIcons[elementIconName.value] : undefined,
)

const customIconComponent = computed<Component | undefined>(() => {
  const icon = props.icon
  const render = props.renderIcon
  if (!icon || !render || elementIconName.value) return undefined
  return defineComponent({
    name: 'WaSidebarCustomIcon',
    setup: (): (() => VNodeChild) => () => render(icon),
  })
})
</script>

<template>
  <ElIcon
    v-if="elementIconComponent"
    class="wa-ui-sidebar__icon"
  >
    <component :is="elementIconComponent" />
  </ElIcon>
  <component
    :is="customIconComponent"
    v-else-if="customIconComponent"
  />
</template>
