# @wapri/gbase

## 2.4.0

### Minor Changes

- 新增 `aesEncrypt` / `aesDecrypt` / `getSign`：基于 `crypto-js` 的 AES-CBC 加解密（IV 取 key 前 16 位，输出 Base64）与 HmacMD5 参数签名；`@wapri/gutils` 直接透出，并补齐文档页。
- 新增 `fuse.js` 依赖，并从 `@wapri/gbase` 导出 `Fuse` 及常用类型（`IFuseOptions`、`FuseOptionKey`、`FuseResult`、`FuseResultMatch`、`FuseSearchOptions`、`FuseIndex`）。
- 新增 `screenfull` 依赖，并从 `@wapri/gbase` 导出 `screenfull` 及 `ScreenfullEventName` / `ScreenfullRawEventNames` 类型。
- 新增全屏快捷方法 `fullscreen`：`on()` 开启全屏、`off()` 关闭全屏、`switch()` 切换，三者都不需要先判断 `isEnabled`，返回 `Promise<boolean>` 表示是否生效；同时提供 `isEnabled` / `isFullscreen`。事件监听仍用 `screenfull.on('change', handler)`。
- `StorageType` 新增 `cookie`，并导出预置实例 `cookie`。`new MyStorage('cookie')` 通过 `js-cookie` 读写（默认 `path=/`），浏览器不支持时同样回退到内存。

## 2.3.4

### Patch Changes

- table新增debug入口

## 2.3.3

### Patch Changes

- 修订结构,收拢base能力

## 2.3.2

### Patch Changes

- element-pro导出element

## 2.3.1

### Patch Changes

- 更新base,image处理放松对url的拦截

## 2.3.0

### Minor Changes

- 新增火山引擎 TOS 图片处理能力：`withTosImageProcess` / `buildTosImageProcess` / `getTosImageProcess` / `removeTosImageProcess`，支持缩放压缩、质量调整、转 webp 等处理

## 2.2.0

### Minor Changes

- 11c4407: `FileList` 新增 `width` 固定宽度布局与 `append` 插槽：
  - `width`：按指定卡片宽度自动换行，数字按 `px` 处理，也支持 `8rem` 这类字符串；设置后 `columns` 失效，窄屏也不再强制两列。
  - `append`：在网格末尾渲染追加单元格，插槽参数提供 `data` 与 `count`，可与 `CropperUpload` 组合实现「上传裁剪后写入列表」；存在该插槽时空列表不再展示 `emptyText`。

  `@wapri/gbase` 新增尺寸归一化工具 `toCssSize`（数字转 `px`、字符串原样返回），经 `@wapri/gutils` 导出；`TabForm` 与 `FileList` 复用该实现。

## 2.1.0

### Minor Changes

- 新增了预览库

## 2.0.1

### Patch Changes

- 修改readme

## 2.0.0

### Major Changes

- 调整了包的整体结构
