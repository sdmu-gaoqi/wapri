<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import 'element-plus/dist/index.css'
import {
  FileModal,
  type FileModalAsset,
  type FileModalGroup,
  type FileModalGroupPayload,
  type FileModalQuery,
} from '@wapri/element-pro'
import { addGroupToTree, removeGroupFromTree } from '@wapri/element-pro'
import type { RequestResult } from '@wapri/element-pro'

const open = ref(false)
const selected = ref<Array<string | number>>([])
const lastConfirm = ref('尚未确认')

const groups = ref<FileModalGroup[]>([
  {
    id: 'g-1',
    name: '商品主图',
    color: '#409eff',
    // 子分类：左侧会缩进挂在「商品主图」下面
    children: [{ id: 'g-3', name: '白底图', color: '#409eff' }],
  },
  { id: 'g-2', name: '详情素材', color: '#67c23a' },
])

/** 用本地生成的 SVG 占位图模拟素材，避免依赖外部图床 */
const buildThumb = (index: number): string => {
  const hue = (index * 37) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(${hue} 70% 62%)"/><text x="100" y="112" font-size="36" text-anchor="middle" fill="#fff">${index}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface DemoAsset extends FileModalAsset {
  groupId?: string
}

/** 78 条素材，模拟真实分页 */
const allAssets: DemoAsset[] = Array.from({ length: 78 }, (_, index) => ({
  id: `asset-${index + 1}`,
  name: `素材图片_${String(index + 1).padStart(3, '0')}.png`,
  url: buildThumb(index + 1),
  size: 120 * 1024 + index * 4096,
  createdAt: Date.now() - index * 36e5,
  groupId: index % 3 === 2 ? 'g-2' : 'g-1',
}))

/** 与 ProTable 完全一致的 request 约定 */
const request = async (
  params: FileModalQuery & { current: number; pageSize: number },
): Promise<RequestResult<DemoAsset>> => {
  let rows = allAssets
  if (params.groupId) rows = rows.filter((row) => row.groupId === params.groupId)
  if (params.keyword) rows = rows.filter((row) => row.name.includes(params.keyword as string))
  if (params.sortBy === 'name') rows = [...rows].sort((left, right) => left.name.localeCompare(right.name))
  if (params.sortBy === 'size') rows = [...rows].sort((left, right) => (right.size ?? 0) - (left.size ?? 0))

  const start = (params.current - 1) * params.pageSize
  return { data: rows.slice(start, start + params.pageSize), total: rows.length }
}

/** 新建分组：`parentId` 决定挂到哪个分类下，本地用工具函数把它插进分类树 */
const createGroup = async (payload: FileModalGroupPayload): Promise<FileModalGroup> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const group: FileModalGroup = { id: `g-${Date.now()}`, name: payload.name, color: payload.color }
  groups.value = addGroupToTree(groups.value, group, payload.parentId)
  return group
}

/** 编辑分组：先从树里摘掉再按新的上级挂回，改层级也能生效 */
const updateGroup = async (group: FileModalGroup, payload: FileModalGroupPayload): Promise<FileModalGroup> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const next: FileModalGroup = { ...group, name: payload.name, color: payload.color }
  groups.value = addGroupToTree(removeGroupFromTree(groups.value, group.id), next, payload.parentId)
  return next
}

/** 删除分组：删除逻辑由使用方自己实现，这里直接改本地分类树 */
const removeGroup = async (group: FileModalGroup): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  groups.value = removeGroupFromTree(groups.value, group.id)
}

/** 上传裁剪结果：返回的素材会插入列表并自动选中 */
const upload = async (file: File, context: { groupId?: string }): Promise<DemoAsset> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const asset: DemoAsset = {
    id: `asset-${Date.now()}`,
    name: file.name,
    url: URL.createObjectURL(file),
    size: file.size,
    createdAt: Date.now(),
    groupId: context.groupId,
  }
  allAssets.unshift(asset)
  return asset
}

const handleConfirm = (assets: DemoAsset[]) => {
  selected.value = assets.map((asset) => asset.id)
  lastConfirm.value = assets.map((asset) => asset.name).join('、') || '未选择'
}
</script>

<template>
  <div class="file-modal-demo">
    <p class="file-modal-demo__tip">已选 id：{{ selected.join('、') || '无' }}；最近确认：{{ lastConfirm }}</p>

    <ElButton
      type="primary"
      @click="open = true"
    >
      选择素材
    </ElButton>

    <FileModal
      v-model:open="open"
      v-model:selected="selected"
      title="选择图片"
      :request="request"
      :groups="groups"
      :columns="6"
      :modes="['list', 'table']"
      :create-group="createGroup"
      :update-group="updateGroup"
      :remove-group="removeGroup"
      :upload="upload"
      multiple
      @confirm="handleConfirm"
    />
  </div>

  <p class="file-modal-demo__tip">
    <ElTag size="small">request</ElTag>
    与 ProTable 同签名，参数含
    <ElTag size="small">keyword</ElTag>
    <ElTag size="small">sortBy</ElTag>
    <ElTag size="small">groupId</ElTag>
    。
  </p>
</template>

<style scoped>
.file-modal-demo__tip {
  margin: 0 0 12px;
  color: #909399;
  font-size: 13px;
}
</style>
