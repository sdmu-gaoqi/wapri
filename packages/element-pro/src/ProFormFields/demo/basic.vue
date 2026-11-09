<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElConfigProvider, ElMessage, ElRow } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import type { ProFormAction } from '@wapri/element-pro'
import {
  ProForm,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
  ProFormSwitch,
  ProFormTag,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@wapri/element-pro'

const formRef = ref<ProFormAction>()

const model = reactive<Record<string, unknown>>({
  username: '',
  password: '',
  intro: '',
  age: 28,
  salary: 12800,
  status: 'open',
  tags: ['search'],
  team: 'frontend',
  area: ['zhejiang', 'hangzhou'],
  hireDate: '2024-03-01',
  period: ['2024-03-01', '2024-03-31'],
  loginAt: '2024-03-01 09:30:00',
  activeRange: ['2024-03-01 00:00:00', '2024-03-01 23:59:59'],
  enabled: true,
})

const statusEnum = {
  open: '进行中',
  closed: '已结束',
  processing: '处理中',
}

const tagEnum = {
  search: '搜索',
  export: '导出',
  notify: '通知',
}

const teamEnum = [
  {
    text: '研发',
    value: 'dev',
    children: [
      { text: '前端', value: 'frontend' },
      { text: '后端', value: 'backend' },
    ],
  },
  {
    text: '设计',
    value: 'design',
    disabled: true,
  },
]

const areaEnum = [
  {
    text: '浙江',
    value: 'zhejiang',
    children: [{ text: '杭州', value: 'hangzhou' }],
  },
  {
    text: '江苏',
    value: 'jiangsu',
    children: [{ text: '南京', value: 'nanjing' }],
  },
]

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
      label-width="120px"
    >
      <ElRow>
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :col-props="{ span: 12 }"
          :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
        />
        <ProFormText.Password
          name="password"
          label="密码"
          :col-props="{ span: 12 }"
          :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
        />
        <ProFormTextArea
          name="intro"
          label="简介"
          :col-props="{ span: 24 }"
        />
        <ProFormDigit
          name="age"
          label="年龄"
          :col-props="{ span: 12 }"
          :field-props="{ min: 0, max: 150 }"
        />
        <ProFormMoney
          name="salary"
          label="月薪"
          :col-props="{ span: 12 }"
        />
        <ProFormSelect
          name="status"
          label="状态"
          :value-enum="statusEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormTag
          name="tags"
          label="标签"
          :value-enum="tagEnum"
          :col-props="{ span: 12 }"
          :field-props="{ multiple: true }"
        />
        <ProFormTreeSelect
          name="team"
          label="团队"
          :value-enum="teamEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormCascader
          name="area"
          label="地区"
          :value-enum="areaEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormDatePicker
          name="hireDate"
          label="入职日期"
          :col-props="{ span: 12 }"
        />
        <ProFormDateRangePicker
          name="period"
          label="考核周期"
          :col-props="{ span: 12 }"
        />
        <ProFormDateTimePicker
          name="loginAt"
          label="最近登录"
          :col-props="{ span: 12 }"
        />
        <ProFormDateTimeRangePicker
          name="activeRange"
          label="活跃时段"
          :col-props="{ span: 12 }"
        />
        <ProFormSwitch
          name="enabled"
          label="启用"
          :col-props="{ span: 12 }"
        />
        <ProFormText
          name="readonlyHint"
          label="只读字段"
          readonly
          placeholder="该字段仅用于展示"
          :col-props="{ span: 12 }"
        />
      </ElRow>
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
