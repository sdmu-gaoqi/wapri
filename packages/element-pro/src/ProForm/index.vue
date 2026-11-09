<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { ElForm } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import { proFormDisabledKey, proFormReadonlyKey } from '../shared/form/context'
import { omitUndefined } from '../shared/form/props'
import type { ProFormAction, ProFormProps } from './types'

const props = withDefaults(defineProps<ProFormProps>(), {
  readonly: false,
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能拿到「未设置」，
  // 否则 `disabled: false` 会短路 Element Plus 的表单级回退。
  disabled: undefined,
  formProps: () => ({}),
})

const emit = defineEmits<{
  validate: [prop: string, isValid: boolean, message: string]
}>()

defineOptions({ name: 'ProForm' })

const { prefix } = useConfig()
const formRef = ref<FormInstance>()

/** 表单级只读：字段组件未显式传 `readonly` 时继承。 */
provide(
  proFormReadonlyKey,
  computed(() => props.readonly),
)

/** 表单级禁用：列表容器用它决定是否展示增删改操作。 */
provide(
  proFormDisabledKey,
  computed(() => props.disabled),
)

/**
 * 表单属性：`formProps` 打底，显式 props 覆盖。
 *
 * 值为 `undefined` 的键会被剔除，否则 `v-bind` 展开后 Vue 认为该 prop 已赋值，
 * 会跳过 `ElForm` 自身的默认值。
 */
const formPropsOf = computed<Record<string, unknown>>(() =>
  omitUndefined({
    ...props.formProps,
    labelWidth: props.labelWidth,
    labelPosition: props.labelPosition,
    labelSuffix: props.labelSuffix,
    inline: props.inline,
    disabled: props.disabled,
    size: props.size,
    showMessage: props.showMessage,
    hideRequiredAsterisk: props.hideRequiredAsterisk,
    requireAsteriskPosition: props.requireAsteriskPosition,
    scrollToError: props.scrollToError,
  }),
)

defineExpose<ProFormAction>({
  validate: (...args) => formRef.value?.validate(...args) as ReturnType<FormInstance['validate']>,
  validateField: (...args) => formRef.value?.validateField(...args) as ReturnType<FormInstance['validateField']>,
  resetFields: (...args) => formRef.value?.resetFields(...args),
  clearValidate: (...args) => formRef.value?.clearValidate(...args),
  scrollToField: (...args) => formRef.value?.scrollToField(...args),
  get formRef() {
    return formRef.value
  },
})
</script>

<template>
  <ElForm
    ref="formRef"
    v-bind="formPropsOf"
    :class="[`${prefix}-pro-form`, $attrs.class]"
    :model="model"
    :rules="rules"
    @validate="(prop: string, isValid: boolean, message: string) => emit('validate', prop, isValid, message)"
  >
    <slot
      :model="model"
      :readonly="readonly"
      :disabled="disabled"
    ></slot>
  </ElForm>
</template>
