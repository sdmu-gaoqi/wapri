import { CheckCard } from './CheckCard'
import { ModalForm } from './ModalForm'
import { DrawerForm } from './DrawerForm'
import { Ellipsis } from './Ellipsis'
import type { App } from 'vue'
import { DateQuickSelect } from './DateQuickSelect'
import { ProTable } from './ProTable'
import { TagSelector } from './TagSelector'
import { VH100 } from './VH100'
import { ConfigProvider } from './ConfigProvider'
import { SvgIcon } from './SvgIcon'
import { Layout } from './Layout'
import { MainContent } from './MainContent'
import { ShareButton } from './ShareButton'
import { Sidebar } from './Sidebar'
import { CropperUpload } from './CropperUpload'
import { UmdComponent } from './UmdComponent'
import { ProForm } from './ProForm'
import { ProFormDependency } from './ProFormDependency'
import { ProFormList } from './ProFormList'
import { StepsForm, StepsFormStep } from './StepsForm'
import { TabForm, TabFormItem } from './TabForm'
import {
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormPassword,
  ProFormSelect,
  ProFormSwitch,
  ProFormTag,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from './ProFormFields'
import { version } from '../package.json'
// 全局主题变量（:root 上的 CSS 变量），随组件库样式一起输出
import './styles/theme.scss'

export * from './ProTable'
export {
  type DateQuickSelectSelection,
  type DateQuickSelectValue,
  type DateQuickSelectValueType,
} from './DateQuickSelect'
export * from './TagSelector'
export * from './VH100'
export * from './ConfigProvider'
export * from './SvgIcon'
export * from './CheckCard'
export * from './Ellipsis'
export * from './Layout'
export * from './MainContent'
export * from './ShareButton'
export * from './Sidebar'
export * from './CropperUpload'
export * from './UmdComponent'
export * from './ProFormFields'
export * from './ProForm'
export * from './ProFormList'
export * from './ProFormDependency'
export * from './StepsForm'
export * from './TabForm'
export {
  ConfigProvider,
  SvgIcon,
  ProTable,
  VH100,
  ModalForm,
  DrawerForm,
  Ellipsis,
  DateQuickSelect,
  TagSelector,
  Sidebar,
  MainContent,
  Layout,
  ShareButton,
  CropperUpload,
  UmdComponent,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormPassword,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
  ProFormTag,
  ProFormTreeSelect,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormSwitch,
  ProFormList,
  ProFormDependency,
  StepsForm,
  StepsFormStep,
  TabForm,
  TabFormItem,
}
export type { ModalFormProps, DrawerFormProps, OverlayFormProps, OverlayFormAction } from './shared/overlayForm/types'

const components = [
  ConfigProvider,
  SvgIcon,
  ProTable,
  VH100,
  ModalForm,
  DrawerForm,
  CheckCard,
  Ellipsis,
  DateQuickSelect,
  TagSelector,
  Sidebar,
  MainContent,
  Layout,
  ShareButton,
  CropperUpload,
  UmdComponent,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormPassword,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
  ProFormTag,
  ProFormTreeSelect,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormSwitch,
  ProFormList,
  ProFormDependency,
  StepsForm,
  StepsFormStep,
  TabForm,
  TabFormItem,
]

const install = (app: App): void => {
  for (const comp of components) {
    app.use(comp)
  }
}

export { version }

export default {
  install,
  version,
}
