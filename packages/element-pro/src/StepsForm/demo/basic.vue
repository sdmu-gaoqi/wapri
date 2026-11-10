<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormSelect, ProFormText, ProFormTextArea, StepsForm } from '@wapri/element-pro'

const result = ref('')

async function handleFinish(values: Record<string, unknown>): Promise<void> {
  result.value = JSON.stringify(values, null, 2)
  ElMessage.success('提交成功')
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <StepsForm :on-finish="handleFinish">
      <StepsForm.StepForm
        name="project"
        title="项目信息"
      >
        <ProFormText
          name="projectName"
          label="项目名称"
          :rules="[{ required: true, message: '请输入项目名称' }]"
        />
        <ProFormSelect
          name="priority"
          label="优先级"
          :value-enum="{ high: '高', normal: '中', low: '低' }"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="owner"
        title="负责人"
      >
        <ProFormText
          name="ownerName"
          label="负责人"
          :rules="[{ required: true, message: '请输入负责人' }]"
        />
        <ProFormText
          name="phone"
          label="联系电话"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="note"
        title="备注"
      >
        <ProFormTextArea
          name="remark"
          label="备注"
        />
      </StepsForm.StepForm>
    </StepsForm>
    <pre v-if="result">{{ result }}</pre>
  </ElConfigProvider>
</template>
