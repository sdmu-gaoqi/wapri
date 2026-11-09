<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import type { ProFormAction } from '@wapri/element-pro'
import { ProForm, ProFormList, ProFormText } from '@wapri/element-pro'

const formRef = ref<ProFormAction>()

const model = reactive<Record<string, unknown>>({
  contacts: [{ name: '张三', phone: '' }],
})

const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.error('校验未通过：空值只报对应行')
    return
  }
  ElMessage.success('校验通过')
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      ref="formRef"
      :model="model"
      label-width="80px"
    >
      <ProFormList
        name="contacts"
        label="联系人"
        :initial-value="{ name: '', phone: '' }"
        :rules="[{ type: 'array', min: 1, message: '至少保留一位联系人' }]"
      >
        <ProFormText
          name="name"
          label="姓名"
          :col-props="{ span: 12 }"
          :rules="[{ required: true, message: '请输入姓名', trigger: 'blur' }]"
        />
        <ProFormText
          name="phone"
          label="电话"
          :col-props="{ span: 12 }"
          :rules="[{ required: true, message: '请输入电话', trigger: 'blur' }]"
        />
      </ProFormList>
    </ProForm>

    <ElButton
      type="primary"
      @click="submit"
    >
      校验
    </ElButton>
  </ElConfigProvider>
</template>
