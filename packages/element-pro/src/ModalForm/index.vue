<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import ProForm from '../ProForm/index.vue'
import type { ModalFormProps } from '../shared/overlayForm/types'
import { useOverlayForm } from '../shared/overlayForm/useOverlayForm'

const props = withDefaults(defineProps<ModalFormProps>(), {
  open: false,
  submitText: '确定',
  cancelText: '取消',
  submitter: true,
  resetOnClose: false,
  readonly: false,
})
const emit = defineEmits<{
  'update:open': [value: boolean]
  'finish': [values: Record<string, unknown>]
  'finishFailed': [error: unknown]
  'cancel': []
}>()
defineOptions({ name: 'ModalForm', inheritAttrs: false })
const { prefix } = useConfig()
const { formRef, submitting, submit, cancel, closed, resetFields, validate, clearValidate } = useOverlayForm(
  props,
  emit,
)
defineExpose({ submit, resetFields, validate, clearValidate })
</script>

<template>
  <ElDialog
    width="520px"
    v-bind="{ ...$attrs, ...modalProps }"
    :class="[`${prefix}-modal-form`, $attrs.class]"
    :title="title ?? modalProps?.title"
    :model-value="open"
    :before-close="submitting ? () => {} : modalProps?.beforeClose"
    @update:model-value="
      (value: boolean) => {
        if (!value) cancel()
      }
    "
    @closed="closed"
  >
    <template
      v-if="$slots.header"
      #header="scope"
    >
      <slot
        name="header"
        v-bind="scope"
      ></slot>
    </template>
    <ProForm
      ref="formRef"
      v-bind="formProps"
      :model="model"
      :readonly="readonly"
      :label-width="labelWidth"
      @submit.prevent="submit"
    >
      <slot
        :model="model"
        :submitting="submitting"
      ></slot>
    </ProForm>
    <template
      v-if="$slots.footer || submitter"
      #footer
    >
      <slot
        name="footer"
        :submit="submit"
        :cancel="cancel"
        :submitting="submitting"
      >
        <ElButton
          :disabled="submitting"
          @click="cancel"
        >
          {{ cancelText }}
        </ElButton>
        <ElButton
          type="primary"
          :loading="submitting"
          @click="submit"
        >
          {{ submitText }}
        </ElButton>
      </slot>
    </template>
  </ElDialog>
</template>
