# 项目长期记忆

## 新增子包的固定动作

1. `packages/<name>/{package.json,tsconfig.json,README.md,CHANGELOG.md,src}`，版本从 `0.0.0` 起，`build` 以 `node ../../scripts/clean-dist.mjs &&` 开头。
2. 需要编译 `.vue` 的包用 `vite.config.ts`（`vite-plugin-dts` + external 白名单），纯 TS 包用 `.fatherrc.ts`。
3. 六处登记：`.dumirc.ts`（atomDirs / nav / alias）、`docs/changelog/<pkg>.md`、根 `AGENTS.md` 仓库地图、`docs/guide.md`、`openspec/project.md` 包表、`.changeset/*.md`。
4. 文档路由按 `atomDirs.type` 复数化（preview → `/previews`，player → `/players`）。
5. 先写 `openspec/changes/<id>/` 提案（proposal / tasks / specs，有取舍补 design），`validate --strict` 通过后再实施。

## 文档组织约定

- 一个包一个「简介」页 + 按能力拆分的子页面，不要把所有 demo 堆在 `src/index.md`。
- 子页面放在 `src/<kebab-name>/index.md`，路由即文件夹名；demo 放同级 `demo/*.vue`，用 `<code src="./demo/x.vue">` 引用。
- 侧边栏分组靠 frontmatter 的 `group: { title, order }`，简介用 `group: { order: -10 }`。

## player 包（@wapri/gplayer）

- 组件 `VideoPlayer` 封装 artplayer；`plugins` 用 `Array<string | { key; setting }>`，`setting` 覆盖默认配置，读类型化配置用 `pluginEntry`。
- 新增插件：在 `src/plugins/` 写 `PluginDefinition`，在 `plugins/index.ts` 注册进 `builtinPlugins`，菜单项通过 `context.setting()` 加；需要收尾的副作用用 `context.onCleanup()`。
