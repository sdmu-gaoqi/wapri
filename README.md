# wapri-sdk

Vue 3 组件库与前端公共能力的集合项目

## 技术栈

- 项目为标准的 pnpm `monorepo` 多包结构，[pnpm workspace](https://pnpm.io/workspaces) 处理多包依赖

- [changesets](https://github.com/changesets/changesets) 控制版本和 changelog

- [vite](https://vitejs.dev/) / [vue](https://vuejs.org/) 独立编译各子包 (Vue 组件库)

- `@wagq/lint-ox` 提供的 oxlint(语法) 和 oxfmt(格式) 做代码检查

- husky, lint-staged 做 commit 时的校验

- dumi + @dumijs/preset-vue 生成文档 (Vue 模式)

- [turbo](https://turbo.build/)  为monorepo项目快速构建而生

## 开发

### 安装依赖

> 安装前，请确保 pnpm 升级到 9.x 版本（可执行 pnpm add -g pnpm）

- 初始化的安装

  ```bash
  pnpm i && pnpm build
  ```

- 全局安装依赖

  一般用于开发环境的工具安装，例如 lint 工具、构建工具。依赖在所有子包中都可以获取。子包的生产的依赖勿安装到全局。

  ```bash
  pnpm -wD add xxx
  ```

  其中 [-w](https://pnpm.io/pnpm-cli#-w---workspace-root) 参数，可以指明 `pnpm` 命令在 workspace 根目录执行（无论当前路径是不是子目录内）

- 给某个 package 安装依赖

  `pnpm` 提供了 [--filter](https://pnpm.io/filtering) 参数，可以对特定的 package 执行 `pnpm` 命令

  例如给 `@wapri/ghooks` 安装 react：

  ```bash
  pnpm --filter @wapri/ghooks add react
  
  pnpm --filter @wapri/ghooks -D add @types/react # 安装dev依赖
  ```

  `--filter` 除了指定包名，还可以使用通佩符，例如执行所有 package 的构建：

  ```bash
  pnpm --filter "./packages/**" build
  ```

- package 之间的依赖
  `pnpm` 会自动根据 [workspace:](https://pnpm.io/workspaces#workspace-protocol-workspace) 协议，链接 monorepo 内包的相互依赖。当满足范围条件时，将自动将依赖链接到 monorepo 内的包

  例如，我们给 @wapri/ghooks 安装 @wapri/gutils

  ```bash
  pnpm --filter @wapri/ghooks add @wapri/gutils
  ```

  会看到 hooks 的 dependencies 中，utils 描述为：`@wapri/gutils: "workspace:^"`

  在发布时，`workspace:` 协议将自动更新为对应的依赖版本号，从而不需要我们每次手动修改

- 重新安装依赖
  若依赖安装出现问题，项目无法正常启动，可删除所有依赖，重新安装

  ```bash
  # 清除
  pnpm clear
  # 安装
  pnpm i
  ```

### 子包开发

- pnpm 自动读取 `packages` 文件夹下的第一级文件夹作为子包文件夹

- 新增子包后，`.dumirc.ts`中需要在 `atomDirs`，`alias` 内添加子包的路径

- 子包必须要包含：`src`,`package.json`,`tsconfig.json`，可参考已有范例配置。要注意下：

  - `tsconfig.json` 中需要设置 paths，以使 demo 文件能解析依赖
  - `package.json` 中需要设置打包和dev脚本
  - `package.json` name 包名以 `@wapri/` 开头（如 `@wapri/element-pro`）
  - `package.json` 在创建时，建议将版本号置为 0.0.0
   - 使用 vite 进行构建，需配置 `vite.config.ts`

- **请在 feature 分支进行开发，勿干扰主分支 workflow**

### 发布工作流

monorepo 中最复杂的事情就是版本管理。我们使用 [changesets](https://github.com/changesets/changesets) 工具来实现。

新添加的包，配置可参考 demo 包，package.json 中的起始版本号建议设置为 `0.0.0`

发布流程如下：

1. 添加一组变更 (feature分支)

```bash
pnpm changeset
```

changeset 意为**一组变更**。这一步会交互式填写版本和 changelog 信息，过程如下：

- 执行命令后，可以使用上下剪头移动光标，`空格键`选择/取消，`回车键`确认，来选择本次更新的代码变动范围

- 然后，交互式选择更新版本类型，分别询问是否是 `major` 版本，`minor` 版本。若是对应版本，则空格选择后，回车确认；若不是，则直接回车确认跳过

- 填写 changelog

- 完成后确认 .changeset 文件夹中的 .md 文件记录的log和版本是否正确(`major`大版本/`minor`小版本/`patch`补丁版本)

> 这一步并不会对代码中的版本号和 changelog 文件做实质性变动，只会将信息记录到 .changeset 文件夹中

我们在一次 merge request 前，可以有一次或多次 changeset。在一次比较大变更，并想留下log记录的时候，可以多添加一次

在 .changeset 文件夹下生成的 md 文件，记录了执行 `pnpm changeset` 后的信息，若不满足需要，可手动修改

**修改完成需要发版时，提 merge request 到 `main` 分支，由管理员完成后续发布操作**

2. 更新版本 (主分支，管理员操作)

```bash
pnpm ver
```

收集上一步的所有 changeset 并根据上一步所选的版本信息，和包的依赖情况，自动更新版本号和依赖此 package 的内部 package 的版本号。并更新 changelog 文件

3. 发布（主分支，管理员操作）

```bash
pnpm pub
```

将所有变更的包发布到 npm

#### 发布 beta 版本

有时候我们在测试，不想发布正式的包，影响到线上的东西。这时，可以使用 [prerelease](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) 发布预发版本的包

> 切记： beta 版本请勿在主分支（main分支）中编辑和发布，避免污染他人工作流！

1. 进入预发模式

```bash
pnpm enter-beta
```
 
2. 更新版本

执行正式工作流的 1. 2. 步骤，更新版本

3. 退出预发模式

```bash
pnpm exit-beta
```

4. 发布版本

```bash
pnpm pub:beta
```

