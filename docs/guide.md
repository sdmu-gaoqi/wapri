---
nav: 指南
order: 1
---

# JS SDK 开发指南

本项目是一个 JS SDK 集合，采用 `pnpm` 管理的 `monorepo` 多包结构。

## 技术栈

- **pnpm workspace**：管理多包依赖。
- **changesets**：控制版本和生成 changelog。
- **father / vite**：独立编译各子包（`element-pro` 用 vite，其余包用 father）。
- **@wagq/lint-ox**：基于 oxlint + oxfmt 的统一代码检查与格式化规范。
- **husky & lint-staged**：在提交代码时进行校验。
- **dumi**：生成文档 (Vue 模式, 通过 @dumijs/preset-vue)。

---

## 开发流程

### 1. 安装依赖

#### 初始化安装

```bash
pnpm i
```

#### 全局安装依赖

用于开发环境的工具安装，例如 lint 工具或构建工具：

```bash
pnpm -wD add <package-name>
```

`-w` 参数表示在 workspace 根目录执行命令。

#### 给某个子包安装依赖

使用 `--filter` 参数指定子包：

```bash
pnpm --filter <package-name> add <dependency>
pnpm --filter <package-name> -D add <dev-dependency>
```

#### package 之间的依赖

`pnpm` 会自动根据 `workspace:` 协议链接 monorepo 内包的相互依赖。例如：

```bash
pnpm --filter <package-name> add <internal-package>
```

#### 重新安装依赖

如果依赖安装出现问题，可以清除后重新安装：

```bash
pnpm clear
pnpm i
```

---

### 2. 子包开发

#### 子包结构要求

每个子包必须包含以下文件：

- `src`：源码目录。
- `.fatherrc.ts`：father 打包配置（`gbase` / `ghooks` / `gutils` / `gjsbridge`）。`element-pro` 例外，用 `vite.config.ts`（`vite-plugin-dts` + `external` 白名单）。
- `package.json`：包的元信息，`name` 以 `@wapri/` 开头（如 `@wapri/element-pro`），版本号建议初始为 `0.0.0`。`build` 脚本统一以 `node ../../scripts/clean-dist.mjs &&` 开头，避免已删除模块残留在 `dist` 被一起发包。
- `tsconfig.json`：TypeScript 配置文件，需设置 `paths` 以解析依赖。

#### 配置更新

新增子包后，需要在 `.dumirc.ts` 中更新以下配置：

- `atomDirs`：添加子包路径，`type` 决定文档路由前缀。
- `alias`：添加子包路径别名。

> dumi 会对 `atomDirs.type` 做复数化：`element-pro` → `/element-pros`、`jsbridge` → `/jsbridges`。
> 导航、首页卡片、文档内链一律按复数写，否则页面 404。

#### 注意事项

- 请在 `feature` 分支进行开发，避免干扰主分支的工作流。
- 如果需要修改打包输出格式（如 UMD），需调整 `.fatherrc.ts` 和 `package.json` 的相关配置。

---

### 3. 发布流程

#### 使用 changesets 管理版本

1. **添加变更记录**

   在 `feature` 分支中执行：

   ```bash
   pnpm changeset
   ```

   根据提示选择变更的包、版本类型（`major`、`minor`、`patch`），并填写 changelog。

2. **更新版本号**

   在 `main` 分支中，由管理员执行：

   ```bash
   pnpm ver
   ```

   这一步会根据变更记录更新版本号和 changelog。

3. **发布到 npm**

   在 `main` 分支中，由管理员执行：

   ```bash
   pnpm pub
   ```

---

### 4. 发布 Beta 版本

#### 流程

1. 进入预发模式：

   ```bash
   pnpm enter-beta
   ```

2. 按正式发布流程的第 1、2 步操作。

3. 退出预发模式：

   ```bash
   pnpm exit-beta
   ```

4. 发布 Beta 版本：

   ```bash
   pnpm pub:beta
   ```

#### 注意事项

- Beta 版本的开发和发布请勿在 `main` 分支中进行，避免污染正式工作流。

---

### 5. 代码检查与格式化

lint 与格式化统一由 `@wagq/lint-ox`（oxlint + oxfmt）提供，不再使用 eslint / prettier：

```bash
pnpm lint          # oxlint 检查，配置见 .oxlintrc.json（继承 @wagq/lint-ox/oxlint/vue.json）
pnpm lint:fix      # oxlint 自动修复
pnpm format        # oxfmt 格式化，配置见 .oxfmtrc.jsonc（与 @wagq/lint-ox/oxfmt.json 保持一致）
pnpm format:check  # 只校验格式，不写入文件
```

- 提交时由 husky + lint-staged 自动执行 `oxlint --fix` 与 `oxfmt --write`。
- 忽略范围写在 `.oxfmtrc.jsonc` 的 `ignorePatterns`（Markdown / HTML / 产物目录不参与格式化），另叠加 `.gitignore`。
- 编辑器安装 Oxc 官方扩展（`oxc.oxc-vscode`），`.vscode/settings.json` 已指向仓库内的 `.oxlintrc.json` 与 `.oxfmtrc.jsonc`。

### 6. 文档站

文档站由 dumi + `@dumijs/preset-vue` 生成，站点配置在 `.dumirc.ts`。

```bash
pnpm dev   # 本地预览，默认 http://localhost:8000
pnpm doc   # 构建到 docs-dist
```

- 品牌、部署子路径、接口代理都由环境变量注入：`DOC_SITE_NAME`、`DOC_SITE_TITLE`、`DOC_LOGO`、`DOC_BASE_PATH`、`DOC_PROXY_TARGET`；仓库内不写死业务地址。
- 每个组件的文案放在 `src/<组件>/index.md`，示例用 `<code src="./demo/basic.vue"></code>` 引用。
- 页面路由由 `atomDirs` 推导并复数化，新增页面或导航时注意前缀（见上一节的提示）。
- `pnpm doc` 就是 `dumi build`，产物在 `docs-dist`。dumi 会把 demo 的绝对路径写进 `meta__packages.*.async.js`，部署前先确认产物里没有构建机的本机路径。
- 推送到 `main` 会触发 `.github/workflows/deploy-docs.yml`：构建文档站并发布到 GitHub Pages（`https://<user>.github.io/<repo>/`）。首次使用需在仓库 `Settings → Pages` 把 Source 设为 `GitHub Actions`。
- 部署子路径默认取仓库名（`/<repo>/`），需要自定义域名或部署到用户主页时，在仓库 `Variables` 里把 `DOC_BASE_PATH` 设为 `/`；品牌名同理用 `DOC_SITE_NAME` / `DOC_SITE_TITLE` 覆盖。
- 工作流在发布前会抹掉产物里的构建机绝对路径，并校验残留；本地手动部署时记得自己清一遍。

---

## 常见命令速览

- **安装依赖**：`pnpm i`
- **清除依赖**：`pnpm clear`
- **本地文档预览**：`pnpm dev`
- **构建文档站**：`pnpm doc`
- **构建全部子包**：`pnpm build`
- **代码检查**：`pnpm lint` / `pnpm lint:fix`
- **格式化**：`pnpm format` / `pnpm format:check`
- **添加变更记录**：`pnpm changeset`
- **更新版本号**：`pnpm ver`
- **发布正式版本**：`pnpm pub`
- **发布 Beta 版本**：`pnpm pub:beta`