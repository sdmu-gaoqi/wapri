<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElBadge, ElTabPane } from 'element-plus'
import ProForm from '../../ProForm/index.vue'
import { useConfig } from '../../ConfigProvider/context'
import { omitUndefined } from '../../shared/form/props'
import { useTabFormContext } from '../context'
import type { ProFormAction } from '../../ProForm'
import type { TabFormItemProps } from '../types'

const props = withDefaults(defineProps<TabFormItemProps>(), {
  tabDisabled: false,
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能区分「未设置」，
  // 否则分段级 false 会短路容器级的 readonly / disabled。
  readonly: undefined,
  disabled: undefined,
  formProps: () => ({}),
})

defineOptions({ name: 'TabFormItem' })

const { prefix } = useConfig()
const context = useTabFormContext()
const formRef = ref<ProFormAction>()
const fallbackModel = reactive<Record<string, unknown>>({})
/** 重复 `name` 时容器拒绝注册，此时不渲染该分段，避免出现两个同名 tab。 */
const accepted = ref(true)

if (context) {
  const result = context.registerItem({
    name: props.name,
    getTitle: () => props.title,
    getTabDisabled: () => props.tabDisabled,
    getForm: () => formRef.value,
  })
  accepted.value = result.accepted
  onBeforeUnmount(result.unregister)
} else {
  console.warn('[TabForm] TabFormItem 需要放在 TabForm 内使用，当前仅渲染表单本身。')
}

/** 全部 tab 共享同一个数据对象；脱离容器时退化为本地对象，不抛错。 */
const model = computed(() => context?.model.value ?? fallbackModel)

const invalid = computed(() => context?.invalidTabs.value.includes(props.name) ?? false)

/** 表单属性：分段显式值 > 容器级 > ProForm 默认值。 */
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
    formProps: { ...context?.formProps.value, ...props.formProps },
  }),
)

defineExpose({ formRef })
</script>

<template>
  <ElTabPane
    v-if="accepted"
    :name="name"
    :disabled="tabDisabled"
    :class="`${prefix}-tab-form__pane`"
  >
    <template #label>
      <span :class="`${prefix}-tab-form__label`">
        <span>{{ title }}</span>
        <ElBadge
          v-if="invalid"
          is-dot
          type="danger"
          :class="`${prefix}-tab-form__badge`"
        />
      </span>
    </template>

    <ProForm
      ref="formRef"
      v-bind="formBindings"
      :model="model"
    >
      <slot :model="model"></slot>
    </ProForm>
  </ElTabPane>
</template>
