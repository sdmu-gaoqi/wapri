export interface ShareButtonProps {
  /**
   * 分享目标链接。
   * 非微信内置浏览器内点击直接跳转，微信内改为弹出「到浏览器打开」的引导浮层。
   */
  link: string
  /** 按钮文案，默认「分享」；也可通过默认插槽自定义内容。 */
  text?: string
  /** 是否禁用。 */
  disabled?: boolean
  /**
   * 是否强制展示引导浮层。
   * 默认按 `os.isWeixin()` 判断，置为 true 可在非微信环境预览、调试引导浮层。
   * @default false
   */
  forceGuide?: boolean
  /** 引导浮层标题。 */
  guideTitle?: string
  /**
   * 是否展示右上角的引导箭头，指向微信「···」所在位置。
   * @default true
   */
  showArrow?: boolean
  /** 引导浮层步骤文案，按序展示；`**文案**` 会渲染为加粗。 */
  guideSteps?: string[]
  /** 引导浮层底部按钮文案，点击后复制 `link`。 */
  actionText?: string
}

export interface ShareButtonEmits {
  /** 点击时触发，无论最终是跳转还是弹引导浮层。 */
  share: [link: string]
  /** 引导浮层里点击「复制链接」成功后触发。 */
  copy: [link: string]
}
