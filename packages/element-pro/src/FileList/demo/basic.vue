<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElSwitch } from 'element-plus'
import { configurePdfjs } from '@wapri/preview'
import { FileList, type FileListItem } from '@wapri/element-pro'

// 文档站把 pdf.js worker 放在 public 下，业务侧按自己的部署位置配置。
configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })

/** 用本地生成的 SVG 占位图模拟缩略图，避免依赖外部图床。 */
const buildThumb = (index: number, label: string): string => {
  const hue = (index * 47) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="hsl(${hue} 65% 62%)"/><text x="120" y="134" font-size="40" text-anchor="middle" fill="#fff">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const data = ref<FileListItem[]>([
  {
    id: 'f-1',
    name: '商品主图_01.png',
    abbreviateUrl: buildThumb(1, '01'),
    previewUrl: buildThumb(1, '01'),
  },
  {
    id: 'f-2',
    name: '商品主图_02.png',
    abbreviateUrl: buildThumb(2, '02'),
    previewUrl: buildThumb(2, '02'),
  },
  {
    id: 'f-3',
    name: '商品主图_03.png',
    abbreviateUrl: buildThumb(3, '03'),
    previewUrl: buildThumb(3, '03'),
  },
  {
    id: 'f-4',
    name: '产品演示视频.mp4',
    abbreviateUrl: buildThumb(4, 'MP4'),
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'f-5',
    name: '产品说明书.pdf',
    abbreviateUrl: buildThumb(5, 'PDF'),
    previewUrl: '/demo/sample.pdf',
  },
  {
    id: 'f-6',
    name: '资质证明.pdf',
    abbreviateUrl: buildThumb(6, 'PDF'),
    previewUrl: '/demo/sample.pdf',
  },
])

const sortable = ref(true)
const removable = ref(true)

const handleRemove = (item: FileListItem): void => {
  ElMessage.success(`已删除 ${item.name}`)
}

const handleSort = (_data: FileListItem[], oldIndex: number, newIndex: number): void => {
  ElMessage.info(`第 ${oldIndex + 1} 项移动到第 ${newIndex + 1} 项`)
}
</script>

<template>
  <div class="file-list-demo">
    <div class="file-list-demo__toolbar">
      <el-switch
        v-model="sortable"
        active-text="拖动排序"
      />
      <el-switch
        v-model="removable"
        active-text="允许删除"
      />
      <span class="file-list-demo__count">共 {{ data.length }} 个文件</span>
    </div>

    <FileList
      v-model:data="data"
      :columns="6"
      :sortable="sortable"
      :removable="removable"
      @remove="handleRemove"
      @sort="handleSort"
    />
  </div>
</template>

<style scoped>
.file-list-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.file-list-demo__count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
