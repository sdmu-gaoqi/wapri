import type { TabsProps } from 'element-plus'
import type { ProFormAction, ProFormProps } from '../ProForm'

/** tab 导航位置；`left` / `right` 为垂直导航。 */
export type TabFormTabPosition = 'top' | 'right' | 'bottom' | 'left'

/** 底部按钮配置。 */
export interface TabFormSubmitter {
  /** 提交按钮文案，默认「提交」。 */
  submitText?: string
  /** 重置按钮文案，默认「重置」。 */
  resetText?: string
  /** 是否展示提交按钮，默认 `true`。 */
  showSubmit?: boolean
  /** 是否展示重置按钮，默认 `true`。 */
  showReset?: boolean
}

/** 多 tab 表单容器。 */
export interface TabFormProps {
  /** 全部 tab 共享的数据对象，字段组件通过 `name` 读写它。 */
  model: Record<string, unknown>
  /** 当前激活的 tab，传入时受控，配合同名事件更新。 */
  active?: string | number
  /** 非受控模式下的初始激活 tab，默认第一个分段。 */
  defaultActive?: string | number
  /**
   * tab 导航位置，默认 `top`；`left` / `right` 即垂直导航。
   * 优先级高于 `tabsProps.tabPosition`。
   */
  tabPosition?: TabFormTabPosition
  /** 垂直导航的导航列宽度，数字按 `px` 处理，默认 `160`。 */
  navWidth?: string | number
  /** 透传给 `ElTabs` 的属性，如 `type: 'border-card'`。 */
  tabsProps?: Partial<TabsProps>
  /** 底部按钮配置；传 `false` 不渲染内置按钮。 */
  submitter?: false | TabFormSubmitter
  /** 全部 tab 只读；分段显式传值时以分段为准。 */
  readonly?: boolean
  /** 全部 tab 禁用；分段显式传值时以分段为准。 */
  disabled?: boolean
  /** 每个分段的表单公共配置，可被 `TabFormItem` 上的同名属性覆盖。 */
  formProps?: Partial<Omit<ProFormProps, 'model'>>
  /**
   * 全部 tab 校验通过后触发，参数是 `model` 的浅拷贝。
   * 返回 `false` 时不重置表单。
   */
  onFinish?: (values: Record<string, unknown>) => boolean | void | Promise<boolean | void>
}

/** 单个分段，除 `model` 外的表单配置与 `ProForm` 一致。 */
export interface TabFormItemProps {
  /** 分段标识，同一 `TabForm` 内唯一，同时作为 `ElTabPane` 的 `name`。 */
  name: string
  /** tab 标题。 */
  title?: string
  /** 该 tab 是否禁止切换过去。 */
  tabDisabled?: boolean
  /** 分段级校验规则。 */
  rules?: ProFormProps['rules']
  /** 标签宽度。 */
  labelWidth?: ProFormProps['labelWidth']
  /** 标签位置。 */
  labelPosition?: ProFormProps['labelPosition']
  /** 标签后缀。 */
  labelSuffix?: ProFormProps['labelSuffix']
  /** 是否行内表单。 */
  inline?: ProFormProps['inline']
  /** 分段级只读；未设置时继承容器。 */
  readonly?: boolean | undefined
  /** 分段级禁用；未设置时继承容器。 */
  disabled?: boolean | undefined
  /** 控件尺寸。 */
  size?: ProFormProps['size']
  /** 是否展示校验错误信息。 */
  showMessage?: ProFormProps['showMessage']
  /** 是否隐藏必填星号。 */
  hideRequiredAsterisk?: ProFormProps['hideRequiredAsterisk']
  /** 必填星号位置。 */
  requireAsteriskPosition?: ProFormProps['requireAsteriskPosition']
  /** 校验失败时是否滚动到第一个错误字段。 */
  scrollToError?: ProFormProps['scrollToError']
  /** 透传给 `ElForm` 的其余属性。 */
  formProps?: ProFormProps['formProps']
}

/** `TabForm` 暴露给父组件的方法。 */
export interface TabFormAction {
  /** 当前激活的 tab。 */
  active: string | number | undefined
  /** 校验全部 tab，失败时切到第一个出错的分段并返回 `false`。 */
  submit: () => Promise<boolean>
  /** 重置全部字段并回到第一个分段。 */
  resetFields: () => void
  /** 取指定分段的表单实例；不传 name 时取当前分段。 */
  getFormInstance: (name?: string) => ProFormAction | undefined
  /** 最近一次提交时校验失败的分段名，不触发新校验。 */
  getInvalidTabs: () => string[]
}
