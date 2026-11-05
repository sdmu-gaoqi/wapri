# @wapri/element-pro

## 3.0.0

### Major Changes

- e698455: 图标能力去业务化，去除内部品牌命名与内置图标源：
  - `MaiIcon` 重命名为 `SvgIcon`，class 前缀改为 `${prefix}-svg-icon`；`MaiIconProps` → `SvgIconProps`。
  - `MaiUISize` 重命名为 `ElementProSize`，`MaiUIConfigContext` 重命名为 `ElementProConfigContext`。
  - 删除内置的 `MAI_ICONFONT_URL`：图标集地址改由 `SvgIcon` 的 `src` 或 `ConfigProvider` 的 `iconfont` 注入，库内不再请求任何第三方图标地址。
  - 迁移：`import { MaiIcon } from '@wapri/element-pro'` → `import { SvgIcon } from '@wapri/element-pro'`；使用图标前通过 `ConfigProvider :iconfont="https://你的图标集.js"` 指定图标源。

- 调整了包的整体结构

### Patch Changes

- Updated dependencies
  - @wapri/ghooks@1.0.0
  - @wapri/gutils@2.0.0
