<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProForm, ProFormSelect, ProFormSwitch, ProFormText } from '@wapri/element-pro'

const readonlyModel = reactive<Record<string, unknown>>({
  username: 'zhangsan',
  status: 'open',
  enabled: true,
})

const disabledModel = reactive<Record<string, unknown>>({
  username: 'zhangsan',
  status: 'open',
  enabled: true,
})

const statusEnum = {
  open: '进行中',
  closed: '已结束',
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      :model="readonlyModel"
      readonly
      label-width="100px"
    >
      <ProFormText
        name="username"
        label="用户名（只读）"
      />
      <ProFormSelect
        name="status"
        label="状态（只读）"
        :value-enum="statusEnum"
      />
      <ProFormSwitch
        name="enabled"
        label="启用（只读）"
      />
    </ProForm>

    <ProForm
      :model="disabledModel"
      disabled
      label-width="100px"
    >
      <ProFormText
        name="username"
        label="用户名（禁用）"
      />
      <ProFormSelect
        name="status"
        label="状态（禁用）"
        :value-enum="statusEnum"
      />
    </ProForm>
  </ElConfigProvider>
</template>
