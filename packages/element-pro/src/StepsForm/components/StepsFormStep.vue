<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import ProForm from '../../ProForm/index.vue'
import { useConfig } from '../../ConfigProvider/context'
import { omitUndefined } from '../../shared/form/props'
import { useStepsFormContext } from '../context'
import { applyInitialValues } from '../utils'
import type { ProFormAction } from '../../ProForm'
import type { StepsFormStepProps } from '../types'

const props = withDefaults(defineProps<StepsFormStepProps>(), {
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能区分「未设置」，
  // 否则步骤级 false 会短路容器级的 readonly / disabled。
  readonly: undefined,
  disabled: undefined,
  formProps: () => ({}),
})

defineOptions({ name: 'StepsFormStep' })

const { prefix } = useConfig()
const context = useStepsFormContext()
const formRef = ref<ProFormAction>()
const model = reactive<Record<string, unknown>>({})

applyInitialValues(model, props.initialValues)

if (context) {
  const unregister = context.registerStep({
    name: props.name,
    getTitle: () => props.title,
    getDescription: () => props.description,
    getIcon: () => props.icon,
    model,
    getForm: () => formRef.value,
    runFinish: () => props.onFinish?.(model),
  })
  onBeforeUnmount(unregister)
} else {
  console.warn('[StepsForm] StepsFormStep 需要放在 StepsForm 内使用，当前仅渲染表单本身。')
}

/** 是否处于当前步骤；非当前步骤用 `v-show` 隐藏，保住已填数据与校验状态。 */
const isActive = computed(() => context?.isActive(props.name) ?? true)

/** 表单属性：步骤显式值 > 容器级 > ProForm 默认值。 */
const formBindings = computed(() =>
  omitUndefined({
    rules: props.rules,
    labelWidth: props.labelWidth,
    labelPosition: props.labelPosition,
    labelSuffix: props.labelSuffix,
    inline: props.inline,
    disabled: props.disabled ?? context?.disabled.value,
    readonly: props.readonly ?? context?.readonly.value,
    size: props.size,
    showMessage: props.showMessage,
    hideRequiredAsterisk: props.hideRequiredAsterisk,
    requireAsteriskPosition: props.requireAsteriskPosition,
    scrollToError: props.scrollToError,
    formProps: props.formProps,
  }),
)

defineExpose({ formRef })
</script>

<template>
  <div
    v-show="isActive"
    :class="`${prefix}-steps-form__panel`"
  >
    <ProForm
      ref="formRef"
      v-bind="formBindings"
      :model="model"
    >
      <slot :model="model"></slot>
    </ProForm>
  </div>
</template>
