import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { OverlayFormProps } from './types'

export function useOverlayForm(
  props: OverlayFormProps,
  emit: {
    (event: 'update:open', value: boolean): void
    (event: 'finish', values: Record<string, unknown>): void
    (event: 'finishFailed', error: unknown): void
    (event: 'cancel'): void
  },
) {
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  // Ignore completion from a form session that the parent has already closed.
  let session = 0
  watch(
    () => props.open,
    () => {
      session += 1
    },
    { flush: 'sync' },
  )

  const submit = async (): Promise<boolean> => {
    if (submitting.value || !props.open || !formRef.value) return false
    submitting.value = true
    const currentSession = session
    try {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid || currentSession !== session) return false
      const result = await props.onFinish?.(props.model)
      if (currentSession !== session || result === false) return false
      emit('finish', props.model)
      emit('update:open', false)
      return true
    } catch (error: unknown) {
      emit('finishFailed', error)
      return false
    } finally {
      submitting.value = false
    }
  }

  const cancel = () => {
    if (submitting.value) return
    emit('cancel')
    emit('update:open', false)
  }
  const resetFields = () => formRef.value?.resetFields()
  const closed = () => {
    if (props.resetOnClose && !props.open) resetFields()
  }
  const validate = () => formRef.value?.validate()
  const clearValidate: FormInstance['clearValidate'] = (fields) => formRef.value?.clearValidate(fields)

  return { formRef, submitting, submit, cancel, closed, resetFields, validate, clearValidate }
}
