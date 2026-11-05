import type { ComputedRef, InjectionKey } from 'vue'
import type { CheckCardGroupValue, CheckCardSize, CheckCardValue } from './types'

export interface CheckCardGroupContext {
  value: ComputedRef<CheckCardGroupValue>
  disabled: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  bordered: ComputedRef<boolean>
  size: ComputedRef<CheckCardSize>
  toggle: (value: CheckCardValue) => void
}

export const checkCardGroupKey: InjectionKey<CheckCardGroupContext> = Symbol('CheckCardGroup')
