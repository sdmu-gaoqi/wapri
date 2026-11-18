# Tasks

## 1. 常量与类型

- [x] 1.1 在 `packages/element-pro/src/constant/index.ts` 增加 `nprogressDefaults`（minimum / maximum / trickle / trickleSpeed / showSpinner / speed / easing / parent / zIndex / color），验证默认值与提案一致
- [x] 1.2 在同文件增加 `nprogressMaxReachable`（0.994）与 `nprogressTrickleSteps`（分区间步长），验证 `inc()` 的封顶值取自常量
- [x] 1.3 新建 `packages/element-pro/src/NProgress/types.ts`，定义 `NProgressOptions`、`NProgressSettings`、`NProgressInstance`，验证 `pnpm lint` 无 `any`

## 2. 实现

- [x] 2.1 新建 `create.ts`，实现 `resolveSettings`（默认值补全）与 `clamp` / `trickleAmount` 工具，验证未传的配置项取默认值
- [x] 2.2 实现懒挂载：首次 `start()` 才 `createElement` 并插入 `body` 或 `parent`，验证未调用前 DOM 中无节点
- [x] 2.3 实现 `paint`：把进度换算成 `translate3d((n-1)*100%, 0, 0)` 并同步 `aria-valuenow`，验证 `set(0.5)` 落在 -50%
- [x] 2.4 实现 `start` / `set` / `inc` / `trickle`，验证重复 `start()` 不回退、`inc()` 不超过 0.994、`set(maximum)` 等价于 `done()`
- [x] 2.5 实现 `scheduleTrickle`：按 `trickleSpeed` 递归触发 `inc()`，`trickle: false` 时不建定时器，验证定时器在 `done()` / `remove()` 后清空
- [x] 2.6 实现 `finish`：`done()` 先让进度走满，再按 `speed` 淡出，最后移除节点并清 `<html>` 忙碌标记，验证 DOM 无残留
- [x] 2.7 实现淡出期间再次 `start()` 时取消收尾定时器，验证进度条复用同一节点重新显示
- [x] 2.8 实现 `configure`：合并配置并对已挂载节点立即生效（CSS 变量、转圈显隐、scoped 修饰类），验证 `settings` 同步
- [x] 2.9 实现 `remove()` 与 `isStarted()`，验证 `remove()` 幂等、未挂载时调用不报错
- [x] 2.10 为全部方法加 `typeof document === 'undefined'` 守卫，验证 Node 环境调用不抛异常

## 3. 导出

- [x] 3.1 新建 `NProgress/index.ts`，导出单例 `NProgress`、`createNProgress` 与类型，并在文件内引入 `styles/index.scss`
- [x] 3.2 修改 `packages/element-pro/src/index.ts`：加入 import、具名导出与 `export *`，验证从包入口可取到 `NProgress`
- [x] 3.3 确认 `NProgress` 不进入 `components` 注册数组，验证 `app.use(ElementPro)` 的行为不变

## 4. 样式

- [x] 4.1 新建 `styles/index.scss`，class 前缀使用 `constant/index.ts` 的 `defaultPrefix`，验证 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 4.2 用 CSS 变量实现颜色 / 高度 / 层级 / 过渡时长，默认色取 `--el-color-primary`，验证覆盖变量即生效
- [x] 4.3 实现 `--scoped` 修饰类（`position: absolute`）与忙碌态光标，验证 `parent` 场景定位正确

## 5. 文档与示例

- [x] 5.1 新建 `index.md`，frontmatter 为 `title: NProgress 顶部进度条`、`group.title: 基础`、`order: 4`，验证 `/element-pros/nprogress` 可访问
- [x] 5.2 新建 `demo/basic.vue`：`start()` / `inc()` / `set(0.5)` / `done()` / 模拟请求五个入口，验证点击后进度条行为符合预期
- [x] 5.3 新建 `demo/configure.vue`：`showSpinner`、`trickle`、颜色三项配置 + 预览按钮，验证配置即时生效
- [x] 5.4 在 `index.md` 补 API / Options / CSS 变量表，并给出路由守卫与请求拦截器两段接入示例，验证表项都能在 demo 或示例中找到用法
- [x] 5.5 在 `index.md` 写明「不新增依赖、API 对齐 nprogress」「SSR 空操作」「多实例用 `createNProgress`」三条说明

## 6. 验证

- [x] 6.1 新增 `packages/element-pro/tests/nprogress.test.mjs`（伪 DOM + `node:test` mock timers），覆盖挂载、`set` / `inc`、`configure`、收尾清理、多实例与 SSR，验证全部用例通过
- [x] 6.2 运行 `node --test packages/element-pro/tests/nprogress.test.mjs`，全部通过
- [x] 6.3 运行 `pnpm lint`、`pnpm format:check`、`pnpm --filter @wapri/element-pro build`，全部通过

## 7. 发布登记

- [x] 7.1 新增 `.changeset/nprogress.md`，内容为 `"@wapri/element-pro": minor` 并说明新增函数式顶部进度条
- [x] 7.2 在根 `AGENTS.md` 的 Repository Map 与 `openspec/project.md` 的约定中补充 `NProgress`，验证两处描述一致

## Workflow follow-up

- 实施完成后运行 `npx -y @fission-ai/openspec@latest validate add-nprogress --strict`。
- 校验通过后运行 `npx -y @fission-ai/openspec@latest archive add-nprogress` 归档。
- 提交、推送、开 PR 由人工执行。
