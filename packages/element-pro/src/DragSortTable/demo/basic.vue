<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { DragSortTable, type ProColumn } from '@wapri/element-pro'

interface Banner {
  id: number
  sort: number
  title: string
  channel: 'home' | 'category'
  status: 'online' | 'offline'
}

const banners = ref<Banner[]>([
  { id: 1, sort: 1, title: '双十一主会场', channel: 'home', status: 'online' },
  { id: 2, sort: 2, title: '品类日 · 家电', channel: 'category', status: 'online' },
  { id: 3, sort: 3, title: '新人礼包', channel: 'home', status: 'offline' },
  { id: 4, sort: 4, title: '会员专享折扣', channel: 'category', status: 'online' },
])

const columns: ProColumn<Banner>[] = [
  { title: '排序', dataIndex: 'sort', width: 72, columnProps: { align: 'center' } },
  { title: '轮播标题', dataIndex: 'title' },
  {
    title: '投放位置',
    dataIndex: 'channel',
    valueType: 'select',
    valueEnum: { home: '首页', category: '分类页' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { online: '已上线', offline: '未上线' },
  },
]

/**
 * 拖完只需把新顺序落到自己的数据里，表格已经按新顺序展示了。
 * 这里的 `sort` 字段演示「顺序另存成一个数字」的常见做法。
 */
const handleDragSortEnd = (beforeIndex: number, afterIndex: number, next: Banner[]) => {
  next.forEach((item, index) => {
    item.sort = index + 1
  })
  banners.value = [...next]
  console.log(
    `第 ${beforeIndex + 1} 行 → 第 ${afterIndex + 1} 行`,
    next.map((item) => item.title),
  )
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <p style="margin: 0 0 12px; color: var(--el-text-color-secondary)">
      当前顺序：{{ banners.map((item) => item.title).join(' → ') }}
    </p>
    <DragSortTable
      :columns="columns"
      :data-source="banners"
      row-key="id"
      drag-sort-key="sort"
      :search="false"
      :pagination="false"
      :table-props="{ border: true }"
      header-title="轮播图排序"
      :on-drag-sort-end="handleDragSortEnd"
    />
  </ElConfigProvider>
</template>
