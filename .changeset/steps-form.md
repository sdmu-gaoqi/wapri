---
'@wapri/element-pro': minor
---

新增分步表单 `StepsForm`：用 `<StepsForm>` 包住若干 `<StepsForm.StepForm>`，每步一个独立表单，点「下一步」先校验当前步，最后一步把所有步骤的字段合并后交给 `onFinish`。

支持 `v-model:current`、`stepsProps` 透传、`allowStepSelect` 点击切换、`submitter` 按钮配置，以及 `next` / `prev` / `submit` / `resetFields` / `getAllFieldsValue` / `getFormInstance` 实例方法。
