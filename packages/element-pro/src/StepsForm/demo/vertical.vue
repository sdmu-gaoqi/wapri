<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormText, StepsForm } from '@wapri/element-pro'
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <StepsForm :steps-props="{ direction: 'vertical' }">
      <StepsForm.StepForm
        name="project"
        title="项目信息"
        description="填写项目名称"
      >
        <ProFormText
          name="projectName"
          label="项目名称"
          :rules="[{ required: true, message: '请输入项目名称' }]"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="owner"
        title="负责人"
        description="填写负责人"
      >
        <ProFormText
          name="ownerName"
          label="负责人"
          :rules="[{ required: true, message: '请输入负责人' }]"
        />
      </StepsForm.StepForm>
    </StepsForm>
  </ElConfigProvider>
</template>
