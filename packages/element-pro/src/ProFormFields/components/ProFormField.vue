<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { CSSProperties } from 'vue'
import {
  ElCascader,
  ElCol,
  ElDatePicker,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTooltip,
  ElTreeSelect,
  useFormItem,
} from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { get, set } from '@wapri/gutils'
import TagSelector from '../../TagSelector'
import { formatCellValue, getValueEnumOptions, toTreeOptions } from '../../shared/field/utils'
import type { ValueEnum } from '../../shared/field/types'
import { useConfig } from '../../ConfigProvider/context'
import { fieldEmptyText, fieldMoneyCurrency, fieldMoneyPrecision, fieldTextAreaAutosize } from '../../constant'
import { useProFormPath, useProFormReadonly } from '../../shared/form/context'
import { joinPath } from '../../shared/form/path'
import { omitUndefined } from '../../shared/form/props'
import { hasRequiredRule } from '../../shared/form/rules'
import {
  getDatePickerType,
  getDateValueFormat,
  getFieldPlaceholder,
  getFieldWidthStyle,
  isDateValueType,
  optionsToValueEnum,
} from '../utils'
import type { ProFormFieldProps, ProFormFieldValueType } from '../types'

const props = withDefaults(defineProps<ProFormFieldProps & { valueType: ProFormFieldValueType }>(), {
  readonly: false,
  // Boolean 类型的 prop 未传时 Vue 会 cast 成 false，显式 undefined 才能拿到「未设置」，
  // 否则 `disabled: false` 会短路 Element Plus 的表单级回退。
  disabled: undefined,
  emptyText: fieldEmptyText,
  options: () => [],
  colProps: () => ({}),
  fieldProps: () => ({}),
})

defineOptions({ name: 'ProFormField' })

const { prefix } = useConfig()
const { form } = useFormItem()
const pathContext = useProFormPath()
const formReadonly = useProFormReadonly()

/**
 * 字段的完整路径：`ProFormList` 行内时拼上行前缀，否则等价于自身 `name`。
 * 值读写与 `ElFormItem.prop` 共用这一份，保证校验与重置按行唯一。
 */
const resolvedName = computed(() => joinPath(pathContext?.value.prefix, props.name))

/** 交给 `ElFormItem` 的 `prop`：空路径传 `undefined`，避免注册一个 `propString` 为空的字段。 */
const propPath = computed(() => (resolvedName.value.length > 0 ? resolvedName.value : undefined))

/**
 * 只读 / 禁用按「字段显式值 > 列表级 > 表单级」继承。
 *
 * `disabled` 未显式传值时保持 `undefined` 交给控件，让 Element Plus 的 `useFormDisabled`
 * 回退到表单级 `disabled`；传 `false` 会短路这条回退链。
 */
const isReadonly = computed(
  () => props.readonly || pathContext?.value.readonly === true || formReadonly?.value === true,
)
const isDisabled = computed<boolean | undefined>(() => {
  if (props.disabled !== undefined) return props.disabled
  if (pathContext?.value.disabled !== undefined) return pathContext.value.disabled
  return undefined
})

/** `ElForm.model` 的类型是 `Record<string, any>`，这里一次性收窄，后续读写不再出现 any。 */
const model = computed<Record<string, unknown> | undefined>(() => {
  const raw: unknown = form?.model
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
})

const colSpan = computed(() => props.colProps?.span ?? 24)

const value = computed<unknown>(() => {
  const target = model.value
  if (!target || resolvedName.value.length === 0) return undefined
  return get(target, resolvedName.value) as unknown
})

const effectiveValueEnum = computed<ValueEnum | undefined>(() => optionsToValueEnum(props.options) ?? props.valueEnum)

const optionItems = computed(() => getValueEnumOptions(effectiveValueEnum.value))
const treeItems = computed(() => toTreeOptions(effectiveValueEnum.value))
/** `v-bind` 透传的 `undefined` 会绕过 props 默认值，这里再兜一层。 */
const emptyText = computed(() => {
  const configured = props.emptyText
  return configured === undefined || configured === null ? fieldEmptyText : configured
})
const readonlyText = computed(() => formatCellValue(value.value, emptyText.value, effectiveValueEnum.value))
const widthStyle = computed(() => getFieldWidthStyle(props.width))
/**
 * 必填星号：显式 `required` 或 `rules` 里声明了必填时传 `true`；
 * 否则传 `undefined`，让 `ElFormItem` 自己按 `ElForm` 的 `:rules` 推导。
 * 传 `false` 会覆盖表单级规则里的 `required`，所以这里不能用布尔兜底。
 */
const requiredOf = computed(() => (props.required === true || hasRequiredRule(props.rules) ? true : undefined))
const fieldPlaceholder = computed(() => getFieldPlaceholder(props.valueType, props.label, props.placeholder))

/**
 * 合并控件属性：组件基础属性 < width < fieldProps（fieldProps 优先级最高，与文档一致）。
 *
 * 值为 `undefined` 的键会被剔除：Vue 认为「键存在」即已赋值，会跳过控件自身的默认值，
 * 也会短路 Element Plus 的表单级回退（例如 `disabled`）。
 */
const controlPropsOf = (base: Record<string, unknown> = {}): Record<string, unknown> => {
  const fieldProps = props.fieldProps ?? {}
  const fieldStyle = fieldProps['style']
  const styleOverride: CSSProperties | undefined =
    typeof fieldStyle === 'object' && fieldStyle !== null ? (fieldStyle as CSSProperties) : undefined
  const mergedStyle = { ...widthStyle.value, ...styleOverride }
  const { style: _style, ...restFieldProps } = fieldProps
  return omitUndefined({
    ...base,
    ...(Object.keys(mergedStyle).length > 0 ? { style: mergedStyle } : {}),
    ...restFieldProps,
  })
}

const update = (next: unknown): void => {
  const target = model.value
  if (!target || resolvedName.value.length === 0) return
  set(target, resolvedName.value, next)
}

onMounted(() => {
  const target = model.value
  if (!target || resolvedName.value.length === 0 || props.initialValue === undefined) return
  if (get(target, resolvedName.value) !== undefined) return
  set(target, resolvedName.value, props.initialValue)
})

const asString = (): string => (typeof value.value === 'string' ? value.value : '')

const asNumber = (): number | undefined => (typeof value.value === 'number' ? value.value : undefined)

const asBoolean = (): boolean => value.value === true

const asKeyArray = (): Array<string | number> | undefined => {
  const current = value.value
  if (!Array.isArray(current)) return undefined
  const items = current.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
  return items.length === current.length ? items : undefined
}

const asSelectValue = (): string | number | Array<string | number> | undefined => {
  const current = value.value
  if (typeof current === 'string' || typeof current === 'number') return current
  return asKeyArray()
}

const asDateValue = (): string | string[] | undefined => {
  const current = value.value
  if (typeof current === 'string') return current
  if (!Array.isArray(current)) return undefined
  const items = current.filter((item): item is string => typeof item === 'string')
  return items.length === current.length ? items : undefined
}

const inputPropsOf = (): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    type: props.valueType === 'textarea' ? 'textarea' : props.valueType === 'password' ? 'password' : 'text',
    placeholder: fieldPlaceholder.value,
    disabled: isDisabled.value,
  }
  if (props.valueType === 'password') base['showPassword'] = true
  if (props.valueType === 'textarea') base['autosize'] = fieldTextAreaAutosize
  return controlPropsOf(base)
}

const numberPropsOf = (): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    placeholder: fieldPlaceholder.value,
    disabled: isDisabled.value,
  }
  if (props.valueType === 'money') {
    const symbol = fieldMoneyCurrency
    base['precision'] = fieldMoneyPrecision
    base['formatter'] = (display: string): string =>
      display === '' || display === undefined ? '' : `${symbol}${display}`
    base['parser'] = (raw: string): string => raw.replace(/[^\d.-]/g, '')
  }
  return controlPropsOf(base)
}

const datePropsOf = (): Record<string, unknown> => {
  const isRange = props.valueType === 'dateRange' || props.valueType === 'timeRange'
  const placeholder = fieldPlaceholder.value
  return controlPropsOf({
    type: getDatePickerType(props.valueType),
    valueFormat: getDateValueFormat(props.valueType),
    ...(isRange ? { startPlaceholder: placeholder, endPlaceholder: placeholder } : { placeholder }),
    disabled: isDisabled.value,
  })
}

const selectPropsOf = (): Record<string, unknown> => {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: isDisabled.value })
}

const treeSelectPropsOf = (): Record<string, unknown> => {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: isDisabled.value })
}

const cascaderPropsOf = (): Record<string, unknown> => {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: isDisabled.value })
}

const switchPropsOf = (): Record<string, unknown> => {
  return controlPropsOf({ disabled: isDisabled.value })
}

const tagPropsOf = (): Record<string, unknown> => {
  return controlPropsOf({})
}
</script>

<template>
  <ElCol
    v-bind="colProps"
    :span="colSpan"
  >
    <ElFormItem
      v-bind="formItemProps"
      :prop="propPath"
      :label="label"
      :rules="rules"
      :required="requiredOf"
    >
      <template
        v-if="tooltip && label"
        #label
      >
        <span :class="`${prefix}-pro-form-field__label`">
          {{ label }}
          <ElTooltip
            :content="tooltip"
            placement="top"
          >
            <ElIcon :class="`${prefix}-pro-form-field__tip`">
              <QuestionFilled />
            </ElIcon>
          </ElTooltip>
        </span>
      </template>

      <span
        v-if="isReadonly"
        :class="`${prefix}-pro-form-field__readonly`"
      >
        {{ readonlyText }}
      </span>
      <ElSelect
        v-else-if="valueType === 'select'"
        v-bind="selectPropsOf()"
        :model-value="asSelectValue()"
        @update:model-value="update"
      >
        <ElOption
          v-for="option in optionItems"
          :key="String(option.value)"
          :label="option.text"
          :value="option.value"
          :disabled="option.disabled"
        />
      </ElSelect>
      <TagSelector
        v-else-if="valueType === 'tag'"
        v-bind="tagPropsOf()"
        :model-value="asSelectValue()"
        :options="optionItems"
        @update:model-value="update"
      />
      <ElTreeSelect
        v-else-if="valueType === 'treeSelect'"
        v-bind="treeSelectPropsOf()"
        :model-value="asSelectValue()"
        :data="treeItems"
        check-strictly
        node-key="value"
        @update:model-value="update"
      />
      <ElCascader
        v-else-if="valueType === 'cascader'"
        v-bind="cascaderPropsOf()"
        :model-value="asKeyArray()"
        :options="treeItems"
        @update:model-value="update"
      />
      <ElDatePicker
        v-else-if="isDateValueType(valueType)"
        v-bind="datePropsOf()"
        :model-value="asDateValue()"
        @update:model-value="update"
      />
      <ElInputNumber
        v-else-if="valueType === 'digit' || valueType === 'money'"
        v-bind="numberPropsOf()"
        :model-value="asNumber()"
        @update:model-value="update"
      />
      <ElSwitch
        v-else-if="valueType === 'switch'"
        v-bind="switchPropsOf()"
        :model-value="asBoolean()"
        @update:model-value="update"
      />
      <ElInput
        v-else
        v-bind="inputPropsOf()"
        :model-value="asString()"
        @update:model-value="update"
      />
    </ElFormItem>
  </ElCol>
</template>
