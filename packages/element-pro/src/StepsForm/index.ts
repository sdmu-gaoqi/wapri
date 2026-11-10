import StepsFormComponent from './index.vue'
import StepsFormStepComponent from './components/StepsFormStep.vue'
import { withInstall } from '../utils/install'
import './styles/index.scss'

/** 单个步骤，也可通过 `StepsForm.StepForm` 使用。 */
export const StepsFormStep = withInstall(StepsFormStepComponent)

export const StepsForm = withInstall(StepsFormComponent, { StepForm: StepsFormStep })

export * from './types'
