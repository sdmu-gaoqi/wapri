---
'@wapri/element-pro': minor
---

新增 `FileUpload` 上传面板：标题 + 拖拽提示 + 按钮区，支持点击、拖拽、键盘选文件，`select` 抛出按 `accept` 过滤后的 `File[]`，被拦下的文件走 `reject`；`actions` 插槽可替换自带按钮（参数里的 `open` 保留打开文件选择框的能力），`loading` / `disabled` 覆盖上传中与禁用态。
