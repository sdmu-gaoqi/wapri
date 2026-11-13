<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { FileModal, type FileModalAsset, type FileModalQuery } from '@wapri/element-pro'
import type { RequestResult } from '@wapri/element-pro'

const selected = ref<Array<string | number>>([])
const lastConfirm = ref('尚未确认')

/** 用本地生成的 SVG 占位图模拟素材，避免依赖外部图床 */
const buildThumb = (index: number): string => {
  const hue = (index * 37) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(${hue} 70% 62%)"/><text x="100" y="112" font-size="36" text-anchor="middle" fill="#fff">${index}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const allAssets: FileModalAsset[] = Array.from({ length: 18 }, (_, index) => ({
  id: `asset-${index + 1}`,
  name: `素材图片_${String(index + 1).padStart(3, '0')}.png`,
  url: buildThumb(index + 1),
  size: 120 * 1024 + index * 4096,
  createdAt: Date.now() - index * 36e5,
}))

const request = async (
  params: FileModalQuery & { current: number; pageSize: number },
): Promise<RequestResult<FileModalAsset>> => {
  const start = (params.current - 1) * params.pageSize
  return { data: allAssets.slice(start, start + params.pageSize), total: allAssets.length }
}

const handleConfirm = (assets: FileModalAsset[]): void => {
  selected.value = assets.map((asset) => asset.id)
  lastConfirm.value = assets.map((asset) => asset.name).join('、') || '未选择'
}
</script>

<template>
  <div class="file-modal-action-demo">
    <p class="file-modal-action-demo__tip">
      action 插槽自己就是触发入口：点击按钮打开弹窗，开关由组件内部维护，不需要「v-model:open」。最近确认：{{
        lastConfirm
      }}
    </p>

    <FileModal
      v-model:selected="selected"
      :request="request"
      :columns="5"
      multiple
      @confirm="handleConfirm"
    >
      <template #action="{ visible }">
        <ElButton type="primary">
          {{ visible ? '选择中…' : '选择素材' }}
        </ElButton>
      </template>
    </FileModal>
  </div>
</template>

<style scoped>
.file-modal-action-demo__tip {
  margin: 0 0 12px;
  color: #909399;
  font-size: 13px;
}
</style>
