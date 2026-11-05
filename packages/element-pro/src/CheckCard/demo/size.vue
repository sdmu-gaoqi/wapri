<script setup lang="ts">
import { ref } from 'vue'
import { ElRadioButton, ElRadioGroup, ElSpace } from 'element-plus'
import 'element-plus/dist/index.css'
import { CheckCard, CheckCardGroup, type CheckCardSize } from '@wapri/element-pro'

const size = ref<CheckCardSize>('default')
</script>

<template>
  <ElSpace
    direction="vertical"
    alignment="start"
    :size="16"
  >
    <ElRadioGroup
      v-model="size"
      aria-label="卡片尺寸"
    >
      <ElRadioButton label="small">小号</ElRadioButton>
      <ElRadioButton label="default">默认</ElRadioButton>
      <ElRadioButton label="large">大号</ElRadioButton>
    </ElRadioGroup>
    <CheckCardGroup
      :size="size"
      aria-label="尺寸演示"
    >
      <CheckCard
        value="inherit"
        title="跟随组尺寸"
        description="高度和文字随尺寸切换。"
      />
      <CheckCard
        value="override"
        size="small"
        title="固定小号"
        description="子项可以覆盖组尺寸。"
      />
    </CheckCardGroup>
  </ElSpace>
</template>
