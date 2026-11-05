<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import type { TagSelectorOption, TagSelectorValue } from './types'
import { useConfig } from '../ConfigProvider/context'

const props = withDefaults(
  defineProps<{
    modelValue?: TagSelectorValue | TagSelectorValue[]
    options: TagSelectorOption[]
    multiple?: boolean
    showAll?: boolean
    allText?: string
  }>(),
  {
    multiple: false,
    showAll: true,
    allText: '全部',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: TagSelectorValue | TagSelectorValue[] | undefined]
}>()

defineOptions({ name: 'TagSelector' })
const { prefix } = useConfig()

const selectedValues = computed<TagSelectorValue[]>(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const allSelected = computed(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.length === 0
    : props.modelValue === undefined || props.modelValue === null || props.modelValue === '',
)

function isSelected(value: TagSelectorValue): boolean {
  return props.multiple ? selectedValues.value.includes(value) : props.modelValue === value
}

function select(value: TagSelectorValue): void {
  if (!props.multiple) {
    // 单选模式下再次点击已选中项视为取消选择，回落到「全部」
    emit('update:modelValue', props.modelValue === value ? undefined : value)
    return
  }

  emit(
    'update:modelValue',
    selectedValues.value.includes(value)
      ? selectedValues.value.filter((item) => item !== value)
      : [...selectedValues.value, value],
  )
}

function clear(): void {
  emit('update:modelValue', props.multiple ? [] : undefined)
}
</script>

<template>
  <div :class="`${prefix}-tag-selector`">
    <ElButton
      v-if="showAll"
      type="info"
      :class="[`${prefix}-tag-selector-item`, allSelected && 'is-selected']"
      :aria-pressed="allSelected"
      round
      @click="clear"
    >
      {{ allText }}
    </ElButton>
    <ElButton
      v-for="option in options"
      :key="String(option.value)"
      type="info"
      :class="[`${prefix}-tag-selector-item`, isSelected(option.value) && 'is-selected']"
      :aria-pressed="isSelected(option.value)"
      :disabled="option.disabled"
      round
      @click="select(option.value)"
    >
      {{ option.text }}
    </ElButton>
  </div>
</template>

<style lang="scss">
.wa-ui-tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .el-button {
    margin-left: 0;
  }
}

.wa-ui-tag-selector-item {
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled),
  &.is-selected {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}
</style>
