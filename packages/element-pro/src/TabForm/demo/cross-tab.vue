<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormDependency, ProFormSelect, ProFormText, TabForm } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  productType: 'physical',
  weight: '',
  downloadUrl: '',
})
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <TabForm :model="model">
      <TabForm.Item
        name="basic"
        title="基础信息"
      >
        <ProFormSelect
          name="productType"
          label="商品类型"
          :value-enum="{ physical: '实物商品', virtual: '虚拟商品' }"
        />
      </TabForm.Item>
      <TabForm.Item
        name="ship"
        title="配送设置"
      >
        <ProFormDependency :names="['productType']">
          <template #default="{ productType }">
            <ProFormText
              v-if="productType === 'physical'"
              name="weight"
              label="重量"
              placeholder="实物商品需要填写重量"
            />
            <ProFormText
              v-else
              name="downloadUrl"
              label="下载地址"
              placeholder="虚拟商品填写下载地址"
            />
          </template>
        </ProFormDependency>
      </TabForm.Item>
    </TabForm>
  </ElConfigProvider>
</template>
