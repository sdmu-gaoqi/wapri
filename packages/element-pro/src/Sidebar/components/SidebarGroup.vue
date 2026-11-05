<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { ArrowDown, Menu } from '@element-plus/icons-vue'
import { ElIcon, ElPopover } from 'element-plus'
import SidebarIcon from './SidebarIcon.vue'
import SidebarLink from './SidebarLink.vue'
import { useSidebarThemeStyle } from '../context'
import { createLinkTarget, getLinkPath } from '../utils'
import type { SidebarIconRender, SidebarMenuItem } from '../types'

const props = withDefaults(
  defineProps<{
    /** 一级菜单项 */
    item: SidebarMenuItem
    /** 当前激活菜单路径 */
    activeMenu: string
    /** 是否折叠 */
    collapse?: boolean
    /** 自定义图标渲染函数 */
    renderIcon?: SidebarIconRender
    /** 内部链接使用的组件 */
    linkComponent?: string | Component
  }>(),
  {
    collapse: false,
    linkComponent: 'router-link',
  },
)

const isOpen = ref(true)

/** 浮层内容会被 teleport 到 body，需要把主题变量一起带过去 */
const themeStyle = useSidebarThemeStyle()

const visibleChildren = computed<SidebarMenuItem[]>(() => {
  const result: SidebarMenuItem[] = []
  const seen = new Set<string>()
  const pushChild = (child: SidebarMenuItem | undefined): void => {
    if (!child || child.hidden || !child.meta?.title) return
    const key = `${child.path}::${child.meta.title}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(child)
  }
  ;(props.item.children || []).forEach((child) => {
    if (!child || child.hidden) return
    // 目录 / ParentView：把第三级叶子提到二级展示，避免同名分组空壳重复
    const nested = (child.children || []).filter((item) => !item.hidden && item.meta?.title)
    if (nested.length) nested.forEach(pushChild)
    else pushChild(child)
  })
  return result
})

const isVisible = computed(() => !props.item.hidden && visibleChildren.value.length > 0)
const isDirectLink = computed(() => visibleChildren.value.length === 1 && !(props.item.alwaysShow ?? true))
const directChild = computed<SidebarMenuItem | undefined>(() => visibleChildren.value[0])

const title = computed(() => {
  const meta = isDirectLink.value ? directChild.value?.meta : props.item.meta
  return meta?.title || ''
})
const icon = computed(() => {
  const meta = isDirectLink.value ? directChild.value?.meta : props.item.meta
  return meta?.icon || ''
})

function resolvePath(routePath: string | undefined, query?: string) {
  return createLinkTarget(props.item.path, routePath, query)
}

function isActive(child: SidebarMenuItem): boolean {
  return props.activeMenu === getLinkPath(resolvePath(child.path))
}

const isGroupActive = computed(() => props.activeMenu === getLinkPath(resolvePath(props.item.path)))

function toggle(): void {
  isOpen.value = !isOpen.value
}

watch(
  () => props.activeMenu,
  () => {
    if (visibleChildren.value.some((child) => isActive(child))) isOpen.value = true
  },
  { immediate: true },
)
</script>

<template>
  <section
    v-if="isVisible"
    class="wa-ui-sidebar__group"
    :class="{ 'is-collapsed': collapse, 'is-open': isOpen }"
  >
    <template v-if="collapse">
      <SidebarLink
        v-if="isDirectLink && directChild"
        class="wa-ui-sidebar__group-trigger"
        :class="{ 'is-active': isActive(directChild) }"
        :to="resolvePath(directChild.path, directChild.query)"
        :link-component="linkComponent"
        :aria-label="title"
      >
        <SidebarIcon
          v-if="icon"
          :icon="icon"
          :render-icon="renderIcon"
        />
        <ElIcon v-else><Menu /></ElIcon>
      </SidebarLink>

      <ElPopover
        v-else-if="visibleChildren.length"
        placement="right-start"
        trigger="hover"
        popper-class="wa-ui-sidebar-popper"
        :popper-style="themeStyle"
        :open-delay="120"
      >
        <div class="wa-ui-sidebar-popper__title">{{ title }}</div>
        <div class="wa-ui-sidebar__link-grid wa-ui-sidebar__link-grid--popper">
          <SidebarLink
            v-for="child in visibleChildren"
            :key="child.path"
            class="wa-ui-sidebar__link"
            :class="{ 'is-active': isActive(child) }"
            :to="resolvePath(child.path, child.query)"
            :link-component="linkComponent"
          >
            <span :title="child.meta?.title">{{ child.meta?.title }}</span>
          </SidebarLink>
        </div>
        <template #reference>
          <button
            type="button"
            class="wa-ui-sidebar__group-trigger"
            :aria-label="title"
          >
            <SidebarIcon
              v-if="icon"
              :icon="icon"
              :render-icon="renderIcon"
            />
            <ElIcon v-else><Menu /></ElIcon>
          </button>
        </template>
      </ElPopover>

      <SidebarLink
        v-else-if="item.meta"
        class="wa-ui-sidebar__group-trigger"
        :class="{ 'is-active': isGroupActive }"
        :to="resolvePath(item.path, item.query)"
        :link-component="linkComponent"
        :aria-label="title"
      >
        <SidebarIcon
          v-if="icon"
          :icon="icon"
          :render-icon="renderIcon"
        />
        <ElIcon v-else><Menu /></ElIcon>
      </SidebarLink>
    </template>

    <SidebarLink
      v-else-if="isDirectLink && directChild"
      class="wa-ui-sidebar__group-header wa-ui-sidebar__group-direct-link"
      :class="{ 'is-active': isActive(directChild) }"
      :to="resolvePath(directChild.path, directChild.query)"
      :link-component="linkComponent"
    >
      <span class="wa-ui-sidebar__group-title">
        <SidebarIcon
          v-if="icon"
          :icon="icon"
          :render-icon="renderIcon"
        />
        <ElIcon v-else><Menu /></ElIcon>
        {{ title }}
      </span>
    </SidebarLink>

    <template v-else-if="visibleChildren.length">
      <button
        type="button"
        class="wa-ui-sidebar__group-header"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span class="wa-ui-sidebar__group-title">
          <SidebarIcon
            v-if="icon"
            :icon="icon"
            :render-icon="renderIcon"
          />
          <ElIcon v-else><Menu /></ElIcon>
          {{ title }}
        </span>
        <ElIcon
          class="wa-ui-sidebar__group-arrow"
          :class="{ 'is-open': isOpen }"
        >
          <ArrowDown />
        </ElIcon>
      </button>
      <transition name="wa-ui-sidebar-collapse">
        <div
          v-show="isOpen"
          class="wa-ui-sidebar__link-grid"
        >
          <SidebarLink
            v-for="child in visibleChildren"
            :key="child.path"
            class="wa-ui-sidebar__link"
            :class="{ 'is-active': isActive(child) }"
            :to="resolvePath(child.path, child.query)"
            :link-component="linkComponent"
          >
            <span :title="child.meta?.title">{{ child.meta?.title }}</span>
          </SidebarLink>
        </div>
      </transition>
    </template>

    <SidebarLink
      v-else-if="item.meta"
      class="wa-ui-sidebar__group-header wa-ui-sidebar__group-direct-link"
      :class="{ 'is-active': isGroupActive }"
      :to="resolvePath(item.path, item.query)"
      :link-component="linkComponent"
    >
      <span class="wa-ui-sidebar__group-title">
        <SidebarIcon
          v-if="icon"
          :icon="icon"
          :render-icon="renderIcon"
        />
        <ElIcon v-else><Menu /></ElIcon>
        {{ title }}
      </span>
    </SidebarLink>
  </section>
</template>
