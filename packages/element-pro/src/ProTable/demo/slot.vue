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
> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { data: [], total: 0, success: true }
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
      <template #headerTitle>
        <span style="background-color: green; color: #fff; width: 100%">headerTitle</span>
      </template>
      <template #headerSubtitle>
        <span style="background-color: gold; color: #fff; width: 100%">headerSubtitle</span>
      </template>
      <template #toolbar>
        <span style="background-color: red; color: #fff">toolbar</span>
      </template>
      <template #tableInfo>
        <div style="background-color: #64748b; color: #fff; padding: 8px">tableInfo（工具栏与表格区域之间）</div>
      </template>
      <template #tabSub>
        <span style="background-color: #8b5cf6; color: #fff; padding: 4px 8px">tabSub</span>
      </template>
      <template #searchActionLeft>
        <span style="background-color: teal; color: #fff; padding: 4px 8px">searchActionLeft</span>
      </template>
      <template #searchActionRight>
        <span style="background-color: #f97316; color: #fff; padding: 4px 8px">searchActionRight</span>
      </template>
      <template #selectionActions>
        <div style="background-color: blue; color: #fff; width: 100%">selectionActions</div>
      </template>
      <template #tableTitle>
        <div style="background-color: #14b8a6; color: #fff; padding: 8px">tableTitle</div>
      </template>
      <template #empty>
        <div style="background-color: antiquewhite; color: #fff; width: 100%">empty</div>
      </template>
    </ProTable>
  </ElConfigProvider>
</template>
