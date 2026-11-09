<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import type { ProFormAction } from '@wapri/element-pro'
import { ProForm, ProFormDigit, ProFormSelect, ProFormText } from '@wapri/element-pro'

const formRef = ref<ProFormAction>()

const model = reactive<Record<string, unknown>>({
  username: '',
  age: 28,
  status: 'open',
})

const statusEnum = {
  open: '进行中',
  closed: '已结束',
}

const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  ElMessage.success(`提交成功：${JSON.stringify(model)}`)
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
      :rules="{ username: [{ required: true, message: '请输入用户名', trigger: 'blur' }] }"
    >
      <ProFormText
        name="username"
        label="用户名"
        placeholder="请输入用户名"
      />
      <ProFormDigit
        name="age"
        label="年龄"
        :field-props="{ min: 0, max: 150 }"
      />
      <ProFormSelect
        name="status"
        label="状态"
        :value-enum="statusEnum"
      />
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
