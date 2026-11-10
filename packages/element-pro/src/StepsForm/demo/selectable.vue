<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormText, StepsForm } from '@wapri/element-pro'

const current = ref(0)
const values = ref<Record<string, unknown>>({})

function handleFinish(next: Record<string, unknown>): void {
  values.value = next
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <p>当前步骤：{{ current + 1 }}</p>
    <StepsForm
      v-model:current="current"
      allow-step-select
      :on-finish="handleFinish"
    >
      <StepsForm.StepForm
        name="project"
        title="项目信息"
      >
        <ProFormText
          name="projectName"
          label="项目名称"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="owner"
        title="负责人"
      >
        <ProFormText
          name="ownerName"
          label="负责人"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="note"
        title="备注"
      >
        <ProFormText
          name="remark"
          label="备注"
        />
      </StepsForm.StepForm>
    </StepsForm>
    <pre v-if="Object.keys(values).length">{{ JSON.stringify(values, null, 2) }}</pre>
  </ElConfigProvider>
</template>
