<script setup lang="ts">
import { h, ref } from 'vue'
import { ElConfigProvider, ElOption, ElSelect, ElTag } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProTable, type ActionType, type ProColumn, type RequestFn } from '@wapri/element-pro'
import { safeString } from '@wapri/gutils'

interface Employee {
  id: number
  name: string
  intro: string
  secret: string
  age: number
  salary: number
  dept: string
  region: string[]
  hireDate: string
  activeRange: string[]
  startTime: string
  workTimeRange: string[]
  taskStatus: string
  enabled: boolean
  workMode: string
}

const actionRef = ref<ActionType>()

const source: Employee[] = [
  {
    id: 1,
    name: '林小满',
    intro: '负责查询表单与表格渲染的联动设计',
    secret: 'p@ss2026',
    age: 28,
    salary: 18600,
    dept: 'frontend',
    region: ['guangdong', 'shenzhen'],
    hireDate: '2026-03-01',
    activeRange: ['2026-03-01', '2026-08-01'],
    startTime: '2026-08-28 09:00:00',
    workTimeRange: ['2026-08-28 09:00:00', '2026-08-28 18:00:00'],
    taskStatus: 'pending',
    enabled: true,
    workMode: 'onsite',
  },
  {
    id: 2,
    name: '陈默',
    intro: '负责 valueType 注册机制与类型推导',
    secret: 'dev#321',
    age: 32,
    salary: 25400,
    dept: 'backend',
    region: ['beijing', 'chaoyang'],
    hireDate: '2026-01-15',
    activeRange: ['2026-01-15', '2026-07-15'],
    startTime: '2026-08-28 09:30:00',
    workTimeRange: ['2026-08-28 09:30:00', '2026-08-28 18:30:00'],
    taskStatus: 'processing',
    enabled: true,
    workMode: 'remote',
  },
  {
    id: 3,
    name: '苏晴',
    intro: '负责组件库文档与示例工程',
    secret: 'doc!888',
    age: 26,
    salary: 15200,
    dept: 'operation',
    region: ['guangdong', 'guangzhou'],
    hireDate: '2026-06-10',
    activeRange: ['2026-06-10', '2026-09-10'],
    startTime: '2026-08-28 10:00:00',
    workTimeRange: ['2026-08-28 10:00:00', '2026-08-28 19:00:00'],
    taskStatus: 'completed',
    enabled: false,
    workMode: 'hybrid',
  },
]

const columns: ProColumn<Employee>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    valueType: 'text',
    inputProps: { maxlength: 20, showWordLimit: true },
  },
  { title: '简介', dataIndex: 'intro', valueType: 'textarea', ellipsis: true },
  { title: '密码', dataIndex: 'secret', valueType: 'password', renderText: () => '******' },
  { title: '年龄', dataIndex: 'age', valueType: 'digit', inputNumberProps: { min: 0, max: 150, precision: 0 } },
  { title: '月薪', dataIndex: 'salary', valueType: 'money' },
  {
    title: '部门',
    dataIndex: 'dept',
    valueType: 'treeSelect',
    treeSelectProps: { filterable: true },
    valueEnum: [
      {
        text: '技术中心',
        value: 'tech',
        children: [
          { text: '前端组', value: 'frontend' },
          { text: '后端组', value: 'backend' },
        ],
      },
      { text: '市场中心', value: 'market', children: [{ text: '运营组', value: 'operation' }] },
    ],
  },
  {
    title: '常驻地区',
    dataIndex: 'region',
    valueType: 'cascader',
    cascaderProps: { filterable: true },
    valueEnum: [
      {
        text: '广东',
        value: 'guangdong',
        children: [
          { text: '深圳', value: 'shenzhen' },
          { text: '广州', value: 'guangzhou' },
        ],
      },
      {
        text: '北京',
        value: 'beijing',
        children: [{ text: '朝阳区', value: 'chaoyang' }],
      },
    ],
  },
  {
    title: '入职日期',
    dataIndex: 'hireDate',
    valueType: 'date',
    datePickerProps: { disabledDate: (date: Date) => date > new Date() },
  },
  { title: '项目周期', dataIndex: 'activeRange', valueType: 'dateRange', dateQuickSelect: { showYesterday: true } },
  {
    title: '任务状态',
    dataIndex: 'taskStatus',
    valueType: 'tag',
    valueEnum: {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
    },
  },
  {
    title: '上班时间',
    dataIndex: 'startTime',
    valueType: 'time',
    datePickerProps: { format: 'YYYY-MM-DD HH:mm', valueFormat: 'YYYY-MM-DD HH:mm', timeFormat: 'HH:mm' },
  },
  {
    title: '工作时段',
    dataIndex: 'workTimeRange',
    valueType: 'timeRange',
    fieldProps: {
      col: {
        span: 16,
      },
    },
    datePickerProps: {
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      dateFormat: 'YYYY年MM月DD日',
      timeFormat: 'HH:mm',
      rangeSeparator: '至',
    },
  },
  {
    title: '在职状态',
    dataIndex: 'enabled',
    valueType: 'switch',
    valueEnum: { true: '在职', false: '离职' },
    render: (_value, record) =>
      record.enabled ? h(ElTag, { type: 'success' }, () => '在职') : h(ElTag, { type: 'info' }, () => '离职'),
  },
  {
    title: '工作模式',
    dataIndex: 'workMode',
    valueType: 'customer',
    valueEnum: { onsite: '现场办公', remote: '远程办公', hybrid: '混合办公' },
    renderFormItem: (value, _column, setValue) =>
      h(
        ElSelect,
        {
          'modelValue': typeof value === 'string' ? value : undefined,
          'placeholder': '请选择工作模式',
          'clearable': true,
          'onUpdate:modelValue': setValue,
        },
        () => [
          h(ElOption, { label: '现场办公', value: 'onsite' }),
          h(ElOption, { label: '远程办公', value: 'remote' }),
          h(ElOption, { label: '混合办公', value: 'hybrid' }),
        ],
      ),
  },
]

const request: RequestFn<Employee, Record<string, unknown>> = async (params) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  let filtered = source
  if (typeof params.name === 'string' && params.name) {
    filtered = filtered.filter((item) => item.name.includes(safeString(params.name)))
  }
  if (typeof params.dept === 'string' && params.dept) {
    filtered = filtered.filter((item) => item.dept === params.dept)
  }
  if (typeof params.enabled === 'boolean') {
    filtered = filtered.filter((item) => item.enabled === params.enabled)
  }
  if (typeof params.taskStatus === 'string' && params.taskStatus) {
    filtered = filtered.filter((item) => item.taskStatus === params.taskStatus)
  }
  if (typeof params.workMode === 'string' && params.workMode) {
    filtered = filtered.filter((item) => item.workMode === params.workMode)
  }
  const start = (params.current - 1) * params.pageSize
  return { data: filtered.slice(start, start + params.pageSize), total: filtered.length, success: true }
}

function reload(): void {
  void actionRef.value?.reload(true)
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProTable
      ref="actionRef"
      :columns="columns"
      :request="request"
      :pagination="{ pageSize: 2, pageSizeOptions: [2, 3] }"
      header-title="valueType 全量演示"
    >
      <template #toolbar>
        <ElButton @click="reload">刷新数据</ElButton>
      </template>
    </ProTable>
  </ElConfigProvider>
</template>
