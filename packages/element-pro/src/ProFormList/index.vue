<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElCol, ElFormItem, ElIcon, ElRow, ElTooltip, useFormItem } from 'element-plus'
import { Bottom, CopyDocument, Delete, Plus, QuestionFilled, Top } from '@element-plus/icons-vue'
import { cloneDeep, get, set, uuid } from '@wapri/gutils'
import { useConfig } from '../ConfigProvider/context'
import { fieldEmptyText } from '../constant'
import { useProFormDisabled, useProFormPath } from '../shared/form/context'
import { joinPath, normalizePath } from '../shared/form/path'
import { hasRequiredRule } from '../shared/form/rules'
import type { ProFormListAction, ProFormListProps } from './types'
import ProFormListItem from './components/ProFormListItem.vue'

const props = withDefaults(defineProps<ProFormListProps>(), {
  readonly: false,
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能拿到「未设置」，
  // 否则 `disabled: false` 会短路表单级回退。
  disabled: undefined,
  emptyText: '暂无数据',
  addText: '新增',
  copyable: true,
  movable: true,
  removable: true,
  formItemProps: () => ({}),
})

const emit = defineEmits<{
  change: [value: unknown[]]
}>()

defineOptions({ name: 'ProFormList' })

const { prefix } = useConfig()
const { form } = useFormItem()
const pathContext = useProFormPath()
const formDisabled = useProFormDisabled()

/** 行 id 只用于 `:key`，不写进 `model`，避免污染提交数据。 */
const rowIds = ref<string[]>([])

const listPath = computed(() => normalizePath(props.name))

const model = computed<Record<string, unknown> | undefined>(() => {
  const raw: unknown = form?.model
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
})

const rows = computed<unknown[]>(() => {
  const target = model.value
  if (!target) return []
  const current = get(target, listPath.value) as unknown
  return Array.isArray(current) ? current : []
})

const requiredOf = computed(() => (props.required === true || hasRequiredRule(props.rules) ? true : undefined))
const emptyTextOf = computed(() => (props.emptyText === false ? '' : (props.emptyText ?? fieldEmptyText)))
const showEmpty = computed(() => props.emptyText !== false && rows.value.length === 0)
const canAdd = computed(() => props.max === undefined || rows.value.length < props.max)
const canRemove = computed(() => props.min === undefined || rows.value.length > props.min)

/**
 * 禁用按「列表显式值 > 表单级」继承。
 *
 * 未显式传值时保持 `undefined`，让行内字段的控件回退到表单级 `disabled`。
 */
const isDisabled = computed<boolean | undefined>(() => {
  if (props.disabled !== undefined) return props.disabled
  return formDisabled?.value
})
const actionsVisible = computed(() => !props.readonly && isDisabled.value !== true)

/** 行前缀：`ProFormList` 嵌套时由外层上下文继续拼接。 */
const rowPrefixOf = (index: number): string[] => joinPath(pathContext?.value.prefix, props.name).concat(String(index))

const writeRows = (next: unknown[]): void => {
  const target = model.value
  if (!target) return
  set(target, listPath.value, next)
  emit('change', next)
}

const syncRowIds = (length: number): void => {
  const current = rowIds.value
  if (current.length === length) return
  if (current.length > length) {
    rowIds.value = current.slice(0, length)
    return
  }
  rowIds.value = [...current, ...Array.from({ length: length - current.length }, () => uuid())]
}

watch(
  () => rows.value.length,
  (length) => syncRowIds(length),
  { immediate: true },
)

const add = (): void => {
  if (!canAdd.value) return
  writeRows([...rows.value, cloneDeep(props.initialValue ?? {})])
}

const remove = (index: number): void => {
  if (!canRemove.value) return
  writeRows(rows.value.filter((_, current) => current !== index))
}

const copy = (index: number): void => {
  if (!canAdd.value) return
  const next = [...rows.value]
  next.splice(index + 1, 0, cloneDeep(rows.value[index]))
  writeRows(next)
}

const moveUp = (index: number): void => {
  if (index <= 0) return
  const next = [...rows.value]
  const [item] = next.splice(index, 1)
  next.splice(index - 1, 0, item)
  writeRows(next)
}

const moveDown = (index: number): void => {
  if (index >= rows.value.length - 1) return
  const next = [...rows.value]
  const [item] = next.splice(index, 1)
  next.splice(index + 1, 0, item)
  writeRows(next)
}

defineExpose<ProFormListAction>({
  add,
  remove,
  copy,
  moveUp,
  moveDown,
  length: () => rows.value.length,
})
</script>

<template>
  <ElCol :span="24">
    <ElFormItem
      v-bind="formItemProps"
      :prop="listPath"
      :label="label"
      :rules="rules"
      :required="requiredOf"
    >
      <template
        v-if="tooltip && label"
        #label
      >
        <span :class="`${prefix}-pro-form-list__label`">
          {{ label }}
          <ElTooltip
            :content="tooltip"
            placement="top"
          >
            <ElIcon :class="`${prefix}-pro-form-list__tip`">
              <QuestionFilled />
            </ElIcon>
          </ElTooltip>
        </span>
      </template>

      <div :class="`${prefix}-pro-form-list`">
        <ProFormListItem
          v-for="(row, index) in rows"
          :key="rowIds[index] ?? index"
          :prefix="rowPrefixOf(index)"
          :readonly="readonly"
          :disabled="disabled"
        >
          <div :class="`${prefix}-pro-form-list__row`">
            <ElRow :class="`${prefix}-pro-form-list__content`">
              <slot
                :row="row"
                :index="index"
              ></slot>
            </ElRow>
            <div
              v-if="actionsVisible"
              :class="`${prefix}-pro-form-list__actions`"
            >
              <ElTooltip
                v-if="copyable"
                content="复制"
                placement="top"
              >
                <ElButton
                  text
                  :disabled="!canAdd"
                  @click="copy(index)"
                >
                  <ElIcon><CopyDocument /></ElIcon>
                </ElButton>
              </ElTooltip>
              <ElTooltip
                v-if="movable"
                content="上移"
                placement="top"
              >
                <ElButton
                  text
                  :disabled="index === 0"
                  @click="moveUp(index)"
                >
                  <ElIcon><Top /></ElIcon>
                </ElButton>
              </ElTooltip>
              <ElTooltip
                v-if="movable"
                content="下移"
                placement="top"
              >
                <ElButton
                  text
                  :disabled="index === rows.length - 1"
                  @click="moveDown(index)"
                >
                  <ElIcon><Bottom /></ElIcon>
                </ElButton>
              </ElTooltip>
              <ElTooltip
                v-if="removable"
                content="删除"
                placement="top"
              >
                <ElButton
                  text
                  type="danger"
                  :disabled="!canRemove"
                  @click="remove(index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </ElTooltip>
            </div>
          </div>
        </ProFormListItem>

        <div
          v-if="showEmpty"
          :class="`${prefix}-pro-form-list__empty`"
        >
          {{ emptyTextOf }}
        </div>

        <ElButton
          v-if="actionsVisible"
          :class="`${prefix}-pro-form-list__add`"
          :disabled="!canAdd"
          @click="add"
        >
          <ElIcon><Plus /></ElIcon>
          <span>{{ addText }}</span>
        </ElButton>
      </div>
    </ElFormItem>
  </ElCol>
</template>
