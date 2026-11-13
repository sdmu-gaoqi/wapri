<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useConfig } from '../../ConfigProvider/context'
import { getFileIconInfo, getFileMediaType, getFileThumb, getFileVideoPoster, getFileVideoSrc } from '../media'
import type { FileCardEmits, FileCardProps, FileCardSlots } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<FileCardProps>(), {
  active: false,
  disabled: false,
  keyboardSortable: false,
  actionsAlwaysVisible: false,
})

const emit = defineEmits<FileCardEmits>()

defineSlots<FileCardSlots>()

const { prefix } = useConfig()

defineOptions({ name: 'FileCard' })

const base = computed(() => `${prefix.value}-file-card`)

/** 缩略图加载失败时降级为类型图标，避免卡片一片空白。 */
const thumbFailed = ref(false)
/** 视频首帧加载失败时退回图片封面，封面也失败再降级为类型图标。 */
const videoFailed = ref(false)

watch([() => props.source.abbreviateUrl, () => props.source.previewUrl, () => props.source.url], () => {
  thumbFailed.value = false
  videoFailed.value = false
})

const mediaType = computed(() => getFileMediaType(props.source))
const isVideo = computed(() => mediaType.value === 'video')
const thumb = computed(() => getFileThumb(props.source))
const videoSrc = computed(() => getFileVideoSrc(props.source))
const videoPoster = computed(() => getFileVideoPoster(props.source))
const showVideo = computed(() => isVideo.value && Boolean(videoSrc.value) && !videoFailed.value)
const showThumb = computed(() => Boolean(thumb.value) && !thumbFailed.value && !showVideo.value)
/** 没有可用缩略图时，按文件类型展示对应的占位图标。 */
const fileIcon = computed(() => getFileIconInfo(props.source))

const handleClick = (): void => {
  emit('activate')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (props.keyboardSortable) return
  if (event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  emit('activate')
}
</script>

<template>
  <div
    :class="[
      base,
      {
        [`${base}--active`]: active,
        [`${base}--disabled`]: disabled,
      },
    ]"
    tabindex="0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div :class="`${base}__thumb`">
      <video
        v-if="showVideo"
        :class="`${base}__thumb-video`"
        :src="videoSrc"
        :poster="videoPoster"
        :aria-label="source.name"
        muted
        playsinline
        preload="metadata"
        @error="videoFailed = true"
      />
      <img
        v-else-if="showThumb"
        :class="`${base}__thumb-image`"
        :src="thumb"
        :alt="source.name"
        loading="lazy"
        @error="thumbFailed = true"
      />
      <span
        v-else
        :class="[`${base}__thumb-fallback`, `${base}__thumb-fallback--${fileIcon.type}`]"
      >
        <svg
          :class="`${base}__file-icon`"
          viewBox="0 0 48 56"
          aria-hidden="true"
        >
          <path
            :class="`${base}__file-icon-page`"
            d="M6 2h25l11 11v41H6z"
          />
          <path
            :class="`${base}__file-icon-fold`"
            d="M31 2v11h11"
          />
          <text
            :class="`${base}__file-icon-label`"
            x="24"
            y="36"
            text-anchor="middle"
          >
            {{ fileIcon.label }}
          </text>
        </svg>
      </span>

      <span
        :class="`${base}__name`"
        :title="source.name"
      >
        {{ source.name }}
      </span>

      <div
        v-if="$slots.badge"
        :class="`${base}__badge`"
      >
        <slot name="badge"></slot>
      </div>

      <div
        v-if="$slots.actions"
        :class="[`${base}__actions`, { [`${base}__actions--always`]: actionsAlwaysVisible }]"
      >
        <slot name="actions"></slot>
      </div>
    </div>

    <div
      v-if="$slots.meta"
      :class="`${base}__meta`"
    >
      <slot name="meta"></slot>
    </div>
  </div>
</template>
