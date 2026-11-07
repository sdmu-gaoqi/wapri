<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider, ElForm, ElRow } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProFormSelect, ProFormText } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  xs: 'xs 104px',
  sm: 'sm 216px',
  md: 'md 328px',
  lg: 'lg 440px',
  xl: 'xl 552px',
  span8: '',
  span12: '',
})
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ElForm
      :model="model"
      label-width="120px"
    >
      <ProFormText
        name="xs"
        label="width xs"
        width="xs"
      />
      <ProFormText
        name="sm"
        label="width sm"
        width="sm"
      />
      <ProFormText
        name="md"
        label="width md"
        width="md"
      />
      <ProFormText
        name="lg"
        label="width lg"
        width="lg"
      />
      <ProFormText
        name="xl"
        label="width xl"
        width="xl"
      />
      <ProFormText
        name="pixel"
        label="width 数字"
        :width="160"
      />
      <ElRow>
        <ProFormText
          name="span8"
          label="span 8"
          tooltip="按 24 栅格布局，span 8 即三分之一行宽。"
          :col-props="{ span: 8 }"
        />
        <ProFormSelect
          name="span12"
          label="span 12"
          :value-enum="{ a: '选项 A', b: '选项 B' }"
          :col-props="{ span: 12 }"
        />
        <ProFormText
          name="span24"
          label="span 24（默认）"
        />
      </ElRow>
    </ElForm>
  </ElConfigProvider>
</template>
