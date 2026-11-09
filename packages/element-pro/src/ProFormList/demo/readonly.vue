<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProForm, ProFormList, ProFormText } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  contacts: [
    { name: '张三', phone: '13800000001' },
    { name: '李四', phone: '13800000002' },
  ],
})
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      :model="model"
      readonly
      label-width="80px"
    >
      <ProFormList
        name="contacts"
        label="联系人"
      >
        <ProFormText
          name="name"
          label="姓名"
          :col-props="{ span: 12 }"
        />
        <ProFormText
          name="phone"
          label="电话"
          :col-props="{ span: 12 }"
        />
      </ProFormList>
    </ProForm>
  </ElConfigProvider>
</template>
