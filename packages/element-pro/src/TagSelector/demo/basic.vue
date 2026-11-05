<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElRadioButton, ElRadioGroup, ElTag } from 'element-plus'
import { TagSelector } from '@wapri/element-pro'
import type { TagSelectorValue } from '@wapri/element-pro'

const mode = ref<'single' | 'multiple'>('single')
const multiple = computed(() => mode.value === 'multiple')
const singleValue = ref<TagSelectorValue>()
const multipleValue = ref<TagSelectorValue[]>([])
const options = [
  { text: '待处理', value: 'pending' },
  { text: '处理中', value: 'processing' },
  { text: '已完成', value: 'completed' },
  { text: '已关闭', value: 'closed', disabled: true },
]
const value = computed<TagSelectorValue | TagSelectorValue[] | undefined>({
  get: () => (multiple.value ? multipleValue.value : singleValue.value),
  set: (nextValue) => {
    if (multiple.value) multipleValue.value = Array.isArray(nextValue) ? nextValue : []
    else singleValue.value = Array.isArray(nextValue) ? undefined : nextValue
  },
})
</script>

<template>
  <div class="tag-selector-demo">
    <ElRadioGroup
      v-model="mode"
      size="small"
    >
      <ElRadioButton value="single">单选</ElRadioButton>
      <ElRadioButton value="multiple">多选</ElRadioButton>
    </ElRadioGroup>

    <TagSelector
      v-model="value"
      :options="options"
      :multiple="multiple"
    />

    <div class="tag-selector-demo__result">
      当前值：
      <ElTag size="small">{{ Array.isArray(value) ? value.join('、') || '未选择' : value || '未选择' }}</ElTag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tag-selector-demo {
  display: grid;
  gap: 16px;

  &__result {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-regular);
    font-size: 14px;
  }
}
</style>
