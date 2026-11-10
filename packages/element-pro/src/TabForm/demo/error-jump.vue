<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormText, TabForm } from '@wapri/element-pro'
import type { TabFormAction } from '@wapri/element-pro'

const formRef = ref<TabFormAction>()
const model = reactive<Record<string, unknown>>({
  productName: '',
  price: '',
  shipNote: '',
})

async function handleFinish(): Promise<void> {
  ElMessage.success('提交成功')
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <TabForm
      ref="formRef"
      :model="model"
      :on-finish="handleFinish"
    >
      <TabForm.Item
        name="basic"
        title="基础信息"
      >
        <ProFormText
          name="productName"
          label="商品名称"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        />
      </TabForm.Item>
      <TabForm.Item
        name="price"
        title="价格库存"
      >
        <ProFormText
          name="price"
          label="销售价"
        />
      </TabForm.Item>
      <TabForm.Item
        name="ship"
        title="配送设置"
      >
        <ProFormText
          name="shipNote"
          label="配送说明"
          :rules="[{ required: true, message: '请输入配送说明' }]"
        />
      </TabForm.Item>
    </TabForm>
  </ElConfigProvider>
</template>
