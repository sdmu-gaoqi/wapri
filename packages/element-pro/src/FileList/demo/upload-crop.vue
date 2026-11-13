<script setup lang="ts">
import { ref } from 'vue'
import { ElIcon, ElSlider } from 'element-plus'
import type { UploadProgressEvent, UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { CropperUpload, FileList, type FileListItem } from '@wapri/element-pro'

/** 演示上限：达到后禁用追加单元格里的上传入口。 */
const MAX_COUNT = 6

/** 卡片宽度（px），拖动滑块观察一行能放几张；设置 width 后 columns 失效。 */
const width = ref(120)

const data = ref<FileListItem[]>([])
const status = ref('还没有图片')

let seq = 0

/** 裁剪结果拿不到远程地址时，用 blob 地址直接预览，真实业务换成上传接口返回的 URL。 */
const createItem = (file: File): FileListItem => {
  const url = URL.createObjectURL(file)
  seq += 1
  return {
    id: `upload-${seq}`,
    name: file.name || `图片-${seq}.png`,
    abbreviateUrl: url,
    previewUrl: url,
  }
}

/** CropperUpload 的 httpRequest 收到的是裁剪结果，这里不做真实请求，直接加入列表。 */
const handleUpload = (options: UploadRequestOptions): void => {
  data.value = [...data.value, createItem(options.file)]
  status.value = `已加入：${options.file.name}`
  options.onProgress({ percent: 100 } as UploadProgressEvent)
  options.onSuccess({ name: options.file.name })
}

const handleCrop = (file: File): void => {
  status.value = `裁剪完成：${file.name}（${(file.size / 1024).toFixed(1)} KB）`
}

const handleRemove = (item: FileListItem): void => {
  if (typeof item.previewUrl === 'string' && item.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl)
  }
  status.value = `已移除：${item.name}`
}
</script>

<template>
  <div class="file-list-upload-demo">
    <p class="file-list-upload-demo__tip">
      固定卡片宽度、按容器自动换行；上传入口放在
      <code>append</code>
      插槽里，选择图片后先裁剪、确认后写入列表。当前：{{ status }}
    </p>

    <div class="file-list-upload-demo__toolbar">
      <span class="file-list-upload-demo__width">卡片宽度：{{ width }}px</span>
      <ElSlider
        v-model="width"
        class="file-list-upload-demo__slider"
        :min="80"
        :max="220"
        :step="10"
      />
    </div>

    <FileList
      v-model:data="data"
      :width="width"
      @remove="handleRemove"
    >
      <template #append="{ count }">
        <CropperUpload
          action="#"
          accept="image/*"
          :show-file-list="false"
          :disabled="count >= MAX_COUNT"
          :ratios="[1, 4 / 3, 16 / 9]"
          :http-request="handleUpload"
          @crop="handleCrop"
        >
          <span
            :class="[
              'file-list-upload-demo__trigger',
              { 'file-list-upload-demo__trigger--disabled': count >= MAX_COUNT },
            ]"
          >
            <span class="file-list-upload-demo__body">
              <ElIcon><Plus /></ElIcon>
              <span>{{ count >= MAX_COUNT ? '已达上限' : '上传图片' }}</span>
            </span>
            <span class="file-list-upload-demo__label">裁剪后加入列表</span>
          </span>
        </CropperUpload>
      </template>
    </FileList>
  </div>
</template>

<style scoped>
.file-list-upload-demo__tip {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.file-list-upload-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.file-list-upload-demo__width {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.file-list-upload-demo__slider {
  width: 220px;
}

.file-list-upload-demo__trigger {
  display: block;
  width: 100%;
  cursor: pointer;
}

.file-list-upload-demo__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.file-list-upload-demo__trigger:not(.file-list-upload-demo__trigger--disabled):hover .file-list-upload-demo__body {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.file-list-upload-demo__trigger--disabled,
.file-list-upload-demo__trigger--disabled .file-list-upload-demo__body {
  cursor: not-allowed;
  opacity: 0.6;
}

.file-list-upload-demo__label {
  display: block;
  margin: 6px 2px 2px;
  overflow: hidden;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
