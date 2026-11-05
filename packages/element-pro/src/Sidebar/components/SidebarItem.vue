<script setup lang="ts">
import { computed } from 'vue'
import { ElMenuItem, ElSubMenu } from 'element-plus'
import SidebarItemContent from './SidebarItemContent.vue'
import SidebarLink from './SidebarLink.vue'
import { useSidebarThemeStyle } from '../context'
import { createLinkTarget, getLinkPath } from '../utils'
import type { SidebarItemProps, SidebarMenuItem } from '../types'

const props = withDefaults(defineProps<SidebarItemProps>(), {
  isNest: false,
  basePath: '',
  linkComponent: 'router-link',
})

defineOptions({ name: 'WaSidebarItem' })

/** 折叠态子菜单浮层会被 teleport 到 body，需要把主题变量一起带过去 */
const themeStyle = useSidebarThemeStyle()

const visibleChildren = computed<SidebarMenuItem[]>(() => (props.item.children || []).filter((child) => !child.hidden))

/** 仅有一个可见子菜单时，直接展示该子菜单；没有可见子菜单时，把父级自身作为叶子展示 */
const onlyOneChild = computed<SidebarMenuItem | undefined>(() => {
  const children = visibleChildren.value
  if (children.length === 1) return children[0]
  if (children.length === 0) return { ...props.item, path: '', noShowingChildren: true }
  return undefined
})

const showSingleChild = computed(() => {
  if (props.item.alwaysShow ?? true) return false
  const children = visibleChildren.value
  if (children.length === 0) return true
  return children.length === 1 && !children[0].children?.length
})

function resolvePath(routePath: string | undefined, query?: string) {
  return createLinkTarget(props.basePath, routePath, query)
}

function resolvePathString(routePath: string | undefined): string {
  return getLinkPath(resolvePath(routePath))
}
</script>

<template>
  <div v-if="!item.hidden">
    <template v-if="showSingleChild && onlyOneChild">
      <SidebarLink
        v-if="onlyOneChild.meta"
        :to="resolvePath(onlyOneChild.path, onlyOneChild.query)"
        :link-component="linkComponent"
      >
        <ElMenuItem
          :index="resolvePathString(onlyOneChild.path)"
          :class="{ 'wa-ui-sidebar__item--leaf': !isNest }"
        >
          <SidebarItemContent
            :icon="onlyOneChild.meta.icon || item.meta?.icon"
            :title="onlyOneChild.meta.title"
            :render-icon="renderIcon"
          />
        </ElMenuItem>
      </SidebarLink>
    </template>

    <ElSubMenu
      v-else
      :index="resolvePathString(item.path)"
      popper-class="wa-ui-sidebar-submenu-popper"
      :popper-style="themeStyle"
    >
      <template #title>
        <SidebarItemContent
          v-if="item.meta"
          :icon="item.meta.icon"
          :title="item.meta.title"
          :render-icon="renderIcon"
        />
      </template>
      <SidebarItem
        v-for="(child, index) in item.children"
        :key="`${child.path}-${index}`"
        is-nest
        :item="child"
        :base-path="resolvePathString(child.path)"
        :render-icon="renderIcon"
        :link-component="linkComponent"
        class="wa-ui-sidebar__nest-item"
      />
    </ElSubMenu>
  </div>
</template>
