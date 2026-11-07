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
import {
  getDatePickerType,
  getDateValueFormat,
  getFieldPlaceholder,
  getFieldWidthStyle,
  hasRequiredRule,
  isDateValueType,
  optionsToValueEnum,
} from '../utils'
import type { ProFormFieldProps, ProFormFieldValueType } from '../types'

const props = withDefaults(defineProps<ProFormFieldProps & { valueType: ProFormFieldValueType }>(), {
  readonly: false,
  disabled: false,
  emptyText: fieldEmptyText,
  options: () => [],
  colProps: () => ({}),
  fieldProps: () => ({}),
})

defineOptions({ name: 'ProFormField' })

const { prefix } = useConfig()
const { form } = useFormItem()

/** `ElForm.model` 的类型是 `Record<string, any>`，这里一次性收窄，后续读写不再出现 any。 */
const model = computed<Record<string, unknown> | undefined>(() => {
  const raw: unknown = form?.model
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
})

const colSpan = computed(() => props.colProps?.span ?? 24)

const value = computed<unknown>(() => {
  const target = model.value
  if (!target || props.name === undefined) return undefined
  return get(target, props.name) as unknown
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

/** 合并控件属性：组件基础属性 < width < fieldProps（fieldProps 优先级最高，与文档一致）。 */
function controlPropsOf(base: Record<string, unknown> = {}): Record<string, unknown> {
  const fieldProps = props.fieldProps ?? {}
  const fieldStyle = fieldProps['style']
  const styleOverride: CSSProperties | undefined =
    typeof fieldStyle === 'object' && fieldStyle !== null ? (fieldStyle as CSSProperties) : undefined
  const mergedStyle = { ...widthStyle.value, ...styleOverride }
  const { style: _style, ...restFieldProps } = fieldProps
  return {
    ...base,
    ...(Object.keys(mergedStyle).length > 0 ? { style: mergedStyle } : {}),
    ...restFieldProps,
  }
}

function update(next: unknown): void {
  const target = model.value
  if (!target || props.name === undefined) return
  set(target, props.name, next)
}

onMounted(() => {
  const target = model.value
  if (!target || props.name === undefined || props.initialValue === undefined) return
  if (get(target, props.name) !== undefined) return
  set(target, props.name, props.initialValue)
})

function asString(): string {
  return typeof value.value === 'string' ? value.value : ''
}

function asNumber(): number | undefined {
  return typeof value.value === 'number' ? value.value : undefined
}

function asBoolean(): boolean {
  return value.value === true
}

function asKeyArray(): Array<string | number> | undefined {
  const current = value.value
  if (!Array.isArray(current)) return undefined
  const items = current.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
  return items.length === current.length ? items : undefined
}

function asSelectValue(): string | number | Array<string | number> | undefined {
  const current = value.value
  if (typeof current === 'string' || typeof current === 'number') return current
  return asKeyArray()
}

function asDateValue(): string | string[] | undefined {
  const current = value.value
  if (typeof current === 'string') return current
  if (!Array.isArray(current)) return undefined
  const items = current.filter((item): item is string => typeof item === 'string')
  return items.length === current.length ? items : undefined
}

function inputPropsOf(): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: props.valueType === 'textarea' ? 'textarea' : props.valueType === 'password' ? 'password' : 'text',
    placeholder: fieldPlaceholder.value,
    disabled: props.disabled,
  }
  if (props.valueType === 'password') base['showPassword'] = true
  if (props.valueType === 'textarea') base['autosize'] = fieldTextAreaAutosize
  return controlPropsOf(base)
}

function numberPropsOf(): Record<string, unknown> {
  const base: Record<string, unknown> = {
    placeholder: fieldPlaceholder.value,
    disabled: props.disabled,
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

function datePropsOf(): Record<string, unknown> {
  const isRange = props.valueType === 'dateRange' || props.valueType === 'timeRange'
  const placeholder = fieldPlaceholder.value
  return controlPropsOf({
    type: getDatePickerType(props.valueType),
    valueFormat: getDateValueFormat(props.valueType),
    ...(isRange ? { startPlaceholder: placeholder, endPlaceholder: placeholder } : { placeholder }),
    disabled: props.disabled,
  })
}

function selectPropsOf(): Record<string, unknown> {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: props.disabled })
}

function treeSelectPropsOf(): Record<string, unknown> {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: props.disabled })
}

function cascaderPropsOf(): Record<string, unknown> {
  return controlPropsOf({ placeholder: fieldPlaceholder.value, disabled: props.disabled })
}

function switchPropsOf(): Record<string, unknown> {
  return controlPropsOf({ disabled: props.disabled })
}

function tagPropsOf(): Record<string, unknown> {
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
      :prop="name"
      :label="label"
      :rules="rules"
      :required="requiredOf"
    >
      <template
        v-if="tooltip && label"
        #label
      >
        <span>{{ label }}</span>
        <ElTooltip
          :content="tooltip"
          placement="top"
        >
          <ElIcon :class="`${prefix}-pro-form-field__tip`">
            <QuestionFilled />
          </ElIcon>
        </ElTooltip>
      </template>

      <span
        v-if="readonly"
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
