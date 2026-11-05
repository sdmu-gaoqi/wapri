---
title: 迁移指南
nav: 指南
order: 2
toc: false
---

# 迁移指南

汇总 2026-11 开源化带来的破坏性变更，按包给出替换方式。

## 总览

| 包 | 版本 | 变更性质 |
| --- | --- | --- |
| `@wapri/element-pro` | 3.0.0 | 图标能力去业务化、配置类型改名、包结构调整 |
| `@wapri/gbase` | 2.0.0 | 包结构调整 |
| `@wapri/gutils` | 2.0.0 | 包结构调整 |
| `@wapri/ghooks` | 1.0.0 | 包结构调整 |
| `@wapri/gjsbridge` | 5.0.0 | 包结构调整、通道名由业务注入 |

所有包现在只产出 ESM：

- father 包（`gbase` / `ghooks` / `gutils` / `gjsbridge`）通过 `module` 字段指向 `dist/index.js`，`gjsbridge` 额外声明 `type: module` 与 `exports`；
- `element-pro` 的 `main` / `module` 均指向 `dist/index.mjs`；
- 在 Node 里请用 `import`（或交给 bundler），不要用 `require` 直接加载。

## @wapri/element-pro 3.0.0

### 图标：`MaiIcon` → `SvgIcon`

```diff
-import { MaiIcon } from '@wapri/element-pro'
+import { SvgIcon } from '@wapri/element-pro'

-<MaiIcon name="icon-card" />
+<SvgIcon name="card" />
```

- props 类型 `MaiIconProps` 更名为 `SvgIconProps`；`name` 支持带或不带 `icon-` 前缀。
- class 前缀由组件库统一 `prefix` 决定，输出 `${prefix}-svg-icon`（默认 `wa-ui-svg-icon`）。

### 图标源不再内置

库内不再写死任何图标集地址，也不会主动请求第三方资源。使用前二选一注入：

```vue | pure
<!-- 单个图标：src 优先 -->
<SvgIcon
  name="card"
  src="https://cdn.example.com/iconfont.js"
/>

<!-- 全局：ConfigProvider 的 iconfont -->
<ConfigProvider iconfont="https://cdn.example.com/iconfont.js">
  <SvgIcon name="card" />
</ConfigProvider>
```

两者都不传时，只读取页面里已存在的 `<symbol>`。

### 配置类型改名

| 旧 | 新 |
| --- | --- |
| `MaiUISize` | `ElementProSize` |
| `MaiUIConfigContext` | `ElementProConfigContext` |

### 安装

```bash
pnpm add @wapri/element-pro element-plus @element-plus/icons-vue
```

`element-plus`、`@element-plus/icons-vue`、`vue` 均为 peer，需由宿主显式安装。

## @wapri/gjsbridge 5.0.0

通道名与缓存键由业务注入，默认值仅为通用值：

```ts
import { createJSB } from '@wapri/gjsbridge'

export const jsbridge = createJSB({
  nativeChannel: 'YOUR_CHANNEL',
  globalKey: 'YOUR_GLOBAL_KEY',
})
```

`@wapri/gbase` 为 peer 依赖（`2.0.0`），升级 `gbase` 时需同步本包。

## 工具链（贡献者）

| 旧 | 新 |
| --- | --- |
| `@wagq/wa-cli` 的 `wa changesetDoc *` | 直接使用 `dumi` / `changeset` / `pnpm -r` 脚本 |
| `eslint` + `prettier`（`@wagq/lint-es`） | `oxlint` + `oxfmt`（`@wagq/lint-ox`） |

```bash
pnpm lint          # oxlint
pnpm lint:fix      # oxlint --fix
pnpm format        # oxfmt
pnpm format:check  # 只校验
```

编辑器请安装 Oxc 官方扩展（`oxc.oxc-vscode`），仓库内 `.vscode/settings.json` 已指向共享配置。
