---
'@wapri/gbase': minor
'@wapri/gutils': minor
'@wapri/element-pro': minor
---

`FileList` 新增 `width` 固定宽度布局与 `append` 插槽：

- `width`：按指定卡片宽度自动换行，数字按 `px` 处理，也支持 `8rem` 这类字符串；设置后 `columns` 失效，窄屏也不再强制两列。
- `append`：在网格末尾渲染追加单元格，插槽参数提供 `data` 与 `count`，可与 `CropperUpload` 组合实现「上传裁剪后写入列表」；存在该插槽时空列表不再展示 `emptyText`。

`@wapri/gbase` 新增尺寸归一化工具 `toCssSize`（数字转 `px`、字符串原样返回），经 `@wapri/gutils` 导出；`TabForm` 与 `FileList` 复用该实现。
