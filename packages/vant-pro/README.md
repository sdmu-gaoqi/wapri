# @wapri/vant-pro

Vue 3 + Vant 4 的 **业务无关** H5 公共组件库，给「开麦商家端 H5」等移动端页面复用：

| 组件 | 用途 |
| --- | --- |
| `WaUpload` | 基于 `van-share-sheet` 的上传入口 + 可预览/重试/删除的缩略图网格，取图能力由父组件通过 `pick` 注入 |
| `WaTabbar` | 底部菜单，`van-tabbar` + `van-tabbar-item`，支持双态图标、角标、红点 |
| `WaFilterBar` | 筛选栏：字段触发器弹窄下拉，点「筛选」展开全字段面板，状态全部交给 `van-form` |
| `WaEmpty` | 空状态，支持 `van-empty` 内置图与常用业务预设 |
| `WaVH100` | 高度等于视口高度的容器，监听 `resize` 跟随移动端地址栏变化 |
| `WaUmdComponent` | 按需加载远程 UMD 组件，Vue / React 均支持 |

组件内不 import 任何接口、store、路由、业务常量；一切外部行为都通过 props（含函数类型 props）和 emits 注入。

## 安装

```bash
pnpm add @wapri/vant-pro vant vue
```

- `vant`、`vue` 是 `peerDependencies`（`vant ^4.9`、`vue ^3.4`），本包不安装、不打包它们，避免出现两份实例。
- 仓库内直接引用工作区源码时，走宿主工程的路径别名即可（见下文「宿主接入要点」）。

## 引入方式

### 全量注册

```ts
import { createApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import WaVantPro from '@wapri/vant-pro'

createApp(App).use(Vant).use(WaVantPro).mount('#app')
```

插件会按各组件 `defineOptions({ name })` 注册：`WaUpload` / `WaTabbar` / `WaFilterBar` / `WaFilterTag` / `WaFilterRange` / `WaFilterDate` / `WaFilterSelect` / `WaEmpty` / `WaVH100` / `WaUmdComponent`。

### 按需引入

```ts
import { WaUpload, WaFilterBar, type UploadFileItem } from '@wapri/vant-pro'
```

也可以直接引单个 SFC（打包时只会带上用到的组件）：

```ts
import WaUpload from '@wapri/vant-pro/src/components/upload/WaUpload.vue'
```

> 每个组件的样式都写在各自的 `<style scoped>` 里，随组件一起进产物，**不需要额外引 CSS**。
> `src/styles/index.css` 只是可选的公共变量与基础类，不引也有兜底颜色。

## 通用约定

- **BEM + `wa-mobile-` 前缀**：`wa-mobile-upload`、`wa-mobile-upload__item`、`wa-mobile-upload--disabled`、`wa-mobile-filter-bar__field`。没有 CSS Modules，也没有 unocss 原子类。
- **受控**：`v-model` 类组件只 emit 新值，绝不在内部 `splice` / `push`，父组件不接也能保持只读展示。
- **主题**：颜色/圆角优先读 `--wa-mobile-*`，默认值再引用 Vant 的 `--van-*`，宿主换肤时自动跟随。覆盖方式：

```css
:root {
  --wa-mobile-color-primary: #ff6a00;
  --wa-mobile-radius: 24rpx;
}
```

- **类型**：`defineProps<...>()` / `defineEmits<...>()` 一律 type-based，导出的类型集中在各组件目录的 `types.ts`。

## 单位与适配

样式统一按 750 设计稿写 `rpx`，构建时换算成 rem（`1rem = 32rpx`）：375 宽度下 32rpx 就是 16px。

宿主用 `postcss-pxtorem` 只换算 `rpx`，`node_modules` 里 Vant 的 px 不受影响：

```ts
import postcssPxtorem from 'postcss-pxtorem'

postcssPxtorem({
  rootValue: 32,
  unit: 'rpx',
  propList: ['*'],
  replace: true,
  mediaQuery: false,
})
```

```ts
const applyRootSize = () => {
  const width = Math.min(document.documentElement.clientWidth, 750)
  document.documentElement.style.fontSize = `${(width / 750) * 32}px`
}

applyRootSize()
window.addEventListener('resize', applyRootSize)
```

文档站用同一套换算（`scripts/postcss-rpx.ts` + `.dumirc.ts` 的 `headScripts`），没装 `postcss-pxtorem`。

## WaUpload

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `UploadFileItem[]` | `[]` | 列表，受控 |
| `pick` | `(source, context) => Promise<UploadPickResult \| UploadPickResult[] \| null \| void>` | — | 取图/取文件能力，组件 `await` 后合并进列表 |
| `maxCount` | `number` | `9` | 最多几个 |
| `accept` | `string` | `'image/*'` | 只作为上下文传给 `pick`，组件自身不渲染 file input |
| `disabled` | `boolean` | `false` | 隐藏「+」与删除按钮 |
| `readonly` | `boolean` | `false` | 同上，语义更偏「只读展示」 |
| `previewable` | `boolean` | `true` | 点击缩略图是否 emit `preview` |
| `sources` | `UploadSource[]` | 拍照 / 从相册选择 / 选择文件 | 动作面板项，`{ key, name, icon? }` |
| `maxSize` | `number` | `10 * 1024 * 1024` | 单文件字节上限 |
| `uploadText` | `string` | `'上传'` | 「+」下面的文案 |

`showUpload` 是内部计算属性（`!disabled && !readonly && 未满额`），不对外暴露。

### Emits

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(value: UploadFileItem[])` | 新增/删除后抛新数组 |
| `select` | `(source: UploadSource)` | 选中动作面板项，**先于** `pick` 触发；没传 `pick` 时业务可在这里自己取图 |
| `picked` | `(items: UploadFileItem[])` | 本次新增的项（不含历史项） |
| `remove` | `(item, index)` | 点删除 |
| `retry` | `(item, index)` | 失败态点击整块热区 |
| `preview` | `(item, index)` | `previewable && item.url` 时点击缩略图 |
| `error` | `(payload: UploadErrorPayload)` | `{ type: 'size' \| 'count' \| 'pick', message, item?, source? }` |

### 行为约定

- `status: 'uploading'` 时浮层显示 `van-loading` + 百分比；`'failed'` 时显示重试图标，点击整块格子 emit `retry`。
- 非图片按文件名渲染 `van-icon` + 名称；没有扩展名的地址按图片处理（H5 主要来源是拍照/相册）。
- `pick` 抛错或返回空数组视为「用户取消」，静默不添加、不弹提示；业务异常用 `@select` 自己兜底。
- 超出 `maxSize` 的项不进入列表，逐项 emit `error`，同时内部 `showToast('文件大小不能超过 10MB')`（一次选择只弹一次）。
- 组件不调用原生 `input[type=file]`：`van-uploader` 只作为容器与样式底座（`preview-image=false`、`readonly`）。

### 示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WaUpload, type UploadFileItem, type UploadPickContext, type UploadSource } from '@wapri/vant-pro'
import { chooseFile, takePhoto } from '@/utils/bridge'

const files = ref<UploadFileItem[]>([])

const pick = async (source: UploadSource, context: UploadPickContext) => {
  if (source.key === 'camera') return takePhoto()
  if (source.key === 'library') return takePhoto({ fromAlbum: true })
  return chooseFile({ accept: context.accept })
}

const onPreview = (item: UploadFileItem) => {
  if (item.url) window.open(item.url)
}
</script>

<template>
  <WaUpload
    v-model="files"
    :pick="pick"
    @preview="onPreview"
    @retry="(item) => console.log('retry', item)"
  />
</template>
```

## WaTabbar

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | 必填 | 当前 key |
| `items` | `TabbarItem[]` | 必填 | `{ key, title, icon?, activeIcon?, badge?, dot? }` |
| `fixed` | `boolean` | `true` | 透传 `van-tabbar` |
| `safeAreaInsetBottom` | `boolean` | `true` | 透传 |
| `placeholder` | `boolean` | `false` | 透传 |
| `border` | `boolean` | `true` | 透传 |
| `activeColor` | `string` | — | 选中色 |
| `inactiveColor` | `string` | — | 未选中色 |
| `zIndex` | `number \| string` | — | 层级 |

### Emits / Slots

| 事件 | 参数 |
| --- | --- |
| `update:modelValue` | `(key: string)` |
| `change` | `(item: TabbarItem)` |

- `#icon="{ item, active }"` 覆盖图标渲染，默认用 `van-icon`（`active && item.activeIcon` 时优先用 `activeIcon`）。
- `route` 固定关闭，跳转由父组件在 `change` 里处理。

```vue
<WaTabbar v-model="activeKey" :items="menus" @change="(item) => router.push(item.key)" />
```

## WaFilterBar

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `FilterBarModel` | `{}` | 已提交的筛选值 |
| `fields` | `FilterField[]` | 必填 | 字段定义（见下） |
| `inlineKeys` | `string[]` | — | 兜底的触发器名单：命中的字段在筛选条上显示「值 ▾」；字段上的 `inline` 优先 |
| `expandText` | `string` | `'筛选'` | 触发按钮与面板标题 |
| `confirmText` | `string` | `'确定'` | 面板确认 |
| `resetText` | `string` | `'重置'` | 面板重置 |
| `showReset` | `boolean` | `true` | 是否显示重置 |
| `showSummary` | `boolean` | `false` | 是否展示已选条件胶囊（手机上默认不展示） |
| `collapsible` | `boolean` | `true` | 摘要超过 1 条时可收起 |
| `autoConfirm` | `boolean` | `false` | 是否在每次改动后立即同步 `v-model`；字段下拉里的单选始终即时提交 |

### Emits

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `update:modelValue` | `(value: FilterBarModel)` | 提交后（确定 / 重置 / 删摘要 / `autoConfirm` 下的内联改动） |
| `change` | `(value: FilterBarModel, key?: string)` | **任何**控件改动，携带最新草稿与变更字段 |
| `confirm` | `(value: FilterBarModel)` | 点「确定」 |
| `reset` | `()` | 点「重置」 |

### 字段定义（discriminated union）

公共字段：`key`、`label`、`inline?`（`true` 时在筛选条上显示「字段 ▾」触发器，点开改值）。

| `type` | 额外字段 | 值结构 |
| --- | --- | --- |
| `'tag'` | `multiple?`、`options: FilterOption[]`、`placeholder?` | `string \| string[]` |
| `'range'` | `min?`、`max?`、`unit?`、`precision?`、`placeholder?: [string, string]` | `{ min?: number; max?: number }` |
| `'date'` | `dateType?: 'date' \| 'datetime' \| 'month'`、`shortcuts?: DateShortcut[]`、`placeholder?` | `{ start: string; end: string; shortcut?: string }` |
| `'select'` | `options: FilterOption[]`、`multiple?`、`placeholder?` | `string \| string[]` |

```ts
interface FilterOption {
  label: string
  value: string
  disabled?: boolean
}

/** 点击时求值：跨天不刷新页面也能拿到相对当前时间的区间 */
interface DateShortcut {
  name: string
  range: () => [string, string]
}
```

`FilterBarModel = Record<string, FilterValue | undefined>`，空值（空串、空数组、只有一端的区间）不会进 `v-model`。

### 行为约定

- 每个字段都是一个 `WaFilter*` 控件，统一挂在 `WaFilterBar` 的 `van-form` 上；选项、价格、日期与下拉共用一套字段样式。
- 点字段触发器弹出窄下拉（选项列表 400rpx，价格 / 日期 640rpx），贴着触发器对齐；单选点完立即提交并收起，多选 / 价格 / 日期带确认按钮。点「筛选」才展开全字段面板。
- 全字段面板贴在筛选条下方，标题与底部按钮固定、只有字段区滚动；不铺遮罩，只在面板底部留一层渐隐投影。
- 日期快捷项内置「今日 / 昨日 / 近7天 / 近30天」（四个等宽按钮），计算结果是 `YYYY-MM-DD`；`shortcuts: []` 表示不要快捷项。
- 日期控件点开是 `van-date-picker` 年月日滚轮（`month` 类型只选年月）；`datetime` 字段的结束值统一补到 `23:59:59`，避免漏掉当天。
- 摘要默认关闭；开启后只统计已提交条件，多选显示为「首个标签 +N」，日期优先显示快捷项名称。
- `autoConfirm: false`（默认）：全字段面板的改动只更新草稿并 emit `change`，`v-model` 在「确定 / 重置」时才同步；`autoConfirm: true`：每次改动立即同步 `v-model`。**面板收起时未确认的修改一律丢弃。**

### 示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { WaFilterBar, type FilterBarModel, type FilterField } from '@wapri/vant-pro'

const model = reactive<FilterBarModel>({})
const reload = (value: FilterBarModel) => console.log('query', value)

const fields: FilterField[] = [
  { type: 'tag', key: 'status', label: '状态', multiple: true, options: [
    { label: '在售', value: 'on' },
    { label: '已下架', value: 'off' },
  ] },
  { type: 'range', key: 'price', label: '价格', min: 0, unit: '元', precision: 2 },
  { type: 'date', key: 'createdAt', label: '创建时间', dateType: 'date' },
  { type: 'select', key: 'category', label: '分类', options: [{ label: '水果', value: 'fruit' }] },
  { type: 'tag', key: 'stock', label: '库存', inline: true, options: [{ label: '缺货', value: 'empty' }] },
]
</script>

<template>
  <!-- change 每次改动都会触发（含草稿），用它刷新列表；确定/重置也都会再触发一次 -->
  <WaFilterBar
    v-model="model"
    :fields="fields"
    auto-confirm
    @change="(value) => reload(value)"
  />
</template>
```

### 子控件

`WaFilterTag` / `WaFilterRange` / `WaFilterDate` / `WaFilterSelect` 也对外导出，可在自己的 `van-form` 里单独用：

```vue
<van-form :model="form">
  <WaFilterTag :field="tagField" :model-value="form.status" @update:model-value="(v) => (form.status = v)" />
</van-form>
```

每个控件都是 `field` + `modelValue` + `inline?` 三个 props，只 emit `update:modelValue`。

## WaEmpty

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | `string` | `'default'` | `van-empty` 内置名（`default` / `search` / `network` / `error`）或图片地址 |
| `description` | `string` | `''` | 为空时回落到 `module` 预设，再回落到「暂无数据」 |
| `module` | `'list' \| 'table' \| 'search' \| 'network' \| 'notice' \| 'error'` | — | 预设文案与图 |
| `size` | `number \| string` | — | 透传 `van-empty` 的 `image-size` |
| `showAction` | `boolean` | `false` | 是否显示按钮 |
| `actionText` | `string` | `'刷新'` | 按钮文案 |
| `loading` | `boolean` | `false` | 按钮 loading，期间不 emit |

### Emits / Slots

| 事件 | 参数 |
| --- | --- |
| `action` | `()` |

- 默认插槽：追加在描述下方的自定义内容（透传给 `van-empty` 的默认插槽）。
- `#footer`：按钮下方的页脚区域。

```vue
<WaEmpty module="search" show-action action-text="重新加载" @action="reload" />
```

## 文件结构

```
packages/vant-pro/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts                     # 具名导出 + components 数组 + install 插件
    types.ts                     # 跨组件通用类型
    styles/index.css             # 可选：公共变量与基础类
    components/
      upload/
        WaUpload.vue
        WaUploadItem.vue         # 内部：单个格子（缩略图/进度/删除）
        types.ts
        useUploadList.ts
        useUploadSources.ts
      tabbar/
        WaTabbar.vue
        types.ts
      filter-bar/
        WaFilterBar.vue
        WaFilterTag.vue
        WaFilterRange.vue
        WaFilterDate.vue
        WaFilterSelect.vue
        WaFilterSummary.vue      # 内部：已选条件摘要
        types.ts
        date.ts
        useFilterModel.ts
        useFilterControls.ts
      empty/
        WaEmpty.vue
        types.ts
```

`WaUploadItem` / `WaFilterSummary` 是纯展示的内部组件，不在入口导出。

## 宿主接入要点

1. `vant` 必须由宿主提供，并在入口 `import 'vant/lib/index.css'`（`WaUpload` 的 `showToast`、`WaShareSheet` 等都需要 Vant 的样式与组件注册）。
2. 组件库源码在工作区外时，Vite 需要两条别名，否则 `vant` 会去组件库所在仓库找：

```ts
resolve: {
  alias: {
    '@wapri/vant-pro': 'D:/kaimai/code/wapri/packages/vant-pro/src',
    vant: fileURLToPath(new URL('./node_modules/vant', import.meta.url)),
  },
  dedupe: ['vue', 'vant', '@vant/use'],
},
```

3. `tsconfig` 的 `paths` 同步这两条映射，`vue-tsc` 才能解析组件库源码里的 `vant` 类型。
4. 构建目标较低（如 `safari12` / `chrome74`）时不需要额外 polyfill：组件只用到 `Object.entries`、`padStart`、`Number.isFinite` 等 ES2017 能力。

## 开发与校验

文档站里移动端 demo 用 `iframe` 固定 375 宽预览，宽度与外壳由 `.dumirc.ts` 的 `styles` 控制，md 里只写高度：

```md
<code src="./demo/basic.vue" iframe="640" title="基础用法"></code>
```

demo 文档的根字号由 `.dumirc.ts` 的 `headScripts` 按视口设置，`rpx` 样式在 iframe 内按 375 宽度还原成设计稿尺寸。

```bash
# 在 wapri 仓库根目录
pnpm lint                                   # oxlint（含 vue 规则集）
node_modules/.bin/oxfmt packages/vant-pro    # 格式化
```

`vue-tsc` 校验需要仓库里能解析 `vant` 类型；本包只声明 peerDependency，在 wapri 仓库内单独跑类型检查前，先让工作区能解析到 `vant`（宿主工程或根依赖均可）。
