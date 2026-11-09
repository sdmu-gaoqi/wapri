<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormSwitch,
  ProFormTag,
  ProFormText,
} from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  status: 'processing',
  period: ['2024-03-01', '2024-03-31'],
  enabled: true,
  tags: ['search', 'export'],
  empty: undefined,
})

const statusEnum = {
  open: '进行中',
  closed: '已结束',
  processing: '处理中',
}

const tagEnum = {
  search: '搜索',
  export: '导出',
  notify: '通知',
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      :model="model"
      label-width="120px"
    >
      <ProFormSelect
        name="status"
        label="枚举只读"
        readonly
        :value-enum="statusEnum"
      />
      <ProFormDateRangePicker
        name="period"
        label="区间只读"
        readonly
      />
      <ProFormSwitch
        name="enabled"
        label="布尔只读"
        readonly
      />
      <ProFormTag
        name="tags"
        label="多值只读"
        readonly
        :value-enum="tagEnum"
      />
      <ProFormText
        name="empty"
        label="空值只读"
        readonly
      />
      <ProFormText
        name="empty"
        label="空值占位可改"
        readonly
        empty-text="暂无"
      />
    </ProForm>
  </ElConfigProvider>
</template>
