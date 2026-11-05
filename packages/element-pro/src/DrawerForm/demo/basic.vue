<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElFormItem, ElInput, ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { DrawerForm } from '@wapri/element-pro'

const open = ref(false)
const model = reactive({ name: '' })
const formProps = {
  labelWidth: '80px',
  rules: { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] },
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
  <DrawerForm
    v-model:open="open"
    title="新增记录"
    :model="model"
    :form-props="formProps"
    :on-finish="save"
    reset-on-close
    @finish-failed="() => ElMessage.error('保存失败，请重试')"
  >
    <ElFormItem
      label="名称"
      prop="name"
    >
      <ElInput
        v-model="model.name"
        placeholder="请输入名称"
      />
    </ElFormItem>
  </DrawerForm>
</template>
