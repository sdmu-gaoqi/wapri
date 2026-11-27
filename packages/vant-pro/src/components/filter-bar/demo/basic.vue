<script setup lang="ts">
import Vant from 'vant'
import { computed, ref, getCurrentInstance } from 'vue'
import { WaFilterBar, type FilterBarModel, type FilterField } from '@wapri/vant-pro'

import 'vant/lib/index.css'

/** dumi 的每个 demo 是独立 app，Vant 的组件与样式在这里注册 */
getCurrentInstance()?.appContext.app.use(Vant)

const model = ref<FilterBarModel>({})
const lastChanged = ref('-')

const fields: FilterField[] = [
  {
    type: 'tag',
    key: 'status',
    label: '状态',
    multiple: true,
    inline: true,
    options: [
      { label: '在售', value: 'on' },
      { label: '已下架', value: 'off' },
      { label: '已售罄', value: 'sold', disabled: true },
    ],
  },
  { type: 'range', key: 'price', label: '价格', min: 0, unit: '元', precision: 2 },
  { type: 'date', key: 'createdAt', label: '创建时间', dateType: 'date' },
  {
    type: 'select',
    key: 'category',
    label: '分类',
    options: [
      { label: '水果', value: 'fruit' },
      { label: '蔬菜', value: 'vegetable' },
      { label: '肉禽', value: 'meat' },
    ],
  },
  {
    type: 'cascader',
    key: 'catalog',
    label: '平台分类',
    inline: true,
    options: [
      {
        label: '食品饮料',
        value: 'food',
        children: [
          {
            label: '休闲零食',
            value: 'snack',
            children: [
              { label: '坚果炒货', value: 'nut' },
              { label: '糕点蛋糕', value: 'cake' },
            ],
          },
          { label: '酒水冲调', value: 'drink' },
        ],
      },
      {
        label: '日用百货',
        value: 'daily',
        children: [{ label: '纸品清洁', value: 'clean' }],
      },
    ],
  },
  {
    type: 'tag',
    key: 'stock',
    label: '库存',
    inline: true,
    options: [
      { label: '缺货', value: 'empty' },
      { label: '有货', value: 'enough' },
    ],
  },
]

/** 只保留有值的字段，展示提交出去的查询条件 */
const queryText = computed(() => {
  const entries = Object.entries(model.value).filter(([, value]) => value !== undefined)

  return entries.length ? JSON.stringify(Object.fromEntries(entries)) : '（空）'
})

const onChange = (_value: FilterBarModel, key?: string) => {
  lastChanged.value = key ?? '-'
}
</script>

<template>
  <div class="filter-demo">
    <WaFilterBar
      v-model="model"
      :fields="fields"
      @change="onChange"
    >
      <template #top>
        <div class="filter-demo__search">搜索框走 top 插槽，放在触发器行上方</div>
      </template>
    </WaFilterBar>

    <div class="filter-demo__panel">
      <p>v-model（点「确定」后同步）：{{ queryText }}</p>
      <p>最近一次改动字段：{{ lastChanged }}</p>
    </div>
  </div>
</template>

<style scoped>
.filter-demo {
  display: grid;
  gap: 24rpx;
  color: #1f2937;
}

.filter-demo__panel {
  display: grid;
  gap: 8rpx;
  padding: 24rpx;
  border: 2rpx dashed #e5e7eb;
  border-radius: 16rpx;
  color: #6b7280;
  font-size: 24rpx;
}

/* 模拟业务里的搜索入口，占满 top 插槽的宽度 */
.filter-demo__search {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: #f2f3f5;
  color: #969799;
  font-size: 26rpx;
  line-height: 72rpx;
}

.filter-demo__panel p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
