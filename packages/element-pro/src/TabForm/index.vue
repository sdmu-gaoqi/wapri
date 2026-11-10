<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { ElButton, ElTabs } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import { tabFormNavWidth } from '../constant'
import { tabFormContextKey } from './context'
import { collectInvalidTabs, snapshotModel, toCssSize } from './utils'
import type { TabFormItemRegistration, TabFormRegisterResult } from './context'
import type { ProFormAction } from '../ProForm'
import type { TabFormAction, TabFormProps, TabFormSubmitter, TabFormTabPosition } from './types'

const props = withDefaults(defineProps<TabFormProps>(), {
  active: undefined,
  defaultActive: undefined,
  tabPosition: undefined,
  navWidth: tabFormNavWidth,
  readonly: false,
  // 未设置时保持 undefined，让分段内的 ProForm 回退到 Element Plus 的表单级判断。
  disabled: undefined,
  tabsProps: () => ({}),
  submitter: () => ({}),
  formProps: () => ({}),
})

const emit = defineEmits<{
  'update:active': [active: string | number]
  'activeChange': [active: string | number]
}>()

defineOptions({ name: 'TabForm' })

const { prefix } = useConfig()

type ItemEntry = TabFormItemRegistration & { order: number }

let orderSeed = 0
const items = ref<ItemEntry[]>([])
const innerActive = ref<string | number | undefined>(props.defaultActive)
const invalidTabs = ref<string[]>([])
const pending = ref(false)

/** 导航位置：显式 prop > `tabsProps.tabPosition` > `top`。 */
const tabPosition = computed<TabFormTabPosition>(() => props.tabPosition ?? props.tabsProps?.tabPosition ?? 'top')

/** 垂直导航：导航列在左侧或右侧，内容列与底部按钮让位给导航列。 */
const isVertical = computed(() => tabPosition.value === 'left' || tabPosition.value === 'right')

const rootStyle = computed<Record<string, string> | undefined>(() =>
  isVertical.value ? { '--wa-ui-tab-form-nav-width': toCssSize(props.navWidth) } : undefined,
)

/**
 * 激活项：受控值 > 内部值 > 第一个分段的 name。
 *
 * 末尾兜底不能省：`ElTabs` 的 `currentName` 由 `modelValue` 驱动，
 * 传 `undefined` 时所有 `ElTabPane` 的 `active` 都是 false，内容区会被 `v-show` 全部隐藏。
 */
const active = computed<string | number | undefined>({
  get: () => props.active ?? innerActive.value ?? items.value[0]?.name,
  set: (value) => {
    if (value === undefined || value === active.value) return
    innerActive.value = value
    emit('update:active', value)
    emit('activeChange', value)
  },
})

const registerItem = (item: TabFormItemRegistration): TabFormRegisterResult => {
  if (items.value.some((entry) => entry.name === item.name)) {
    console.warn(`[TabForm] 分段 name "${item.name}" 重复，已忽略后注册的分段。`)
    return { accepted: false, unregister: () => {} }
  }
  const entry: ItemEntry = { ...item, order: orderSeed++ }
  items.value = [...items.value, entry].sort((left, right) => left.order - right.order)
  return {
    accepted: true,
    unregister: () => {
      items.value = items.value.filter((current) => current !== entry)
    },
  }
}

provide(tabFormContextKey, {
  model: computed(() => props.model),
  active: computed(() => active.value),
  readonly: computed(() => props.readonly),
  disabled: computed(() => props.disabled),
  formProps: computed(() => props.formProps),
  invalidTabs: computed(() => invalidTabs.value),
  registerItem,
})

const submitterConfig = computed<TabFormSubmitter | undefined>(() =>
  props.submitter === false ? undefined : props.submitter,
)

const showSubmit = computed(() => props.submitter !== false && submitterConfig.value?.showSubmit !== false)
const showReset = computed(() => props.submitter !== false && submitterConfig.value?.showReset !== false)
const actionsVisible = computed(() => showSubmit.value || showReset.value)
const submitText = computed(() => submitterConfig.value?.submitText ?? '提交')
const resetText = computed(() => submitterConfig.value?.resetText ?? '重置')

const getFormInstance = (name?: string): ProFormAction | undefined => {
  if (name === undefined) return items.value.find((item) => item.name === active.value)?.getForm()
  return items.value.find((item) => item.name === name)?.getForm()
}

const getInvalidTabs = (): string[] => [...invalidTabs.value]

const resetFields = (): void => {
  for (const item of items.value) item.getForm()?.resetFields()
  invalidTabs.value = []
  pending.value = false
}

const submit = async (): Promise<boolean> => {
  if (pending.value) return false
  pending.value = true
  try {
    const invalid = await collectInvalidTabs(items.value)
    invalidTabs.value = invalid
    if (invalid.length > 0) {
      // 跳到声明顺序里第一个出错的分段，用户只需要知道「先去哪一页改」。
      active.value = invalid[0]
      return false
    }
    const result = await props.onFinish?.(snapshotModel(props.model))
    if (result === false) return false
    resetFields()
    return true
  } finally {
    pending.value = false
  }
}

defineExpose<TabFormAction>({
  get active() {
    return active.value
  },
  submit,
  resetFields,
  getFormInstance,
  getInvalidTabs,
})
</script>

<template>
  <div
    :class="[
      `${prefix}-tab-form`,
      isVertical && `${prefix}-tab-form--vertical`,
      isVertical && `${prefix}-tab-form--vertical-${tabPosition}`,
    ]"
    :style="rootStyle"
  >
    <ElTabs
      v-bind="tabsProps"
      :tab-position="tabPosition"
      :model-value="active"
      :class="`${prefix}-tab-form__tabs`"
      @update:model-value="(value: string | number) => (active = value)"
    >
      <slot :active="active"></slot>
    </ElTabs>

    <div
      v-if="actionsVisible"
      :class="`${prefix}-tab-form__actions`"
    >
      <slot
        name="submitter"
        :loading="pending"
        :submit="submit"
        :reset="resetFields"
      >
        <ElButton
          v-if="showReset"
          :disabled="pending"
          @click="resetFields"
        >
          {{ resetText }}
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
