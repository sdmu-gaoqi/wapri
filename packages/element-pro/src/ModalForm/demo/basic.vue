<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { ModalForm, ProFormDigit, ProFormList, ProFormSelect, ProFormText } from '@wapri/element-pro'

const open = ref(false)
const model = reactive<Record<string, unknown>>({
  name: '',
  status: 'open',
  items: [{ product: 'keyboard', quantity: 1 }],
})

const formProps = {
  rules: { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] },
}

const statusEnum = {
  open: '进行中',
  closed: '已结束',
}

const productEnum = {
  keyboard: '键盘',
  mouse: '鼠标',
}

const save = async (values: Record<string, unknown>) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 800))
  ElMessage.success(`已保存：${values.name}`)
  return true
}
</script>

<template>
  <ElButton
    type="primary"
    @click="open = true"
  >
    新增
  </ElButton>
  <ModalForm
    v-model:open="open"
    title="新增记录"
    :model="model"
    label-width="80px"
    :form-props="formProps"
    :on-finish="save"
    reset-on-close
    @finish-failed="() => ElMessage.error('保存失败，请重试')"
  >
    <ProFormText
      name="name"
      label="名称"
      placeholder="请输入名称"
    />
    <ProFormSelect
      name="status"
      label="状态"
      :value-enum="statusEnum"
    />
    <ProFormList
      name="items"
      label="明细"
      :initial-value="{ product: 'keyboard', quantity: 1 }"
    >
      <ProFormSelect
        name="product"
        placeholder="商品"
        :value-enum="productEnum"
        :col-props="{ span: 14 }"
      />
      <ProFormDigit
        name="quantity"
        placeholder="数量"
        :col-props="{ span: 10 }"
        :field-props="{ min: 1 }"
      />
    </ProFormList>
  </ModalForm>
</template>
