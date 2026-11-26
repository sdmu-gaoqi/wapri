import type { Component } from 'vue'
import WaFilterDate from './WaFilterDate.vue'
import WaFilterRange from './WaFilterRange.vue'
import WaFilterSelect from './WaFilterSelect.vue'
import WaFilterTag from './WaFilterTag.vue'
import type { FilterField, FilterFieldType } from './types'

/**
 * 字段类型 → 控件。
 * 容器里用 <component :is> 渲染，内联区和面板区共用同一套绑定，
 * 避免 4 种类型 × 2 个位置写 8 个 v-if 分支。
 */
const CONTROL_MAP: Record<FilterFieldType, Component> = {
  tag: WaFilterTag,
  range: WaFilterRange,
  date: WaFilterDate,
  select: WaFilterSelect,
}

export const getFilterControl = (field: FilterField): Component => CONTROL_MAP[field.type]
