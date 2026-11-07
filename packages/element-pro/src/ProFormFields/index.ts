import ProFormCascaderComponent from './components/ProFormCascader.vue'
import ProFormDatePickerComponent from './components/ProFormDatePicker.vue'
import ProFormDateRangePickerComponent from './components/ProFormDateRangePicker.vue'
import ProFormDateTimePickerComponent from './components/ProFormDateTimePicker.vue'
import ProFormDateTimeRangePickerComponent from './components/ProFormDateTimeRangePicker.vue'
import ProFormDigitComponent from './components/ProFormDigit.vue'
import ProFormMoneyComponent from './components/ProFormMoney.vue'
import ProFormPasswordComponent from './components/ProFormPassword.vue'
import ProFormSelectComponent from './components/ProFormSelect.vue'
import ProFormSwitchComponent from './components/ProFormSwitch.vue'
import ProFormTagComponent from './components/ProFormTag.vue'
import ProFormTextComponent from './components/ProFormText.vue'
import ProFormTextAreaComponent from './components/ProFormTextArea.vue'
import ProFormTreeSelectComponent from './components/ProFormTreeSelect.vue'
import { withInstall } from '../utils/install'
import './styles/index.scss'

export const ProFormPassword = withInstall(ProFormPasswordComponent)
export const ProFormTextArea = withInstall(ProFormTextAreaComponent)
export const ProFormDigit = withInstall(ProFormDigitComponent)
export const ProFormMoney = withInstall(ProFormMoneyComponent)
export const ProFormSelect = withInstall(ProFormSelectComponent)
export const ProFormTag = withInstall(ProFormTagComponent)
export const ProFormTreeSelect = withInstall(ProFormTreeSelectComponent)
export const ProFormCascader = withInstall(ProFormCascaderComponent)
export const ProFormDatePicker = withInstall(ProFormDatePickerComponent)
export const ProFormDateRangePicker = withInstall(ProFormDateRangePickerComponent)
export const ProFormDateTimePicker = withInstall(ProFormDateTimePickerComponent)
export const ProFormDateTimeRangePicker = withInstall(ProFormDateTimeRangePickerComponent)
export const ProFormSwitch = withInstall(ProFormSwitchComponent)

/** 密码输入以 `ProFormText.Password` 的形式提供，同时保留独立导出。 */
export const ProFormText = withInstall(ProFormTextComponent, { Password: ProFormPassword })

export * from './types'
