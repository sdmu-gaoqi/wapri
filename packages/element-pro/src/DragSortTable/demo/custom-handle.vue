<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider, ElSwitch } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { DragSortTable, type ProColumn } from '@wapri/element-pro'

interface Task {
  id: number
  order: number
  name: string
  owner: string
}

const tasks = ref<Task[]>([
  { id: 1, order: 1, name: '梳理需求清单', owner: '陈默' },
  { id: 2, order: 2, name: '产出交互稿', owner: '林岚' },
  { id: 3, order: 3, name: '接口联调', owner: '周叙' },
])

const disabled = ref(false)

const columns: ProColumn<Task>[] = [
  { title: '顺序', dataIndex: 'order', width: 88, columnProps: { align: 'center' } },
  { title: '任务', dataIndex: 'name' },
  { title: '负责人', dataIndex: 'owner' },
]

/** 自定义把手：直接把手里的序号渲染成文本，返回值是字符串时按文本展示。 */
const renderHandle = (_record: Task, index: number) => `${index + 1}`

const handleDragSortEnd = (_beforeIndex: number, _afterIndex: number, next: Task[]) => {
  next.forEach((item, index) => {
    item.order = index + 1
  })
  tasks.value = [...next]
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <p style="margin: 0 0 12px">
      禁用拖拽
      <ElSwitch v-model="disabled" />
    </p>
    <DragSortTable
      :columns="columns"
      :data-source="tasks"
      row-key="id"
      drag-sort-key="order"
      :drag-sort-handler-render="renderHandle"
      :drag-sort-disabled="disabled"
      :search="false"
      :pagination="false"
      :table-props="{ border: true }"
      header-title="任务优先级"
      :on-drag-sort-end="handleDragSortEnd"
    />
  </ElConfigProvider>
</template>
