<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import type { FormItemRule } from 'element-plus'
import ProForm from '../../ProForm/index.vue'
import { ProFormCascader, ProFormText } from '../../ProFormFields'
import { useConfig } from '../../ConfigProvider/context'
import {
  fileModalGroupNameLabel,
  fileModalGroupNameMaxLength,
  fileModalGroupNamePlaceholder,
  fileModalGroupParentLabel,
  fileModalGroupParentPlaceholder,
} from '../../constant'
import type { ProFormAction } from '../../ProForm/types'
import type { ProFormFieldOption } from '../../ProFormFields/types'
import type { Key } from '../../shared/field/types'
import type { FileModalGroupFormValue } from '../types'

const props = defineProps<{
  open: boolean
  /** 弹窗标题，新建与编辑复用同一个弹窗 */
  title: string
  /** 「上级分类」的可选树，编辑时已排除自身与子孙 */
  parentOptions: ProFormFieldOption[]
  /** 编辑时预填的名称，新建时为空 */
  name?: string
  /** 编辑时预填的上级分类路径（一级 → 直接上级），新建时为空 */
  parentPath?: Key[]
  /** 提交回调，返回 true 关闭弹窗，返回 false 保持打开 */
  onSubmit: (value: FileModalGroupFormValue) => Promise<boolean>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalGroupDialog' })

const base = computed(() => `${prefix.value}-file-modal`)

const formRef = ref<ProFormAction>()
const submitting = ref(false)

const model = reactive<{ parentPath: Key[]; name: string }>({ parentPath: [], name: '' })

/** 每次打开都按传入值回填，关闭期间不保留上一次的输入 */
watch(
  () => props.open,
  (open) => {
    if (!open) return
    model.name = props.name ?? ''
    model.parentPath = [...(props.parentPath ?? [])]
  },
  { immediate: true },
)

/** 名称必填 + 长度上限；空白字符不算有效名称，先 trim 再判空 */
const nameRules: FormItemRule[] = [
  { required: true, message: fileModalGroupNamePlaceholder, trigger: 'blur' },
  {
    trigger: 'blur',
    validator: (_rule, value, callback) => {
      const text = typeof value === 'string' ? value.trim() : ''
      if (text.length > fileModalGroupNameMaxLength) {
        callback(new Error(`分类名称最多 ${fileModalGroupNameMaxLength} 个字`))
        return
      }
      callback()
    },
  },
]

const cascaderFieldProps = {
  placeholder: fileModalGroupParentPlaceholder,
  clearable: true,
  // 允许选中任意层级：新建的分类既可以挂在某个分类下，也可以继续往下加
  props: { checkStrictly: true, emitPath: true },
}

const nameFieldProps = {
  placeholder: fileModalGroupNamePlaceholder,
  maxlength: fileModalGroupNameMaxLength,
  showWordLimit: true,
}

const close = (): void => {
  if (submitting.value) return
  emit('update:open', false)
}

const handleVisibleChange = (value: boolean): void => {
  if (value) {
    emit('update:open', true)
    return
  }
  close()
}

/** 级联值是从一级到直接上级的路径，末位才是要提交的 parentId */
const handleSubmit = async (): Promise<void> => {
  if (submitting.value) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const path = Array.isArray(model.parentPath) ? model.parentPath : []
  const last = path[path.length - 1]
  submitting.value = true
  try {
    const done = await props.onSubmit({
      name: model.name.trim(),
      parentId: last === undefined ? undefined : String(last),
    })
    if (done) emit('update:open', false)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ElDialog
    :class="`${base}__group-dialog`"
    :model-value="open"
    :title="title"
    width="480px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="!submitting"
    :close-on-press-escape="!submitting"
    @update:model-value="handleVisibleChange"
  >
    <ProForm
      ref="formRef"
      :class="`${base}__group-form`"
      :model="model"
      label-width="88px"
      @submit.prevent="handleSubmit"
    >
      <ProFormCascader
        name="parentPath"
        :label="fileModalGroupParentLabel"
        :options="parentOptions"
        :field-props="cascaderFieldProps"
      />
      <ProFormText
        name="name"
        :label="fileModalGroupNameLabel"
        :rules="nameRules"
        :field-props="nameFieldProps"
      />
    </ProForm>

    <template #footer>
      <ElButton
        :disabled="submitting"
        @click="close"
      >
        取消
      </ElButton>
      <ElButton
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>
