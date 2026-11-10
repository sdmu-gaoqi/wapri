<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormDigit, ProFormSelect, ProFormText, TabForm } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  productName: '',
  productType: 'physical',
  price: undefined,
  stock: undefined,
  shipNote: '',
})

const result = ref('')

async function handleFinish(values: Record<string, unknown>): Promise<void> {
  result.value = JSON.stringify(values, null, 2)
  ElMessage.success('提交成功')
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <TabForm
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
        <ProFormSelect
          name="productType"
          label="商品类型"
          :value-enum="{ physical: '实物商品', virtual: '虚拟商品' }"
        />
      </TabForm.Item>
      <TabForm.Item
        name="price"
        title="价格库存"
      >
        <ProFormDigit
          name="price"
          label="销售价"
          :rules="[{ required: true, message: '请输入销售价' }]"
        />
        <ProFormDigit
          name="stock"
          label="商品库存"
        />
      </TabForm.Item>
      <TabForm.Item
        name="ship"
        title="配送设置"
      >
        <ProFormText
          name="shipNote"
          label="配送说明"
        />
      </TabForm.Item>
    </TabForm>
    <pre v-if="result">{{ result }}</pre>
  </ElConfigProvider>
</template>
