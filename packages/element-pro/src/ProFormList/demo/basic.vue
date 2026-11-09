<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import type { ProFormAction } from '@wapri/element-pro'
import { ProForm, ProFormDigit, ProFormList, ProFormSelect, ProFormText } from '@wapri/element-pro'

const formRef = ref<ProFormAction>()

const model = reactive<Record<string, unknown>>({
  orderNo: 'SO-20240301',
  items: [
    { product: 'keyboard', quantity: 2, remark: '' },
    { product: 'mouse', quantity: 1, remark: '加急' },
  ],
})

const productEnum = {
  keyboard: '键盘',
  mouse: '鼠标',
  monitor: '显示器',
}

const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  ElMessage.success(`提交成功：${JSON.stringify(model.items)}`)
}

const reset = (): void => {
  formRef.value?.resetFields()
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      ref="formRef"
      :model="model"
      label-width="100px"
    >
      <ProFormText
        name="orderNo"
        label="订单号"
        readonly
      />

      <ProFormList
        name="items"
        label="明细行"
        tooltip="行内字段使用相对名，路径由容器自动拼上 items 与行下标。"
        :initial-value="{ product: 'keyboard', quantity: 1, remark: '' }"
        :rules="[{ type: 'array', min: 1, message: '至少保留一行明细' }]"
      >
        <ProFormSelect
          name="product"
          label="商品"
          :value-enum="productEnum"
          :col-props="{ span: 8 }"
        />
        <ProFormDigit
          name="quantity"
          label="数量"
          :col-props="{ span: 8 }"
          :field-props="{ min: 1 }"
        />
        <ProFormText
          name="remark"
          label="备注"
          :col-props="{ span: 8 }"
        />
      </ProFormList>
    </ProForm>

    <ElButton
      type="primary"
      @click="submit"
    >
      提交
    </ElButton>
    <ElButton @click="reset">重置</ElButton>
  </ElConfigProvider>
</template>
