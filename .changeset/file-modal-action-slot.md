---
'@wapri/element-pro': minor
---

`FileModal` 新增 `action` 插槽：传入后渲染自定义触发入口，点击即可打开弹窗，开关由组件内部维护，无需再配合 `v-model:open`；插槽参数提供 `open` 与 `visible`。
