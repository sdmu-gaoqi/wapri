/**
 * 跨组件共用的类型。
 *
 * 组件库对外只暴露「值 + 事件」，这里只放多个组件都会用到的结构，
 * 避免父工程为了同一份区间/选项写好几种形状的类型。
 */

/** 尺寸档位，取值与 Vant 的 size 一致，组件内部不用再做一层映射 */
export type WaComponentSize = 'small' | 'medium' | 'large'

/** 数字区间：range 类筛选项共用 */
export interface WaNumberRange {
  min?: number
  max?: number
}

/**
 * 日期区间。
 * 统一用字符串而不是 Date：筛选条件最终要原样丢给接口，Date 会在序列化时被转成 ISO 串，
 * 父组件还得再格式化一次。
 */
export interface WaDateRange {
  start: string
  end: string
  /** 命中快捷项时记录名称，摘要与回显优先展示它 */
  shortcut?: string
}

/** 通用选项：value 是业务主键，label 只负责展示 */
export interface WaOption<Value extends string | number = string> {
  label: string
  value: Value
  disabled?: boolean
}
