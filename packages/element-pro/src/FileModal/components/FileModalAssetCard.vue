<script setup lang="ts">
import { computed } from 'vue'
import { ElIcon } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { getAssetMeta, getAssetThumb } from '../utils'
import type { FileModalAsset } from '../types'

const props = defineProps<{
  asset: FileModalAsset
  active?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalAssetCard' })

const base = computed(() => `${prefix.value}-file-modal`)
const thumb = computed(() => getAssetThumb(props.asset))
const meta = computed(() => getAssetMeta(props.asset))

const handleToggle = (): void => {
  emit('toggle')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  emit('toggle')
}
</script>

<template>
  <div
    :class="[`${base}__card`, active && `${base}__card--active`]"
    role="checkbox"
    :aria-checked="Boolean(active)"
    :aria-label="asset.name"
    tabindex="0"
    @click="handleToggle"
    @keydown="handleKeydown"
  >
    <div :class="`${base}__thumb`">
      <img
        :src="thumb"
        :alt="asset.name"
        loading="lazy"
      />
      <span
        v-if="active"
        :class="`${base}__check`"
      >
        <ElIcon><Check /></ElIcon>
      </span>
    </div>
    <p
      :class="`${base}__name`"
      :title="asset.name"
    >
      {{ asset.name }}
    </p>
    <p
      v-if="meta"
      :class="`${base}__meta`"
    >
      {{ meta }}
    </p>
  </div>
</template>
