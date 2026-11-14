# @wapri/gutils

## 2.3.0

### Minor Changes

- 新增火山引擎 TOS 图片处理能力：`withTosImageProcess` / `buildTosImageProcess` / `getTosImageProcess` / `removeTosImageProcess`，支持缩放压缩、质量调整、转 webp 等处理

### Patch Changes

- Updated dependencies
  - @wapri/gbase@2.3.0

## 2.2.0

### Minor Changes

- 11c4407: `FileList` 新增 `width` 固定宽度布局与 `append` 插槽：
  - `width`：按指定卡片宽度自动换行，数字按 `px` 处理，也支持 `8rem` 这类字符串；设置后 `columns` 失效，窄屏也不再强制两列。
  - `append`：在网格末尾渲染追加单元格，插槽参数提供 `data` 与 `count`，可与 `CropperUpload` 组合实现「上传裁剪后写入列表」；存在该插槽时空列表不再展示 `emptyText`。

  `@wapri/gbase` 新增尺寸归一化工具 `toCssSize`（数字转 `px`、字符串原样返回），经 `@wapri/gutils` 导出；`TabForm` 与 `FileList` 复用该实现。

### Patch Changes

- Updated dependencies [11c4407]
  - @wapri/gbase@2.2.0

## 2.1.0

### Minor Changes

- 新增了预览库

### Patch Changes

- Updated dependencies
  - @wapri/gbase@2.1.0

## 2.0.1

### Patch Changes

- 修改readme
- Updated dependencies
  - @wapri/gbase@2.0.1

## 2.0.0

### Major Changes

- 调整了包的整体结构

### Patch Changes

- Updated dependencies
  - @wapri/gbase@2.0.0
