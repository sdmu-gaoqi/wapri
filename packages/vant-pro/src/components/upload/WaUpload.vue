<script setup lang="ts">
import { computed, ref } from 'vue'
import { showToast } from 'vant'
import WaUploadItem from './WaUploadItem.vue'
import { DEFAULT_UPLOAD_SOURCES, useUploadSources } from './useUploadSources'
import { createUploadItem, formatSizeLimit, isOversize, toPickResultList } from './useUploadList'
import type { UploadFileItem, UploadPickResult, UploadSource, WaUploadEmits, WaUploadProps } from './types'

defineOptions({ name: 'WaUpload' })

const props = withDefaults(defineProps<WaUploadProps>(), {
  modelValue: () => [],
  pick: undefined,
  maxCount: 9,
  accept: 'image/*',
  disabled: false,
  readonly: false,
  previewable: true,
  sources: () => DEFAULT_UPLOAD_SOURCES,
  maxSize: 10 * 1024 * 1024,
  uploadText: '上传',
})
const emit = defineEmits<WaUploadEmits>()

const sheetVisible = ref(false)
const { sources, sheetOptions } = useUploadSources(() => props.sources)
// 始终喂空数组给 van-uploader：列表由我们自己渲染，它只当容器与样式底座
const emptyFiles: UploadFileItem[] = []

const remaining = computed(() => Math.max(props.maxCount - props.modelValue.length, 0))
const showUpload = computed(() => !props.disabled && !props.readonly && remaining.value > 0)
const maxSizeText = computed(() => formatSizeLimit(props.maxSize))

const appendPicked = (results: UploadPickResult[], source: UploadSource) => {
  const accepted: UploadFileItem[] = []
  let oversizeCount = 0

  for (const result of results) {
    if (accepted.length >= remaining.value) break
    const item = createUploadItem(result)
    if (isOversize(item, props.maxSize)) {
      oversizeCount += 1
      emit('error', { type: 'size', message: `文件大小不能超过 ${maxSizeText.value}`, item, source })
      continue
    }
    accepted.push(item)
  }

  // 一次选择里可能同时超限多个，只提示一次，避免连续弹窗把用户顶屏
  if (oversizeCount > 0) showToast(`文件大小不能超过 ${maxSizeText.value}`)
  if (results.length > remaining.value) {
    emit('error', { type: 'count', message: `最多上传 ${props.maxCount} 个文件`, source })
  }
  if (accepted.length === 0) return

  // 受控：只抛新数组，组件内不自行 push，父组件不接 v-model 时列表不会被偷偷改掉
  emit('update:modelValue', [...props.modelValue, ...accepted])
  emit('picked', accepted)
}

const openSheet = () => {
  if (!showUpload.value) return
  sheetVisible.value = true
}

const handleSelect = async (_option: unknown, index: unknown) => {
  sheetVisible.value = false
  if (typeof index !== 'number') return
  const source = sources.value[index]
  if (!source) return

  // 先抛 select：父组件即使没传 pick 也能自己走业务上传
  emit('select', source)
  if (!props.pick) return

  try {
    // 取图/取文件是业务能力，用户取消或桥接报错都算正常流程，交给父组件在 select 里兜底
    const result = await props.pick(source, {
      accept: props.accept,
      maxSize: props.maxSize,
      remaining: remaining.value,
    })
    const picked = toPickResultList(result)
    if (picked.length > 0) appendPicked(picked, source)
  } catch {
    // 静默：不打扰用户，也不产生半截列表
  }
}

const canRemove = (item: UploadFileItem): boolean => !props.disabled && !props.readonly && item.deletable !== false

const handleRemove = (item: UploadFileItem, index: number) => {
  if (!canRemove(item)) return
  emit('remove', item, index)
  emit(
    'update:modelValue',
    props.modelValue.filter((_, current) => current !== index),
  )
}

const handleRetry = (item: UploadFileItem, index: number) => {
  emit('retry', item, index)
}

const handlePreview = (item: UploadFileItem, index: number) => {
  if (!props.previewable || !item.url) return
  emit('preview', item, index)
}
</script>

<template>
  <div
    class="wa-mobile-upload"
    :class="{ 'wa-mobile-upload--disabled': disabled }"
  >
    <van-uploader
      class="wa-mobile-upload__uploader"
      :model-value="emptyFiles"
      :preview-image="false"
      :readonly="true"
    >
      <div class="wa-mobile-upload__grid">
        <WaUploadItem
          v-for="(item, index) in modelValue"
          :key="item.id ?? item.url ?? index"
          :item="item"
          :removable="canRemove(item)"
          @remove="handleRemove(item, index)"
          @retry="handleRetry(item, index)"
          @preview="handlePreview(item, index)"
        />
        <button
          v-if="showUpload"
          class="wa-mobile-upload__trigger"
          type="button"
          @click="openSheet"
        >
          <span class="wa-mobile-upload__trigger-inner">
            <van-icon
              name="plus"
              size="24"
            />
            <span class="wa-mobile-upload__trigger-text">{{ uploadText }}</span>
          </span>
        </button>
      </div>
    </van-uploader>
    <van-share-sheet
      v-model:show="sheetVisible"
      :options="sheetOptions"
      teleport="body"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.wa-mobile-upload {
  width: 100%;
}

.wa-mobile-upload__uploader {
  width: 100%;
}

/* van-uploader 的插槽容器默认按内容收缩，网格用百分比宽度时会算不出来，这里拉满 */
.wa-mobile-upload__uploader :deep(.van-uploader__input-wrapper) {
  width: 100%;
}

/* 方格子：用 padding-bottom 撑成正方形，老 WebView 也能拿到正确比例 */
.wa-mobile-upload__grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--wa-mobile-gap, 16rpx);
}

.wa-mobile-upload__trigger {
  position: relative;
  display: block;
  width: 100%;
  height: 0;
  padding: 0 0 100%;
  overflow: hidden;
  border: 2rpx dashed var(--wa-mobile-border-color, #ebedf0);
  border-radius: var(--wa-mobile-radius, 16rpx);
  background: var(--wa-mobile-background, #f7f8fa);
  color: var(--wa-mobile-text-color-weak, #969799);
}

.wa-mobile-upload__trigger-inner {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.wa-mobile-upload__trigger-text {
  margin-top: 8rpx;
  font-size: 24rpx;
}

.wa-mobile-upload--disabled .wa-mobile-upload__trigger {
  opacity: 0.5;
}
</style>
