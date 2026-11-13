<script setup lang="ts">
import { computed } from 'vue'
import { ElIcon } from 'element-plus'
import { Check, View } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import FileCard from '../../shared/fileCard/index.vue'
import { getAssetMeta, getAssetPreviewUrl } from '../utils'
import type { FileModalAsset } from '../types'

const props = defineProps<{
  asset: FileModalAsset
  active?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  /** 请求预览，具体怎么预览由业务决定 */
  preview: []
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalAssetCard' })

const base = computed(() => `${prefix.value}-file-modal`)
const meta = computed(() => getAssetMeta(props.asset))
/** 只要有预览地址就展示入口；类型只决定用哪种查看器，避免识别不到类型时按钮消失 */
const previewable = computed(() => Boolean(getAssetPreviewUrl(props.asset)))

/** 预览按钮独立于选中：只在按钮上触发，不冒泡去切换选中态 */
const handlePreview = (event: MouseEvent): void => {
  event.stopPropagation()
  emit('preview')
}
</script>

<template>
  <FileCard
    :source="asset"
    :active="active"
    actions-always-visible
    role="checkbox"
    :aria-checked="Boolean(active)"
    :aria-label="asset.name"
    @activate="emit('toggle')"
  >
    <template
      v-if="active"
      #badge
    >
      <span :class="`${base}__check`">
        <ElIcon><Check /></ElIcon>
      </span>
    </template>
    <template #actions>
      <button
        v-if="previewable"
        type="button"
        :class="`${base}__preview`"
        :aria-label="`预览 ${asset.name}`"
        :title="`预览 ${asset.name}`"
        @click="handlePreview"
      >
        <ElIcon><View /></ElIcon>
      </button>
    </template>
    <template
      v-if="meta"
      #meta
    >
      {{ meta }}
    </template>
  </FileCard>
</template>
