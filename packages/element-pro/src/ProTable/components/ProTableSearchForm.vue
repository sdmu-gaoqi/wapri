<script setup lang="ts" generic="T extends object">
import { computed, h, isVNode, reactive, ref, useSlots, watch, type VNode } from 'vue'
import {
  ElButton,
  ElCascader,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRow,
  ElSelect,
  ElSwitch,
  ElTreeSelect,
} from 'element-plus'
import type { CascaderOption, TreeData } from 'element-plus'
import { isEmpty } from '@wapri/gutils'
import { getDataIndexKey, getValueEnumOptions, toTreeOptions } from '../utils'
import type {
  DateQuickSelectConfig,
  ProColumn,
  ProTableDateQuickSelection,
  ProTableDateValueType,
  ProTableFormConfig,
  ProTableRequestContext,
  SearchConfig,
  ValueType,
} from '../types'
import DateQuickSelect from '../../DateQuickSelect'
import { getDateQuickSelections, isSameDateQuickValue } from '../../DateQuickSelect/utils'
import TagSelector from '../../TagSelector'
import { useConfig } from '../../ConfigProvider/context'
import { ArrowDown, ArrowUp, Search, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps<{
  columns: ProColumn<T>[]
  modelValue: Record<string, unknown>
  search?: false | SearchConfig
  form?: ProTableFormConfig
  loading?: boolean
  collapsed?: boolean
  collapseActionInModeBar?: boolean
}>()

const emit = defineEmits<{
  'submit': [values: Record<string, unknown>, context: ProTableRequestContext]
  'reset': []
  'fieldChange': [fieldKey: string, value: unknown, context: ProTableRequestContext]
  'update:collapsed': [value: boolean]
}>()

defineOptions({ name: 'ProTableSearchForm' })
const { prefix } = useConfig()

const slots = useSlots()
const values = reactive<Record<string, unknown>>({})
const quickDateSelections = reactive<Record<string, ProTableDateQuickSelection>>({})
let shouldInitializeQuickDateSelections = true
const innerCollapsed = ref(false)
const collapsed = computed({
  get: () => props.collapsed ?? innerCollapsed.value,
  set: (value: boolean) => {
    innerCollapsed.value = value
    emit('update:collapsed', value)
  },
})

// 外部 modelValue 变化（已选条件条单项清除 / 提交回填）时同步到内部 values
watch(
  () => props.modelValue,
  (next) => {
    if (!next) return
    Object.keys(values).forEach((k) => delete (values as Record<string, unknown>)[k])
    Object.entries(next).forEach(([k, v]) => {
      ;(values as Record<string, unknown>)[k] = v
    })
  },
  { deep: true },
)

const searchableColumns = computed(() =>
  props.columns.filter((column) => !column.hideInForm && column.search !== false),
)

const searchConfig = computed(() => ({
  searchText: props.search !== false ? (props.search?.searchText ?? props.form?.searchText ?? '查询') : '查询',
  resetText: props.search !== false ? (props.search?.resetText ?? props.form?.resetText ?? '重置') : '重置',
  labelWidth: props.search !== false ? (props.search?.labelWidth ?? props.form?.labelWidth ?? undefined) : undefined,
}))

const showSearchActions = computed(
  () =>
    searchableColumns.value.length > 0 &&
    (searchConfig.value.searchText !== '' ||
      searchConfig.value.resetText !== '' ||
      Boolean(slots.searchActionLeft || slots.searchActionRight) ||
      searchableColumns.value.length > 3),
)

function hasFilterValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false
  return !Array.isArray(value) || value.length > 0
}

function keyOf(column: ProColumn<T>): string {
  return getDataIndexKey(column.dataIndex)
}

const hasSelectedFilters = computed(() =>
  searchableColumns.value.some((column) => hasFilterValue(values[keyOf(column)])),
)

const showBuiltInSearchActions = computed(() => !collapsed.value || hasSelectedFilters.value)

function toggleCollapsed(): void {
  collapsed.value = !collapsed.value
}

function componentPropsOf(column: ProColumn<T>, props?: Record<string, unknown>): Record<string, unknown> {
  const { col: _col, labelWidth: _labelWidth, requestNow: _requestNow, ...fieldProps } = column.fieldProps ?? {}
  return { ...fieldProps, ...props }
}

function colPropsOf(column: ProColumn<T>): Record<string, unknown> {
  return { ...column.fieldProps?.col, ...column.colProps }
}

function placeholderOf(column: ProColumn<T>): string {
  const raw =
    column.inputProps?.placeholder ??
    column.inputNumberProps?.placeholder ??
    column.selectProps?.placeholder ??
    column.treeSelectProps?.placeholder ??
    column.cascaderProps?.placeholder ??
    column.datePickerProps?.placeholder ??
    column.fieldProps?.placeholder
  if (typeof raw === 'string') return raw
  const type = column.valueType ?? 'text'
  if (type === 'select' || type === 'treeSelect' || type === 'cascader') return '全部'
  if (type === 'date' || type === 'dateRange') return '请选择日期'
  if (type === 'time') return '请选择日期时间'
  return `请输入${column.title}`
}

function clearableOf(column: ProColumn<T>): boolean {
  const raw =
    column.inputProps?.clearable ??
    column.selectProps?.clearable ??
    column.treeSelectProps?.clearable ??
    column.cascaderProps?.clearable ??
    column.datePickerProps?.clearable ??
    column.fieldProps?.clearable
  return typeof raw === 'boolean' ? raw : true
}

/** 类型安全的表单值读写，避免 v-model 直接绑定 unknown。 */
function asString(column: ProColumn<T>): string {
  const value = values[keyOf(column)]
  return typeof value === 'string' ? value : ''
}

function asNumber(column: ProColumn<T>): number | undefined {
  const value = values[keyOf(column)]
  return typeof value === 'number' ? value : undefined
}

function asBoolean(column: ProColumn<T>): boolean {
  const value = values[keyOf(column)]
  return value === true
}

function treeDataOf(column: ProColumn<T>) {
  return toTreeOptions(column.valueEnum)
}

function treeSelectDataOf(column: ProColumn<T>): TreeData {
  const data = column.treeSelectProps?.data
  return Array.isArray(data) ? (data as TreeData) : treeDataOf(column)
}

function cascaderOptionsOf(column: ProColumn<T>): CascaderOption[] {
  const options = column.cascaderProps?.options
  return Array.isArray(options) ? (options as CascaderOption[]) : treeDataOf(column)
}

function getFieldsValue(): Record<string, unknown> {
  return { ...values }
}

function resetFields(names?: string[]): void {
  const fields = isEmpty(names) ? Object.keys(values) : names!
  fields.forEach((key) => delete values[key])
  Object.keys(quickDateSelections).forEach((key) => delete quickDateSelections[key])
}

function reset(): void {
  shouldInitializeQuickDateSelections = true
  resetFields()
  emit('reset')
}

function valueTypeOf(column: ProColumn<T>): ValueType {
  return column.valueType ?? 'text'
}

function asSelectValue(column: ProColumn<T>): string | number | undefined {
  const value = values[keyOf(column)]
  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

/** 模板内避免 TS 断言（`as` 里的 `|` 会被 vue-eslint-parser 当作过滤器），统一在 script 中收窄类型。 */
function asKeyArray(column: ProColumn<T>): Array<string | number> | undefined {
  const value = values[keyOf(column)]
  return Array.isArray(value)
    ? value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
    : undefined
}

function dateValueOf(column: ProColumn<T>): string | [string, string] | undefined {
  const value = values[keyOf(column)]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'string') {
    return [value[0], value[1]]
  }
  return undefined
}

function isDateValueType(column: ProColumn<T>): boolean {
  const type = valueTypeOf(column)
  return type === 'date' || type === 'dateRange' || type === 'time' || type === 'timeRange'
}

function dateValueTypeOf(column: ProColumn<T>): ProTableDateValueType | undefined {
  const type = valueTypeOf(column)
  if (type === 'date' || type === 'dateRange' || type === 'time' || type === 'timeRange') return type
  return undefined
}

function requiredDateValueTypeOf(column: ProColumn<T>): ProTableDateValueType {
  return dateValueTypeOf(column) ?? 'date'
}

function dateQuickSelectConfigOf(column: ProColumn<T>): DateQuickSelectConfig | false {
  if (!isDateValueType(column) || !column.dateQuickSelect) return false
  return typeof column.dateQuickSelect === 'object' ? column.dateQuickSelect : {}
}

function dateQuickValueFormatOf(column: ProColumn<T>): string {
  const configured = column.datePickerProps?.valueFormat
  if (typeof configured === 'string') return configured
  return valueTypeOf(column) === 'time' || valueTypeOf(column) === 'timeRange' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
}

function dateQuickOptionsOf(column: ProColumn<T>): ProTableDateQuickSelection[] {
  const config = dateQuickSelectConfigOf(column)
  const valueType = dateValueTypeOf(column)
  if (!valueType) return []
  return getDateQuickSelections({ valueType, config, valueFormat: dateQuickValueFormatOf(column) })
}

function getRequestContext(): ProTableRequestContext {
  return { quickDateSelections: { ...quickDateSelections } }
}

function submit(): void {
  emit('submit', { ...values }, getRequestContext())
}

function setValue(column: ProColumn<T>, value: unknown): void {
  const fieldKey = keyOf(column)
  values[fieldKey] = value
  emit('fieldChange', fieldKey, value, getRequestContext())
  if (column.fieldProps?.requestNow === true) submit()
}

function renderFormItemOf(column: ProColumn<T>): VNode {
  const content =
    column.renderFormItem?.(values[keyOf(column)], column, (value: unknown) => setValue(column, value)) ?? null
  return isVNode(content) ? content : h('span', null, String(content ?? ''))
}

function quickDateSelectionOf(column: ProColumn<T>, value: unknown): ProTableDateQuickSelection | undefined {
  return dateQuickOptionsOf(column).find((option) => isSameDateQuickValue(value, option.value))
}

function setFieldsValue(nextValues: Record<string, unknown>): void {
  Object.entries(nextValues).forEach(([key, value]) => {
    values[key] = value
    const column = searchableColumns.value.find((item) => keyOf(item) === key)
    const quickSelection = column ? quickDateSelectionOf(column, value) : undefined
    if (quickSelection !== undefined) quickDateSelections[key] = quickSelection
    else delete quickDateSelections[key]
  })
}

function selectQuickDate(column: ProColumn<T>, selection: ProTableDateQuickSelection): void {
  quickDateSelections[keyOf(column)] = selection
  setValue(column, selection.value)
}

function updateDateValue(column: ProColumn<T>, value: unknown): void {
  delete quickDateSelections[keyOf(column)]
  setValue(column, value)
}

function searchColumnSpanOf(column: ProColumn<T>): number {
  const span = column.colProps?.span ?? column.fieldProps?.col?.span
  if (typeof span === 'number') return span
  return valueTypeOf(column) === 'tag' || dateQuickSelectConfigOf(column) !== false ? 24 : 8
}

const visibleSearchColumns = computed(() => (collapsed.value ? [] : searchableColumns.value))

watch(
  () => props.modelValue,
  (nextValues) => {
    Object.keys(values).forEach((key) => delete values[key])
    Object.assign(values, nextValues)
    if (shouldInitializeQuickDateSelections) {
      searchableColumns.value.forEach((column) => {
        const key = keyOf(column)
        const quickSelection = quickDateSelectionOf(column, nextValues[key])
        if (quickSelection !== undefined) quickDateSelections[key] = quickSelection
        else delete quickDateSelections[key]
      })
      shouldInitializeQuickDateSelections = false
    } else {
      Object.entries(quickDateSelections).forEach(([key, selection]) => {
        if (!isSameDateQuickValue(nextValues[key], selection.value)) delete quickDateSelections[key]
      })
    }
  },
  { deep: true, immediate: true },
)

defineExpose({
  getFieldsValue,
  getRequestContext,
  setFieldsValue,
  resetFields,
})
</script>

<template>
  <ElForm
    v-if="search !== false"
    :class="[`${prefix}-pro-table__search`, collapsed && `${prefix}-pro-table__search--collapsed`]"
    :label-width="searchConfig.labelWidth"
    @submit.prevent="submit"
  >
    <ElRow
      :gutter="0"
      :class="[
        collapsed && `${prefix}-pro-table__search-row--collapsed`,
        collapsed && !hasSelectedFilters && `${prefix}-pro-table__search-row--collapsed-empty`,
      ]"
    >
      <ElCol
        v-for="column in visibleSearchColumns"
        :key="keyOf(column)"
        v-bind="colPropsOf(column)"
        :span="searchColumnSpanOf(column)"
        :class="`${prefix}-pro-table__search-col`"
      >
        <ElFormItem
          v-bind="column.formItemProps"
          :label="column.title"
          :label-width="column.formItemProps?.labelWidth ?? column?.fieldProps?.labelWidth ?? '72px'"
        >
          <ElTreeSelect
            v-if="valueTypeOf(column) === 'treeSelect'"
            v-bind="componentPropsOf(column, column.treeSelectProps)"
            :model-value="asString(column) || undefined"
            :data="treeSelectDataOf(column)"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            check-strictly
            node-key="value"
            @update:model-value="(value: string | number | undefined) => setValue(column, value)"
          />
          <ElCascader
            v-else-if="valueTypeOf(column) === 'cascader'"
            v-bind="componentPropsOf(column, column.cascaderProps)"
            :model-value="asKeyArray(column)"
            :options="cascaderOptionsOf(column)"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            @update:model-value="(value: unknown) => setValue(column, value)"
          />
          <ElSelect
            v-else-if="valueTypeOf(column) === 'select'"
            v-bind="componentPropsOf(column, column.selectProps)"
            :model-value="asString(column) === '' ? undefined : asSelectValue(column)"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            @update:model-value="(value: string | number | undefined) => setValue(column, value)"
          >
            <ElOption
              v-for="option in getValueEnumOptions(column.valueEnum)"
              :key="String(option.value)"
              :label="option.text"
              :value="option.value"
              :disabled="option.disabled"
            />
          </ElSelect>
          <TagSelector
            v-else-if="valueTypeOf(column) === 'tag'"
            :model-value="asKeyArray(column) ?? asSelectValue(column)"
            :options="getValueEnumOptions(column.valueEnum)"
            :multiple="column.tagProps?.multiple"
            :show-all="column.tagProps?.showAll"
            :all-text="column.tagProps?.allText"
            @update:model-value="(value) => setValue(column, value)"
          />
          <DateQuickSelect
            v-else-if="isDateValueType(column)"
            :model-value="dateValueOf(column)"
            :value-type="requiredDateValueTypeOf(column)"
            :quick-select="dateQuickSelectConfigOf(column)"
            :quick-selection="quickDateSelections[keyOf(column)]"
            :date-picker-props="componentPropsOf(column, column.datePickerProps)"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            @update:model-value="(value) => updateDateValue(column, value)"
            @quick-select="(selection) => selectQuickDate(column, selection)"
          />
          <ElInputNumber
            v-else-if="valueTypeOf(column) === 'digit'"
            v-bind="componentPropsOf(column, column.inputNumberProps)"
            :model-value="asNumber(column)"
            :placeholder="placeholderOf(column)"
            :controls="false"
            @update:model-value="(value: number | undefined) => setValue(column, value)"
          />
          <ElSwitch
            v-else-if="valueTypeOf(column) === 'switch'"
            v-bind="componentPropsOf(column, column.switchProps)"
            :model-value="asBoolean(column)"
            @update:model-value="(value: string | number | boolean) => setValue(column, value)"
          />
          <component
            :is="renderFormItemOf(column)"
            v-else-if="valueTypeOf(column) === 'customer'"
          />
          <ElInput
            v-else-if="valueTypeOf(column) === 'textarea'"
            v-bind="componentPropsOf(column, column.inputProps)"
            :model-value="asString(column)"
            type="textarea"
            :rows="1"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            autosize
            @update:model-value="(value: string) => setValue(column, value)"
          />
          <ElInput
            v-else
            v-bind="componentPropsOf(column, column.inputProps)"
            :model-value="asString(column)"
            :type="valueTypeOf(column) === 'password' ? 'password' : 'text'"
            :placeholder="placeholderOf(column)"
            :clearable="clearableOf(column)"
            :show-password="valueTypeOf(column) === 'password'"
            @update:model-value="(value: string) => setValue(column, value)"
          />
        </ElFormItem>
      </ElCol>
      <div
        v-if="collapsed && slots.selectedFilters"
        :class="`${prefix}-pro-table__search-selected-filters`"
      >
        <slot name="selectedFilters"></slot>
      </div>
      <ElFormItem
        v-if="showSearchActions"
        :class="`${prefix}-pro-table__search-actions`"
      >
        <slot
          v-if="slots.searchActionLeft"
          name="searchActionLeft"
        ></slot>
        <ElButton
          v-if="showBuiltInSearchActions && searchConfig.searchText !== ''"
          type="primary"
          :icon="Search"
          :loading="loading"
          @click="submit"
        >
          {{ searchConfig.searchText }}
        </ElButton>
        <ElButton
          v-if="showBuiltInSearchActions && searchConfig.resetText !== ''"
          :icon="RefreshLeft"
          :loading="loading"
          @click="reset"
        >
          {{ searchConfig.resetText }}
        </ElButton>
        <slot
          v-if="slots.searchActionRight"
          name="searchActionRight"
        ></slot>
        <ElButton
          v-if="searchableColumns.length > 3 && !(collapseActionInModeBar && collapsed && !hasSelectedFilters)"
          type="primary"
          :icon="collapsed ? ArrowDown : ArrowUp"
          plain
          circle
          :aria-label="collapsed ? '展开' : '收起'"
          :title="collapsed ? '展开' : '收起'"
          @click="toggleCollapsed"
        />
      </ElFormItem>
    </ElRow>
  </ElForm>
</template>
