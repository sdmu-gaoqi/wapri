<script setup lang="ts">
import { computed, provide, ref, type CSSProperties } from 'vue'
import { ElMenu, ElScrollbar, type ScrollbarInstance } from 'element-plus'
import SidebarGroup from './components/SidebarGroup.vue'
import SidebarItem from './components/SidebarItem.vue'
import SidebarLogo from './components/SidebarLogo.vue'
import { useActiveMenuScroll } from './composables/useActiveMenuScroll'
import { sidebarThemeStyleKey } from './context'
import { dedupeMenus } from './utils'
import type { SidebarProps, SidebarTheme, SidebarVariables } from './types'

const props = withDefaults(defineProps<SidebarProps>(), {
  menus: () => [],
  activeMenu: '',
  collapse: false,
  mode: 'classic',
  theme: 'dark',
  showLogo: true,
  logo: '',
  title: '',
  subtitle: '',
  portal: 'merchant',
  logoTo: '/index',
  linkComponent: 'router-link',
})

defineOptions({ name: 'Sidebar' })

/**
 * 主题变量名到 CSS 变量名的映射。
 * 变量的默认值统一在 styles/theme.scss 的 :root 上定义，宿主可以直接用 CSS 覆盖；
 * 这里只负责把 props 里显式传入的值落到行内，做单实例级别的覆盖。
 */
const THEME_CSS_VARIABLES: Record<keyof SidebarVariables, string> = {
  menuColor: '--wa-ui-sidebar-menu-color',
  menuLightColor: '--wa-ui-sidebar-menu-light-color',
  menuColorActive: '--wa-ui-sidebar-menu-color-active',
  menuBackground: '--wa-ui-sidebar-menu-background',
  menuLightBackground: '--wa-ui-sidebar-menu-light-background',
  subMenuBackground: '--wa-ui-sidebar-sub-menu-background',
  subMenuHover: '--wa-ui-sidebar-sub-menu-hover',
  logoTitleColor: '--wa-ui-sidebar-logo-title-color',
  logoLightTitleColor: '--wa-ui-sidebar-logo-light-title-color',
  activeColor: '--wa-ui-sidebar-active-color',
  activeColorLight: '--wa-ui-sidebar-active-color-light',
  activeColorDarkBg: '--wa-ui-sidebar-active-color-dark-bg',
  width: '--wa-ui-sidebar-width',
  groupedWidth: '--wa-ui-sidebar-grouped-width',
  collapsedWidth: '--wa-ui-sidebar-collapsed-width',
}

const scrollbarRef = ref<ScrollbarInstance>()

const menus = computed(() => dedupeMenus(props.menus))
const menuCount = computed(() => menus.value.length)
const isCollapse = computed(() => props.collapse)
const isGrouped = computed(() => props.mode === 'grouped')

/** 分组导航为白底浅色风格，忽略外部传入的深色主题 */
const resolvedTheme = computed<SidebarTheme>(() => (isGrouped.value ? 'light' : props.theme))

const menuBackground = computed(() =>
  resolvedTheme.value === 'dark'
    ? 'var(--wa-ui-sidebar-menu-background)'
    : 'var(--wa-ui-sidebar-menu-light-background)',
)
const menuTextColor = computed(() =>
  resolvedTheme.value === 'dark' ? 'var(--wa-ui-sidebar-menu-color)' : 'var(--wa-ui-sidebar-menu-light-color)',
)
const activeTextColor = 'var(--wa-ui-sidebar-active-color)'

const rootClass = computed(() => [
  `theme-${resolvedTheme.value}`,
  {
    'has-logo': props.showLogo,
    'is-grouped': isGrouped.value,
    'is-collapsed': isCollapse.value,
  },
])

/** 仅把显式传入的主题变量落到行内，未传入的走 :root 上的全局 CSS 变量 */
const themeStyle = computed<CSSProperties>(() => {
  const provided = props.variables
  const style: Record<string, string> = {}
  if (!provided) return style
  for (const [key, cssVariable] of Object.entries(THEME_CSS_VARIABLES)) {
    const value = provided[key as keyof SidebarVariables]
    if (value) style[cssVariable] = value
  }
  return style
})

provide(sidebarThemeStyleKey, themeStyle)

useActiveMenuScroll({
  scrollbarRef,
  activeMenu: computed(() => props.activeMenu),
  menuCount,
  collapse: isCollapse,
})
</script>

<template>
  <div
    class="wa-ui-sidebar"
    :class="rootClass"
    :style="themeStyle"
  >
    <template v-if="showLogo">
      <slot
        name="logo"
        :collapse="isCollapse"
        :grouped="isGrouped"
      >
        <SidebarLogo
          :collapse="isCollapse"
          :grouped="isGrouped"
          :logo="logo"
          :title="title"
          :subtitle="subtitle"
          :portal="portal"
          :to="logoTo"
          :link-component="linkComponent"
        />
      </slot>
    </template>

    <ElScrollbar
      ref="scrollbarRef"
      class="wa-ui-sidebar__scroll"
      wrap-class="wa-ui-sidebar__scroll-wrap"
    >
      <nav
        v-if="isGrouped"
        class="wa-ui-sidebar__nav"
        :class="{ 'is-collapsed': isCollapse }"
      >
        <SidebarGroup
          v-for="(menu, index) in menus"
          :key="`${menu.path}-${index}`"
          :item="menu"
          :active-menu="activeMenu"
          :collapse="isCollapse"
          :render-icon="renderIcon"
          :link-component="linkComponent"
        />
      </nav>
      <ElMenu
        v-else
        class="wa-ui-sidebar__menu"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="menuBackground"
        :text-color="menuTextColor"
        :active-text-color="activeTextColor"
        unique-opened
        :collapse-transition="false"
        mode="vertical"
      >
        <SidebarItem
          v-for="(menu, index) in menus"
          :key="`${menu.path}-${index}`"
          :item="menu"
          :base-path="menu.path"
          :render-icon="renderIcon"
          :link-component="linkComponent"
        />
      </ElMenu>
    </ElScrollbar>
  </div>
</template>

<style lang="scss" src="./styles/index.scss" />
