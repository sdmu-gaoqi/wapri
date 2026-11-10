<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import 'element-plus/dist/index.css'
import { FileModal, type FileModalAsset, type FileModalGroup, type FileModalQuery } from '@wapri/element-pro'
import type { RequestResult } from '@wapri/element-pro'

/** 不裁剪：默认行为，选完直接上传原图 */
const plainOpen = ref(false)
/** 只允许 9:16 */
const verticalOpen = ref(false)
/** 9:16 与 16:9 二选一 */
const bothOpen = ref(false)
/** 自定义（原图比例）与 1:1 并存 */
const customOpen = ref(false)

const groups: FileModalGroup[] = [{ id: 'g-1', name: '活动素材', color: '#409eff' }]

const buildThumb = (index: number): string => {
  const hue = (index * 53) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(${hue} 70% 62%)"/><text x="100" y="112" font-size="36" text-anchor="middle" fill="#fff">${index}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const allAssets: FileModalAsset[] = Array.from({ length: 24 }, (_, index) => ({
  id: `asset-${index + 1}`,
  name: `素材_${String(index + 1).padStart(2, '0')}.png`,
  url: buildThumb(index + 1),
  size: 90 * 1024 + index * 2048,
  createdAt: Date.now() - index * 36e5,
}))

const request = async (
  params: FileModalQuery & { current: number; pageSize: number },
): Promise<RequestResult<FileModalAsset>> => {
  let rows = allAssets
  if (params.keyword) rows = rows.filter((row) => row.name.includes(params.keyword as string))
  const start = (params.current - 1) * params.pageSize
  return { data: rows.slice(start, start + params.pageSize), total: rows.length }
}

const upload = async (file: File): Promise<FileModalAsset> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { id: `asset-${Date.now()}`, name: file.name, url: URL.createObjectURL(file), size: file.size }
}
</script>

<template>
  <div class="ratio-demo">
    <p class="ratio-demo__tip">
      `cropper-ratios` 为空（默认）时不裁剪，选完图片直接上传原图；传入比例后才打开裁剪弹窗。
    </p>

    <div class="ratio-demo__row">
      <ElButton
        type="primary"
        @click="plainOpen = true"
      >
        不裁剪（默认）
      </ElButton>
      <ElTag size="small">cropper-ratios 不传</ElTag>
    </div>

    <div class="ratio-demo__row">
      <ElButton
        type="primary"
        plain
        @click="verticalOpen = true"
      >
        只允许 9:16
      </ElButton>
      <ElTag size="small">[9 / 16]</ElTag>
    </div>

    <div class="ratio-demo__row">
      <ElButton
        type="primary"
        plain
        @click="bothOpen = true"
      >
        9:16 与 16:9 二选一
      </ElButton>
      <ElTag size="small">[9 / 16, 16 / 9]</ElTag>
      <ElTag size="small">['竖版', '横版']</ElTag>
    </div>

    <div class="ratio-demo__row">
      <ElButton
        type="primary"
        plain
        @click="customOpen = true"
      >
        原图比例与 1:1 二选一
      </ElButton>
      <ElTag size="small">[0, 1]</ElTag>
    </div>

    <FileModal
      v-model:open="plainOpen"
      :request="request"
      :groups="groups"
      :upload="upload"
      title="不裁剪"
    />

    <FileModal
      v-model:open="verticalOpen"
      :request="request"
      :groups="groups"
      :upload="upload"
      :cropper-ratios="[9 / 16]"
      title="竖版素材"
      upload-text="上传竖版素材"
    />

    <FileModal
      v-model:open="bothOpen"
      :request="request"
      :groups="groups"
      :upload="upload"
      :cropper-ratios="[9 / 16, 16 / 9]"
      :cropper-ratio-labels="['竖版', '横版']"
      title="活动素材"
    />

    <FileModal
      v-model:open="customOpen"
      :request="request"
      :groups="groups"
      :upload="upload"
      :cropper-ratios="[0, 1]"
      :cropper-ratio-labels="['原图比例', '正方形']"
      title="商品图"
    />
  </div>
</template>

<style scoped>
.ratio-demo__tip {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.ratio-demo__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
