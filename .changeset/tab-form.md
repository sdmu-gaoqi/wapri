---
'@wapri/element-pro': minor
---

新增多 tab 表单 `TabForm`：用 `<TabForm>` 包住若干 `<TabForm.Item>`，所有 tab 共用一份 `model`，可自由切换；提交时校验全部 tab，失败自动跳到第一个出错的分段并在标题上显示红点。

支持 `v-model:active`、`tabsProps` 透传、`submitter` 按钮配置，以及 `submit` / `resetFields` / `getFormInstance` / `getInvalidTabs` 实例方法。
