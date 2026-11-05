<script setup lang="ts">
import { computed } from 'vue'
import SidebarLink from './SidebarLink.vue'
import type { SidebarLogoProps } from '../types'

const props = withDefaults(defineProps<SidebarLogoProps>(), {
  collapse: false,
  grouped: false,
  logo: '',
  title: '',
  subtitle: '',
  portal: 'merchant',
  to: '/index',
  linkComponent: 'router-link',
})

const portalClass = computed(() =>
  props.portal === 'platform' ? 'wa-ui-sidebar__brand-portal--platform' : 'wa-ui-sidebar__brand-portal--merchant',
)

const showBrand = computed(() => !props.collapse && Boolean(props.title || props.subtitle))
</script>

<template>
  <div
    class="wa-ui-sidebar__logo"
    :class="{ 'is-collapsed': collapse, 'is-grouped': grouped }"
  >
    <SidebarLink
      class="wa-ui-sidebar__logo-link"
      :to="to"
      :link-component="linkComponent"
    >
      <img
        v-if="logo"
        :src="logo"
        :alt="title"
        class="wa-ui-sidebar__logo-img"
      />
      <h1
        v-else-if="collapse && title"
        class="wa-ui-sidebar__logo-title"
      >
        {{ title }}
      </h1>
      <span
        v-if="showBrand"
        class="wa-ui-sidebar__brand"
      >
        <strong
          v-if="title"
          class="wa-ui-sidebar__brand-name"
        >
          {{ title }}
        </strong>
        <i
          v-if="title && subtitle"
          class="wa-ui-sidebar__brand-divider"
          aria-hidden="true"
        ></i>
        <small
          v-if="subtitle"
          class="wa-ui-sidebar__brand-portal"
          :class="portalClass"
        >
          <span>{{ subtitle }}</span>
        </small>
      </span>
    </SidebarLink>
  </div>
</template>
