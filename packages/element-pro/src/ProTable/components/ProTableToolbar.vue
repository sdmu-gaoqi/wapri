<script setup lang="ts">
import { AlertProps, ElButton } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import { computed, isVNode, type VNode, type VNodeChild } from 'vue'
import { useConfig } from '../../ConfigProvider/context'

defineProps<{
  headerTitle?: VNodeChild
  headerSubtitle?: VNodeChild
  toolbarItems: VNodeChild[]
  showReload: boolean
  headerAlert?: AlertProps
  loading?: boolean
  download?: boolean | string | VNode
}>()

const emit = defineEmits<{ reload: []; download: [] }>()

const { prefix, size } = useConfig()

const sizeClass = computed(() => {
  return `${prefix.value}-pro-table__toolbar--${size.value}`
})

defineOptions({ name: 'ProTableToolbar' })
</script>

<template>
  <div :class="[`${prefix}-pro-table__toolbar`, sizeClass]">
    <div :class="`${prefix}-pro-table__toolbar-title`">
      <div :class="`${prefix}-pro-table__toolbar-title-main`">
        <slot name="headerTitle">{{ headerTitle }}</slot>
      </div>
      <div
        v-if="$slots.headerSubtitle || headerSubtitle"
        :class="`${prefix}-pro-table__toolbar-title-sub`"
      >
        <slot name="headerSubtitle">{{ headerSubtitle || '' }}</slot>
      </div>
    </div>
    <div :class="`${prefix}-pro-table__toolbar-actions`">
      <slot name="toolbar">
        <template
          v-for="(item, index) in toolbarItems"
          :key="index"
        >
          <component
            :is="item"
            v-if="isVNode(item)"
          />
          <span v-else>{{ item }}</span>
        </template>
      </slot>
      <ElButton
        v-if="download !== undefined && download !== false"
        :icon="Download"
        @click="emit('download')"
      >
        <component
          :is="download"
          v-if="isVNode(download)"
        />
        <template v-else>{{ download === true ? '导出' : download }}</template>
      </ElButton>
      <ElButton
        v-if="showReload"
        :icon="Refresh"
        circle
        :loading="loading"
        @click="emit('reload')"
      />
    </div>
  </div>
  <ElAlert
    v-if="headerAlert?.type"
    v-bind="headerAlert"
    :class="`${prefix}-pro-table__toolbar-alert`"
  />
</template>
