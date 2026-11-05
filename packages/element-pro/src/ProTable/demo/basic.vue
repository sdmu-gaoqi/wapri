<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProTable, type ActionType, type ProColumn, type RequestFn } from '@wapri/element-pro'

interface Product {
  id: number
  name: string
  category: 'book' | 'digital'
  status: 'selling' | 'draft'
  price: number
  createdAt: string
}

const actionRef = ref<ActionType>()
const source: Product[] = [
  { id: 1, name: 'Vue 组件设计指南', category: 'book', status: 'selling', price: 88, createdAt: '2026-08-01' },
  { id: 2, name: 'TypeScript 实战课程', category: 'digital', status: 'selling', price: 128, createdAt: '2026-08-05' },
  { id: 3, name: '设计系统入门', category: 'book', status: 'draft', price: 66, createdAt: '2026-08-08' },
]

const columns: ProColumn<Product>[] = [
  { title: '商品名称', dataIndex: 'name', sorter: true, hideInForm: true },
  {
    title: '分类',
    dataIndex: 'category',
    valueType: 'select',
    valueEnum: { book: '图书', digital: '数字内容' },
    fieldProps: {
      col: {
        span: 8,
      },
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    hideInForm: true,
    valueEnum: { selling: '出售中', draft: '草稿' },
  },
  { title: '价格', dataIndex: 'price', valueType: 'money' },
  { title: '创建时间', dataIndex: 'createdAt', valueType: 'date' },
]

const request: RequestFn<
  Product,
  { name?: string; category?: string; status?: string; tabActiveKey?: string }
> = async (params) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  let filtered = source
  if (params.name) filtered = filtered.filter((item) => item.name.includes(params.name || ''))
  if (params.category) filtered = filtered.filter((item) => item.category === params.category)
  if (params.status) filtered = filtered.filter((item) => item.status === params.status)
  if (params.tabActiveKey === 'selling') filtered = filtered.filter((item) => item.status === 'selling')
  if (params.tabActiveKey === 'draft') filtered = filtered.filter((item) => item.status === 'draft')
  const start = (params.current - 1) * params.pageSize
  return { data: filtered.slice(start, start + params.pageSize), total: filtered.length, success: true }
}

function reload(): void {
  void actionRef.value?.reload(true)
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProTable
      ref="actionRef"
      :columns="columns"
      :request="request"
      :row-selection="{}"
      :table-props="{
        border: true,
      }"
      :tabs="[
        { key: 'all', tab: '全部商品' },
        { key: 'selling', tab: '出售中' },
        { key: 'draft', tab: '草稿' },
      ]"
      default-tab-active-key="all"
      header-title="商品列表"
      header-subtitle="管理商品生命周期；已删除商品请到回收站恢复"
      selected-filters-title="当前筛选"
    >
      <template #toolbar>
        <ElButton @click="reload">刷新数据</ElButton>
        <ElButton type="primary">新增商品</ElButton>
      </template>
      <template #selectionActions>
        <ElButton>批量强制下架</ElButton>
        <ElButton
          type="danger"
          plain
        >
          批量封禁
        </ElButton>
        <ElButton>批量解封</ElButton>
      </template>
    </ProTable>
  </ElConfigProvider>
</template>
