<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { ElButton, ElStep, ElSteps } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import { stepsFormContextKey } from './context'
import { mergeStepValues } from './utils'
import type { StepsFormStepRegistration } from './context'
import type { ProFormAction } from '../ProForm'
import type { StepsFormAction, StepsFormProps, StepsFormSubmitter } from './types'

const props = withDefaults(defineProps<StepsFormProps>(), {
  current: undefined,
  defaultCurrent: 0,
  allowStepSelect: false,
  readonly: false,
  // 未设置时保持 undefined，让步骤内的 ProForm 回退到 Element Plus 的表单级判断。
  disabled: undefined,
  stepsProps: () => ({}),
  submitter: () => ({}),
  formProps: () => ({}),
})

const emit = defineEmits<{
  'update:current': [current: number]
  'currentChange': [current: number]
}>()

defineOptions({ name: 'StepsForm' })

const { prefix } = useConfig()

type StepEntry = StepsFormStepRegistration & { order: number }

let orderSeed = 0
const steps = ref<StepEntry[]>([])
const innerCurrent = ref(props.defaultCurrent)
const pending = ref(false)

const current = computed<number>({
  get: () => props.current ?? innerCurrent.value,
  set: (value) => {
    if (value === current.value) return
    innerCurrent.value = value
    emit('update:current', value)
    emit('currentChange', value)
  },
})

const currentStep = computed(() => steps.value[current.value])

const registerStep = (step: StepsFormStepRegistration): (() => void) => {
  if (steps.value.some((item) => item.name === step.name)) {
    console.warn(`[StepsForm] 步骤 name "${step.name}" 重复，已忽略后注册的步骤。`)
    return () => {}
  }
  const entry: StepEntry = { ...step, order: orderSeed++ }
  steps.value = [...steps.value, entry].sort((left, right) => left.order - right.order)
  return () => {
    steps.value = steps.value.filter((item) => item !== entry)
  }
}

const isActive = (name: string): boolean => steps.value.findIndex((item) => item.name === name) === current.value

provide(stepsFormContextKey, {
  current: computed(() => current.value),
  readonly: computed(() => props.readonly),
  disabled: computed(() => props.disabled),
  formProps: computed(() => props.formProps),
  registerStep,
  isActive,
})

/** 步骤被动态移除后把 `current` 收回有效范围。 */
watch(
  () => steps.value.length,
  (length) => {
    if (length > 0 && current.value > length - 1) current.value = length - 1
  },
)

const submitterConfig = computed<StepsFormSubmitter | undefined>(() =>
  props.submitter === false ? undefined : props.submitter,
)

const isLast = computed(() => steps.value.length > 0 && current.value === steps.value.length - 1)
const showPrevious = computed(() => current.value > 0 && submitterConfig.value?.showPrevious !== false)
const showNext = computed(() => !isLast.value && submitterConfig.value?.showNext !== false)
const showSubmit = computed(() => isLast.value && submitterConfig.value?.showSubmit !== false)
const actionsVisible = computed(
  () => props.submitter !== false && (showPrevious.value || showNext.value || showSubmit.value),
)

const previousText = computed(() => submitterConfig.value?.previousText ?? '上一步')
const nextText = computed(() => submitterConfig.value?.nextText ?? '下一步')
const submitText = computed(() => submitterConfig.value?.submitText ?? '提交')

const validateCurrent = async (): Promise<boolean> => {
  const form = currentStep.value?.getForm()
  if (!form) return true
  return form
    .validate()
    .then(() => true)
    .catch(() => false)
}

/** 当前步骤校验 + 步骤级 `onFinish`；任一不通过都返回 false。 */
const runCurrentStep = async (): Promise<boolean> => {
  if (!(await validateCurrent())) return false
  const step = currentStep.value
  if (!step) return true
  const result = await step.runFinish()
  return result !== false
}

const getAllFieldsValue = (): Record<string, unknown> => mergeStepValues(steps.value.map((step) => step.model))

const getFormInstance = (name?: string): ProFormAction | undefined => {
  if (name === undefined) return currentStep.value?.getForm()
  return steps.value.find((step) => step.name === name)?.getForm()
}

const resetFields = (): void => {
  for (const step of steps.value) step.getForm()?.resetFields()
  current.value = 0
  pending.value = false
}

const submit = async (): Promise<boolean> => {
  if (pending.value) return false
  pending.value = true
  try {
    if (!(await runCurrentStep())) return false
    const values = getAllFieldsValue()
    const result = await props.onFinish?.(values)
    if (result === false) return false
    resetFields()
    return true
  } finally {
    pending.value = false
  }
}

const next = async (): Promise<boolean> => {
  if (pending.value) return false
  if (current.value >= steps.value.length - 1) return submit()
  pending.value = true
  try {
    if (!(await runCurrentStep())) return false
    current.value += 1
    return true
  } finally {
    pending.value = false
  }
}

const prev = (): void => {
  if (pending.value || current.value <= 0) return
  current.value -= 1
}

/** 点击步骤条切换；`allowStepSelect` 关闭时不做任何事，也不触发校验。 */
const selectStep = (index: number): void => {
  if (!props.allowStepSelect || pending.value) return
  if (index < 0 || index >= steps.value.length) return
  current.value = index
}

defineExpose<StepsFormAction>({
  get current() {
    return current.value
  },
  next,
  prev,
  submit,
  resetFields,
  getAllFieldsValue,
  getFormInstance,
})
</script>

<template>
  <div :class="`${prefix}-steps-form`">
    <div :class="`${prefix}-steps-form__steps`">
      <slot
        name="steps"
        :current="current"
        :steps="steps"
        :select="selectStep"
      >
        <ElSteps
          v-bind="stepsProps"
          :active="current"
          :class="[
            `${prefix}-steps-form__steps-inner`,
            allowStepSelect && `${prefix}-steps-form__steps-inner--selectable`,
          ]"
        >
          <ElStep
            v-for="(step, index) in steps"
            :key="step.name"
            :title="step.getTitle()"
            :description="step.getDescription()"
            :icon="step.getIcon()"
            :class="`${prefix}-steps-form__step`"
            @click="selectStep(index)"
          />
        </ElSteps>
      </slot>
    </div>

    <div :class="`${prefix}-steps-form__body`">
      <slot :current="current"></slot>
    </div>

    <div
      v-if="actionsVisible"
      :class="`${prefix}-steps-form__actions`"
    >
      <slot
        name="submitter"
        :current="current"
        :loading="pending"
        :previous="prev"
        :next="next"
        :submit="submit"
      >
        <ElButton
          v-if="showPrevious"
          :disabled="pending"
          @click="prev"
        >
          {{ previousText }}
        </ElButton>
        <ElButton
          v-if="showNext"
          type="primary"
          :loading="pending"
          @click="next"
        >
          {{ nextText }}
        </ElButton>
        <ElButton
          v-if="showSubmit"
          type="primary"
          :loading="pending"
          @click="submit"
        >
          {{ submitText }}
        </ElButton>
      </slot>
    </div>
  </div>
</template>
