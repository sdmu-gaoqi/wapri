<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { ElSkeleton, useFormItem } from 'element-plus'
import { useConfig } from '../ConfigProvider/context'
import { checkCardGroupKey } from './context'
import { isChecked } from './selection'
import type { CheckCardProps } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<CheckCardProps>(), {
  checked: undefined,
  defaultChecked: false,
  bordered: undefined,
})
const emit = defineEmits<{
  'update:checked': [checked: boolean]
  'change': [checked: boolean]
}>()
defineOptions({ name: 'CheckCard' })
const group = inject(checkCardGroupKey, undefined)
const { prefix, size: configSize } = useConfig()
const { form, formItem } = useFormItem()
const getDefaultChecked = () => props.defaultChecked
const localChecked = ref(getDefaultChecked())
const selected = computed(() =>
  group
    ? props.value !== undefined && isChecked(group.value.value, props.value)
    : (props.checked ?? localChecked.value),
)
const loading = computed(() => props.loading || group?.loading.value)
const disabled = computed(
  () =>
    props.disabled ||
    group?.disabled.value ||
    form?.disabled ||
    loading.value ||
    Boolean(group && props.value === undefined),
)
const bordered = computed(() => props.bordered ?? group?.bordered.value ?? true)
const size = computed(() => props.size ?? group?.size.value ?? configSize.value)
const base = computed(() => `${prefix.value}-check-card`)

const toggle = (event: Event) => {
  if (disabled.value) return
  const target = event.target
  if (
    target instanceof Element &&
    target !== event.currentTarget &&
    target.closest('a, button, input, select, textarea, [contenteditable="true"]')
  )
    return
  const next = !selected.value
  if (group && props.value !== undefined) group.toggle(props.value)
  else {
    if (props.checked === undefined) localChecked.value = next
    void formItem?.validate('change').catch(() => undefined)
  }
  emit('update:checked', next)
  emit('change', next)
}
</script>

<template>
  <div
    :class="[
      base,
      `${base}--${size}`,
      { [`${base}--checked`]: selected, [`${base}--disabled`]: disabled, [`${base}--borderless`]: !bordered },
    ]"
    role="checkbox"
    :aria-checked="selected"
    :aria-disabled="Boolean(disabled)"
    :aria-busy="Boolean(loading)"
    :tabindex="disabled ? -1 : 0"
    @click="toggle"
    @keydown.space.self.prevent="toggle"
    @keydown.enter.self.prevent="toggle"
  >
    <ElSkeleton
      v-if="loading"
      :rows="2"
      animated
    />
    <template v-else>
      <div
        v-if="$slots.cover || cover"
        :class="`${base}__cover`"
      >
        <slot name="cover">
          <img
            :src="cover"
            :alt="title || ''"
          />
        </slot>
      </div>
      <template v-else>
        <div
          v-if="$slots.avatar || avatar"
          :class="`${base}__avatar`"
        >
          <slot name="avatar">
            <img
              :src="avatar"
              alt=""
            />
          </slot>
        </div>
        <div :class="`${base}__content`">
          <div
            v-if="$slots.title || title || $slots.extra"
            :class="`${base}__header`"
          >
            <div :class="`${base}__title`">
              <slot name="title">{{ title }}</slot>
            </div>
            <div
              v-if="$slots.extra"
              :class="`${base}__extra`"
              @click.stop
              @keydown.stop
            >
              <slot name="extra"></slot>
            </div>
          </div>
          <div
            v-if="$slots.default || $slots.description || description"
            :class="`${base}__description`"
          >
            <slot>
              <slot name="description">{{ description }}</slot>
            </slot>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
