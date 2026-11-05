<script setup lang="ts">
import { computed } from 'vue'
import MainContent from '../MainContent/index.vue'
import Sidebar from '../Sidebar/index.vue'
import type { SidebarMode } from '../Sidebar/types'
import SidebarTrigger from './components/SidebarTrigger.vue'
import type { LayoutProps } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  sidebar: undefined,
  header: undefined,
  sidebarHidden: false,
  trigger: true,
  mobile: false,
  withoutAnimation: false,
  hasTagsView: false,
})

const emit = defineEmits<{
  /** 点击内置折叠按钮时触发，由宿主切换侧栏展开状态 */
  (e: 'toggleSidebar'): void
}>()

defineOptions({ name: 'Layout' })

/** 侧栏状态直接取自透传的属性，作为主内容区让位的依据 */
const sidebarProps = computed(() => props.sidebar ?? {})
const sidebarMode = computed<SidebarMode>(() => props.sidebar?.mode ?? 'classic')
const sidebarCollapse = computed(() => Boolean(props.sidebar?.collapse))
const headerFixed = computed(() => Boolean(props.header?.fixed))

const rootClass = computed(() => ({
  'is-grouped': sidebarMode.value === 'grouped',
  'is-collapsed': sidebarCollapse.value,
  'is-mobile': props.mobile,
  'is-sidebar-hidden': props.sidebarHidden,
  'without-animation': props.withoutAnimation,
}))
</script>

<template>
  <div
    class="wa-ui-layout"
    :class="rootClass"
  >
    <Sidebar
      v-if="!sidebarHidden"
      class="wa-ui-layout__sidebar"
      v-bind="sidebarProps"
    >
      <template
        v-if="$slots.logo"
        #logo="slotProps"
      >
        <slot
          name="logo"
          v-bind="slotProps"
        ></slot>
      </template>
    </Sidebar>

    <MainContent
      class="wa-ui-layout__content"
      :mode="sidebarMode"
      :collapse="sidebarCollapse"
      :sidebar-hide="sidebarHidden"
      :mobile="mobile"
      :without-animation="withoutAnimation"
      :has-tags-view="hasTagsView"
    >
      <slot name="trigger">
        <SidebarTrigger
          v-if="trigger && !sidebarHidden"
          :collapse="sidebarCollapse"
          @click="emit('toggleSidebar')"
        />
      </slot>
      <div
        v-if="$slots.header"
        class="wa-ui-layout__header"
        :class="{ 'is-fixed': headerFixed }"
      >
        <slot name="header"></slot>
      </div>
      <section
        v-if="$slots.main"
        class="wa-ui-layout__main"
      >
        <slot name="main"></slot>
      </section>
    </MainContent>

    <slot></slot>
  </div>
</template>

<style lang="scss" src="./styles/index.scss" />
