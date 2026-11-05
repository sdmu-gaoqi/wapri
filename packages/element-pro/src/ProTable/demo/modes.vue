<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider, ElTag } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProTable, type ProColumn } from '@wapri/element-pro'

interface Product {
  id: number
  name: string
  category: string
  price: number
}

const mode = ref<'table' | 'list'>('table')
const source: Product[] = [
  { id: 1, name: 'Vue 组件设计指南', category: '图书', price: 88 },
  { id: 2, name: 'TypeScript 实战课程', category: '数字内容', price: 128 },
  { id: 3, name: '设计系统入门', category: '图书', price: 66 },
]
const columns: ProColumn<Product>[] = [
  { title: '商品名称', dataIndex: 'name' },
  { title: '分类', dataIndex: 'category' },
  { title: '价格', dataIndex: 'price', valueType: 'money' },
]
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProTable
      :columns="columns"
      :data-source="source"
      :modes="['table', 'list']"
      :list-props="{ columns: 3, gap: 12 }"
      @mode-change="(nextMode) => (mode = nextMode)"
    >
      <template #selectModeBefore>
        <span>当前为{{ mode === 'table' ? '表格' : '列表' }}模式</span>
      </template>
      <template #itemRender="{ item }">
        <div style="border: 1px solid var(--el-border-color-lighter); border-radius: 8px; padding: 16px">
          <div style="font-weight: 600">{{ item.name }}</div>
          <ElTag
            size="small"
            style="margin-top: 8px"
          >
            {{ item.category }}
          </ElTag>
          <div style="color: var(--el-color-primary); margin-top: 12px">¥{{ item.price.toFixed(2) }}</div>
        </div>
      </template>
    </ProTable>
  </ElConfigProvider>
</template>
