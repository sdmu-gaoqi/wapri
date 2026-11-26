<script setup lang="ts">
import { computed } from 'vue'
import { toSelectionList } from './useFilterModel'
import type { FilterOption, WaFilterTagProps } from './types'

import './styles/index.css'

defineOptions({ name: 'WaFilterTag' })

const props = withDefaults(defineProps<WaFilterTagProps>(), {
  modelValue: undefined,
  inline: false,
  hideLabel: false,
  layout: 'grid',
})
const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined]
}>()

const selected = computed(() => toSelectionList(props.modelValue))

const isActive = (option: FilterOption): boolean => selected.value.includes(option.value)

const toggle = (option: FilterOption) => {
  if (option.disabled) return

  if (!props.field.multiple) {
    emit('update:modelValue', isActive(option) ? undefined : option.value)

    return
  }

  const next = isActive(option)
    ? selected.value.filter((item) => item !== option.value)
    : [...selected.value, option.value]

  // 清空时抛 undefined，父组件据此把 key 从 model 里删掉，而不是留一个空数组
  emit('update:modelValue', next.length > 0 ? next : undefined)
}
</script>

<template>
  <div
    class="wa-mobile-filter-bar__field"
    :class="{ 'wa-mobile-filter-bar__field--list': layout === 'list' }"
  >
    <div
      v-if="!inline && !hideLabel"
      class="wa-mobile-filter-bar__label"
    >
      {{ field.label }}
    </div>

    <div
      v-if="layout === 'list'"
      class="wa-mobile-filter-bar__list"
    >
      <van-cell
        v-for="option in field.options"
        :key="option.value"
        class="wa-mobile-filter-bar__list-item"
        :class="{ 'is-active': isActive(option), 'is-disabled': option.disabled }"
        :title="option.label"
        :clickable="!option.disabled"
        @click="toggle(option)"
      >
        <template #value>
          <van-icon
            v-if="isActive(option)"
            name="success"
            class="wa-mobile-filter-bar__list-check"
          />
        </template>
      </van-cell>
    </div>

    <div
      v-else
      class="wa-mobile-filter-bar__options"
      :class="{ 'wa-mobile-filter-bar__options--inline': inline }"
    >
      <button
        v-for="option in field.options"
        :key="option.value"
        type="button"
        class="wa-mobile-filter-bar__option"
        :class="{ 'is-active': isActive(option), 'is-disabled': option.disabled }"
        :disabled="option.disabled"
        @click="toggle(option)"
      >
        {{ option.label }}
      </button>
      <span
        v-if="field.options.length === 0"
        class="wa-mobile-filter-bar__placeholder"
      >
        {{ field.placeholder || '暂无可选项' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__field--list {
  padding: 0;
}

/* 内联态只占一行，横向滚动的小胶囊；换行会把筛选条撑高 */
.wa-mobile-filter-bar__options--inline {
  display: flex;
  gap: 16rpx;
  padding: 2rpx 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.wa-mobile-filter-bar__options--inline::-webkit-scrollbar {
  display: none;
}

.wa-mobile-filter-bar__options--inline .wa-mobile-filter-bar__option {
  flex: 0 0 auto;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}
</style>
