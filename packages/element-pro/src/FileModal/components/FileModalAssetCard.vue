<script setup lang="ts">
import { computed } from 'vue'
import { ElIcon } from 'element-plus'
import { Check, View } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { getAssetMediaType, getAssetMeta, getAssetPreviewUrl, getAssetThumb } from '../utils'
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
/** 卡片里的预览图：图片与视频统一取 `abbreviateUrl` */
const thumb = computed(() => getAssetThumb(props.asset))
const meta = computed(() => getAssetMeta(props.asset))
/** 只要有预览地址就展示入口；类型只决定用哪种查看器，避免识别不到类型时按钮消失 */
const previewable = computed(() => Boolean(getAssetPreviewUrl(props.asset)))
/** 视频卡片用 <video> 取首帧，图片仍用 <img> */
const isVideo = computed(() => getAssetMediaType(props.asset) === 'video')
/** 视频直接播 `previewUrl`；没有时退回缩略地址 */
const videoSrc = computed(() => {
  const src = getAssetPreviewUrl(props.asset) || thumb.value
  // 加 #t=0.1 让浏览器解码首帧，避免卡片一片黑
  return src && !src.includes('#t=') ? `${src}#t=0.1` : src
})
/** 视频的封面帧交给 `poster`，缩略地址与视频地址相同时不重复请求 */
const posterOf = computed(() => (props.asset.abbreviateUrl === videoSrc.value ? undefined : props.asset.abbreviateUrl))

const handleToggle = (): void => {
  emit('toggle')
}

/** 预览按钮独立于选中：只在按钮上触发，不冒泡去切换选中态 */
const handlePreview = (event: MouseEvent): void => {
  event.stopPropagation()
  emit('preview')
}

const handleKeydown = (event: KeyboardEvent): void => {
  // 预览按钮上的按键由按钮自己处理，不要连带切换选中
  if (event.target !== event.currentTarget) return
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
      <video
        v-if="isVideo"
        :src="videoSrc"
        :poster="posterOf"
        :class="`${base}__thumb-media`"
        muted
        playsinline
        preload="metadata"
      />
      <img
        v-else
        :src="thumb"
        :alt="asset.name"
        :class="`${base}__thumb-media`"
        loading="lazy"
      />
      <span
        v-if="active"
        :class="`${base}__check`"
      >
        <ElIcon><Check /></ElIcon>
      </span>
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
