<script setup lang="ts">
import { h } from 'vue'
import { ElConfigProvider, ElOption, ElSelect, ElTag } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProTable, type ProColumn, type RequestFn } from '@wapri/element-pro'

type StoreStatus = 'published' | 'draft' | 'offline'

interface Store {
  id: number
  name: string
  status: StoreStatus
  region: string
  merchantCount: number
  address: string
}

const source: Store[] = [
  { id: 1, name: '示例商城 A', status: 'published', region: 'east', merchantCount: 5, address: '示例省示例市东区' },
  {
    id: 2,
    name: '示例商城 B',
    status: 'published',
    region: 'west',
    merchantCount: 0,
    address: '示例省示例市西区',
  },
  { id: 3, name: '示例商城 C', status: 'draft', region: 'east', merchantCount: 0, address: '示例省示例市东区' },
  {
    id: 4,
    name: '示例商城 D',
    status: 'offline',
    region: 'south',
    merchantCount: 2,
    address: '示例省示例市南区',
  },
]

const statusEnum = {
  published: '已发布',
  draft: '草稿',
  offline: '已下线',
}

const columns: ProColumn<Store>[] = [
  { title: '商城', dataIndex: 'name' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: statusEnum,
    render: (value) =>
      h(
        ElTag,
        { type: value === 'published' ? 'success' : value === 'offline' ? 'info' : 'warning' },
        () => statusEnum[value as StoreStatus],
      ),
  },
  {
    title: '区域（自定义）',
    dataIndex: 'region',
    valueType: 'customer',
    valueEnum: {
      east: '东区',
      west: '西区',
      south: '南区',
    },
    renderFormItem: (value, _column, setValue) =>
      h(
        ElSelect,
        {
          'modelValue': typeof value === 'string' ? value : undefined,
          'placeholder': '请选择区域',
          'clearable': true,
          'onUpdate:modelValue': setValue,
        },
        () => [
          h(ElOption, { label: '东区', value: 'east' }),
          h(ElOption, { label: '西区', value: 'west' }),
          h(ElOption, { label: '南区', value: 'south' }),
        ],
      ),
  },
  { title: '商户数', dataIndex: 'merchantCount', valueType: 'digit', hideInForm: true },
  { title: '地址', dataIndex: 'address', hideInForm: true, ellipsis: true },
]

const request: RequestFn<Store, { name?: string; status?: StoreStatus; region?: string }> = async (params) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  let filtered = source
  if (params.name) filtered = filtered.filter((item) => item.name.includes(params.name || ''))
  if (params.status) filtered = filtered.filter((item) => item.status === params.status)
  if (params.region) filtered = filtered.filter((item) => item.region === params.region)
  const start = (params.current - 1) * params.pageSize
  return { data: filtered.slice(start, start + params.pageSize), total: filtered.length, success: true }
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProTable
      :columns="columns"
      :request="request"
      :pagination="{ pageSize: 3 }"
      header-title="商城管理"
      header-subtitle="customer 类型搜索项支持业务自定义渲染"
    />
  </ElConfigProvider>
</template>
