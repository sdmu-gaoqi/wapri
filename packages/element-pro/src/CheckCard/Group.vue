<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useFormItem } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import CheckCard from './index.vue'
import { checkCardGroupKey } from './context'
import { toggleValue } from './selection'
import type { CheckCardGroupProps, CheckCardGroupValue, CheckCardValue } from './types'

const props = withDefaults(defineProps<CheckCardGroupProps>(), {
  defaultValue: null,
  multiple: false,
  disabled: false,
  loading: false,
  bordered: true,
})
const emit = defineEmits<{
  'update:modelValue': [value: CheckCardGroupValue]
  'change': [value: CheckCardGroupValue]
}>()
defineOptions({ name: 'CheckCardGroup' })
const { form, formItem } = useFormItem()
const { prefix, size } = useConfig()
const getDefaultValue = () => (Array.isArray(props.defaultValue) ? [...props.defaultValue] : props.defaultValue)
const localValue = ref<CheckCardGroupValue>(getDefaultValue())
const value = computed(() => (props.modelValue === undefined ? localValue.value : props.modelValue))
const disabled = computed(() => props.disabled || Boolean(form?.disabled))
const options = computed(() =>
  props.options?.map((option) => (typeof option === 'object' ? option : { value: option, title: String(option) })),
)
const toggle = (next: CheckCardValue) => {
  if (disabled.value || props.loading) return
  const result = toggleValue(value.value, next, props.multiple)
  if (props.modelValue === undefined) localValue.value = result
  emit('update:modelValue', result)
  emit('change', result)
  void formItem?.validate('change').catch(() => undefined)
}
provide(checkCardGroupKey, {
  value,
  disabled,
  toggle,
  loading: computed(() => props.loading),
  bordered: computed(() => props.bordered),
  size: computed(() => props.size ?? size.value),
})
</script>

<template>
  <div
    :class="`${prefix}-check-card-group`"
    role="group"
    :aria-disabled="disabled"
    :aria-busy="loading"
  >
    <slot>
      <CheckCard
        v-for="option in options"
        :key="option.value"
        v-bind="option"
      />
    </slot>
  </div>
</template>
