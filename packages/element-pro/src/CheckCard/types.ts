export type CheckCardValue = string | number
export type CheckCardGroupValue = CheckCardValue | CheckCardValue[] | null
export type CheckCardSize = 'small' | 'default' | 'large'

export interface CheckCardProps {
  checked?: boolean
  defaultChecked?: boolean
  value?: CheckCardValue
  title?: string
  description?: string
  avatar?: string
  cover?: string
  disabled?: boolean
  loading?: boolean
  bordered?: boolean
  size?: CheckCardSize
}

export interface CheckCardOption extends Omit<CheckCardProps, 'checked' | 'defaultChecked'> {
  value: CheckCardValue
}

export interface CheckCardGroupProps {
  modelValue?: CheckCardGroupValue
  defaultValue?: CheckCardGroupValue
  multiple?: boolean
  disabled?: boolean
  loading?: boolean
  bordered?: boolean
  size?: CheckCardSize
  options?: Array<CheckCardValue | CheckCardOption>
}
