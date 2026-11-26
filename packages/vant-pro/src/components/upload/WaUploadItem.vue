<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize, isImageItem, percentOf } from './useUploadList'
import type { UploadFileItem } from './types'

/**
 * 单个上传格子（内部组件）。
 * 拆出来只为一件事：列表项的缩略图/进度/删除三种状态样式很重，留在容器里会把主组件撑爆。
 */
defineOptions({ name: 'WaUploadItem' })

const props = withDefaults(
  defineProps<{
    item: UploadFileItem
    removable?: boolean
  }>(),
  { removable: true },
)
const emit = defineEmits<{
  remove: []
  preview: []
  retry: []
}>()

const isImage = computed(() => isImageItem(props.item))
const percent = computed(() => percentOf(props.item))
const sizeText = computed(() => formatFileSize(props.item.size))

const handleClick = () => {
  // 失败态整块都是重试热区，避免用户点了没反应
  if (props.item.status === 'failed') emit('retry')
  else emit('preview')
}
</script>

<template>
  <div class="wa-mobile-upload__item">
    <button
      class="wa-mobile-upload__preview"
      type="button"
      @click="handleClick"
    >
      <van-image
        v-if="isImage"
        class="wa-mobile-upload__image"
        :src="item.url"
        fit="cover"
      >
        <template #error>
          <span class="wa-mobile-upload__file">
            <van-icon
              name="description-o"
              size="28"
            />
          </span>
        </template>
      </van-image>
      <span
        v-else
        class="wa-mobile-upload__file"
      >
        <van-icon
          name="description-o"
          size="28"
        />
        <span class="wa-mobile-upload__file-name">{{ item.name || '未命名文件' }}</span>
      </span>
      <span
        v-if="item.status === 'uploading'"
        class="wa-mobile-upload__mask"
      >
        <van-loading
          type="circular"
          size="20"
          color="#fff"
        />
        <span class="wa-mobile-upload__percent">{{ percent }}%</span>
      </span>
      <span
        v-else-if="item.status === 'failed'"
        class="wa-mobile-upload__mask wa-mobile-upload__mask--failed"
      >
        <van-icon
          name="replay"
          size="22"
          color="#fff"
        />
        <span class="wa-mobile-upload__percent">重试</span>
      </span>
    </button>
    <button
      v-if="removable"
      class="wa-mobile-upload__remove"
      type="button"
      aria-label="删除"
      @click.stop="emit('remove')"
    >
      <van-icon
        name="cross"
        size="12"
        color="#fff"
      />
    </button>
    <span
      v-if="sizeText"
      class="wa-mobile-upload__size"
    >
      {{ sizeText }}
    </span>
  </div>
</template>

<style scoped>
.wa-mobile-upload__item {
  position: relative;
  display: block;
  width: 100%;
  height: 0;
  padding: 0 0 100%;
  overflow: hidden;
  border-radius: var(--wa-mobile-radius, 16rpx);
  background: var(--wa-mobile-background, #f7f8fa);
}

.wa-mobile-upload__preview {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
}

.wa-mobile-upload__image {
  width: 100%;
  height: 100%;
}

.wa-mobile-upload__file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  padding: 12rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
}

.wa-mobile-upload__file-name {
  max-width: 100%;
  overflow: hidden;
  font-size: 22rpx;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 遮罩不吃事件：上传中/失败都在整块热区上处理，避免小图标点不中 */
.wa-mobile-upload__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.wa-mobile-upload__mask--failed {
  background: rgba(0, 0, 0, 0.55);
}

.wa-mobile-upload__percent {
  margin-top: 8rpx;
}

.wa-mobile-upload__remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
}

.wa-mobile-upload__size {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 4rpx 8rpx;
  overflow: hidden;
  color: #fff;
  font-size: 20rpx;
  line-height: 1.4;
  white-space: nowrap;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}
</style>
