<script setup lang="ts">
import { onBeforeUnmount, reactive } from 'vue'
import { ElButton, ElCheckbox, ElRadio, ElRadioGroup, ElSpace } from 'element-plus'
import { NProgress } from '@wapri/element-pro'

const form = reactive({
  showSpinner: true,
  trickle: true,
  color: 'default',
})

const colors = [
  { label: '主题色', value: 'default' },
  { label: '成功色', value: 'var(--el-color-success)' },
  { label: '警告色', value: 'var(--el-color-warning)' },
]

const handlePreview = (): void => {
  NProgress.configure({
    showSpinner: form.showSpinner,
    trickle: form.trickle,
    color: form.color === 'default' ? '' : form.color,
  })
  NProgress.start()
  setTimeout(() => NProgress.done(), 1500)
}

onBeforeUnmount(() => {
  NProgress.remove()
})
</script>

<template>
  <div class="nprogress-config-demo">
    <ElSpace
      direction="vertical"
      :size="12"
    >
      <ElCheckbox v-model="form.showSpinner">显示右上角转圈</ElCheckbox>
      <ElCheckbox v-model="form.trickle">自动递增（trickle）</ElCheckbox>
      <ElRadioGroup v-model="form.color">
        <ElRadio
          v-for="item in colors"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </ElRadio>
      </ElRadioGroup>
      <ElButton
        type="primary"
        @click="handlePreview"
      >
        应用配置并预览
      </ElButton>
    </ElSpace>
  </div>
</template>
