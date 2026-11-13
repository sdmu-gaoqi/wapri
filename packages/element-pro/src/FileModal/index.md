---
title: FileModal 素材选择
group:
  title: 组件
  order: 2
---

# FileModal 素材选择

素材选择弹窗：左侧分类、右侧素材区，素材区支持**宫格**与**表格**两种视图，内置搜索、排序、分页、分类的添加 / 编辑 / 删除与裁剪上传。

列表部分复用 [ProTable](/element-pros/pro-table) 的列表模式与表格模式，因此 `request` 的签名、分页参数、`RequestResult` 结构与 ProTable **完全一致**。

<code src="./demo/basic.vue" title="基础用法"></code>

<code src="./demo/action.vue" title="action 插槽触发"></code>

## 触发入口

默认由业务自己维护开关：

```vue | pure
<ElButton @click="open = true">选择素材</ElButton>
<FileModal v-model:open="open" :request="request" />
```

传入 `action` 插槽后，开关改由组件内部维护，点击插槽内容即可打开：

```vue | pure
<FileModal :request="request" @confirm="onConfirm">
  <template #action="{ visible }">
    <ElButton type="primary">{{ visible ? '选择中…' : '选择素材' }}</ElButton>
  </template>
</FileModal>
```

- 插槽参数提供 `open()` 与 `visible`，按钮文案等可以随 `visible` 联动。
- 点击 action 容器内任意位置都会打开弹窗；插槽内的按钮若已有自己的点击逻辑、不想触发打开，加 `.stop` 即可。
- 依然会派发 `update:open`，需要同时受控时照常绑定 `v-model:open`。

## 对外 API

组件对外只暴露两个数据侧概念：`request` 与 `columns`（宫格一行几列）。分类与上传通过独立 prop 注入，未传对应能力时相关入口自动隐藏。

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { FileModal, addGroupToTree, removeGroupFromTree } from '@wapri/element-pro'
import type { FileModalAsset, FileModalGroup, FileModalQuery } from '@wapri/element-pro'

const open = ref(false)
const selected = ref<Array<string | number>>([])
const groups = ref<FileModalGroup[]>([])

const request = async (params: FileModalQuery & { current: number; pageSize: number }) => {
  // params: current / pageSize / keyword / sortBy / groupId
  return { data: [], total: 0 }
}

// 上级分类由 payload.parentId 带回，挂到树上用组件导出的工具函数即可
const createGroup = async (payload: {
  name: string
  color: string
  parentId?: string
}): Promise<FileModalGroup> => {
  const group: FileModalGroup = { id: 'g-1', name: payload.name, color: payload.color }
  groups.value = addGroupToTree(groups.value, group, payload.parentId)
  return group
}

const updateGroup = async (
  group: FileModalGroup,
  payload: { name: string; color: string; parentId?: string },
) => {
  // 改名 / 改上级接口由业务自己调用，返回更新后的分类
  const next = { ...group, name: payload.name, color: payload.color }
  groups.value = addGroupToTree(removeGroupFromTree(groups.value, group.id), next, payload.parentId)
  return next
}

const removeGroup = async (group: FileModalGroup) => {
  // 删除接口由业务自己调用，组件只做二次确认与成功后移出列表
  groups.value = removeGroupFromTree(groups.value, group.id)
}

const upload = async (file: File, context: { groupId?: string }): Promise<FileModalAsset> => {
  return { id: 'a-1', name: file.name, url: URL.createObjectURL(file), groupId: context.groupId }
}
</script>

<template>
  <FileModal
    v-model:open="open"
    v-model:selected="selected"
    :request="request"
    :groups="groups"
    :columns="6"
    :modes="['list', 'table']"
    :create-group="createGroup"
    :update-group="updateGroup"
    :remove-group="removeGroup"
    :upload="upload"
  />
</template>
```

## request 参数

`request` 直接交给内部 ProTable，第一参数在 `current`、`pageSize` 之外还会带上三个业务字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `keyword` | `string \| undefined` | 搜索框关键词，输入后 300ms 防抖生效 |
| `sortBy` | `'latest' \| 'name' \| 'size'` | 排序方式，默认 `latest` |
| `groupId` | `string \| undefined` | 当前分组 id，选中「全部」时不传 |

返回结构与 ProTable 相同：`{ data, total?, success? }`。

请求会串行执行（`useLockFn` + 队列），搜索连续变化时不会并发重复调用；请求期间弹窗带 loading 遮罩，关闭按钮与底部按钮不可点。

## 宫格 / 表格切换

`modes` 决定有哪些视图，第一项为默认视图：

- `list`：宫格卡片，列数由 `columns` 控制，每张卡片带预览入口。
- `table`：表格，列为图片名称（含缩略图）、大小、上传时间、操作（预览）。

两个视图共用同一份请求与分页，切换视图**不会重新请求**；切换按钮就是 ProTable 内置的那一组（搜索/排序下方、右对齐），只在 `modes` 多于一项时出现。

```vue | pure
<!-- 只要宫格 -->
<FileModal :request="request" :modes="['list']" />

<!-- 默认宫格，可切到表格 -->
<FileModal :request="request" :modes="['list', 'table']" />
```

多选（`multiple`）时表格模式使用勾选列，带全选表头；单选时整行可点，选中行高亮，不出现复选框。

## 裁剪比例

**默认不裁剪**：`cropperRatios` 为空数组（不传），选完图片直接上传原图。

传入比例后才打开裁剪弹窗。`0` 表示「自定义」——按**图片自身宽高**等比裁剪，不做任何强制变形。

<code src="./demo/ratio.vue" title="不裁剪与限制裁剪范围"></code>

```vue | pure
<!-- 不裁剪（默认），选完直接上传 -->
<FileModal />

<!-- 只允许 9:16 -->
<FileModal :cropper-ratios="[9 / 16]" />

<!-- 允许 9:16 与 16:9，并自定义按钮文案 -->
<FileModal :cropper-ratios="[9 / 16, 16 / 9]" :cropper-ratio-labels="['竖版', '横版']" />

<!-- 自定义（原图比例）与 1:1 并存 -->
<FileModal :cropper-ratios="[0, 1]" :cropper-ratio-labels="['原图比例', '正方形']" />
```

## 预览

卡片与 [FileList](/element-pros/file-list) 共用同一套缩略图卡片：名称以黑底半透明白字叠在缩略图底部，选中时左上角出现白底主色勾选角标、卡片带主题色边框与浅色蒙层，预览按钮在右上角。点击预览按钮后由**组件自己**展示预览：图片用 `ElImageViewer`，视频用弹窗内的 `<video>`。表格视图的预览入口在「操作」列。业务不需要自己实现预览。

素材上两个地址字段分工明确：

| 字段 | 用途 |
| --- | --- |
| `abbreviateUrl` | 卡片里的预览图，图片与视频都用它（视频填封面帧）；图片未传时退回 `url` |
| `previewUrl` | 点击预览时展示的地址；未传时退回 `url` |

组件不会自己解析视频首帧：视频卡片用 `<video preload="metadata">` 拉取首帧，`abbreviateUrl` 作为 `poster` 兜底；接口能给出封面帧时优先填 `abbreviateUrl`。

类型判断优先信任 MIME（`type` / `mime` / `mimeType` / `contentType` / `fileType`），拿不到时按 `url` / `previewUrl` / `abbreviateUrl` / `name` 的扩展名兜底，`data:` 开头的地址直接看前缀。

**预览按钮的显隐只看有没有预览地址**（`previewUrl || url`），不依赖类型识别结果；类型只决定用哪种查看器：识别为视频走播放器，其余一律按图片查看。这样接口字段命名不统一或地址没有扩展名时，按钮也不会消失。

```ts
import { getAssetMediaType, isAssetPreviewable, getAssetPreviewUrl } from '@wapri/element-pro'

getAssetMediaType(asset) // 'image' | 'video' | 'other'
isAssetPreviewable(asset) // 是否属于图片/视频
getAssetPreviewUrl(asset) // previewUrl || url
```

```vue | pure
<FileModal :request="request" />
```

## 一组关键的交互约定

- **分类的更多操作**：每条分类 hover 时名称右侧出现「⋯」，点开是下拉菜单：`添加分类` / `编辑分类` / `删除分类`，菜单项按传入的能力自动隐藏。左侧底部的「添加分类」按钮与菜单里的入口是同一套流程。hover 时底色覆盖整行（名称 + 「⋯」），两者是同一个可点区域。
- **分类层级**：`FileModalGroup.children` 表达上下级，没有 `children` 的即叶子分类。左侧列表按这棵树展开，子分类缩进展示。业务自己维护这棵树时可以直接用组件导出的 `addGroupToTree` / `removeGroupFromTree`（见基础用法的 `createGroup`）。
- **最多三级**：三级分类不再出现在「上级分类」的候选里，行内菜单的「添加分类」在三级分类上置灰，也就是三级分类下不能再新建。
- **添加 / 编辑分类**：`createGroup` / `updateGroup`，弹窗表单只有「上级分类」与「分类名称」（最多 10 个字）。从某一行的「添加分类」进入时会把该分类预填为上级，底部按钮进入则创建一级分类；编辑时回填当前层级，且候选项已隐去自身与子孙，不会出现把自己挂到自己下面。
- **删除分类**：`removeGroup`，删除逻辑完全由使用方实现（调接口、刷新自有分类数据）。点击先弹确认；删除中按钮转圈，成功后把该分类（连同子分类）从左侧移出；删掉的若是当前选中分类，会自动切回「全部」并重新请求列表。
- **上传**：裁剪确认后调用 `upload(file, { groupId })`，返回的素材会**自动选中**并刷新到第一页，同时带上当前分类 id。`accept` 为 `video/*` 等非图片类型时不做裁剪，选完文件直接调 `upload`。
- **多选**：`multiple` 为 `false`（默认）时点击即替换选中；为 `true` 时点击切换。
- **确认**：`confirm` 回传完整的素材记录（不是 id）。组件内部按 id 缓存已加载过的素材，因此跨页选择也能拿到完整对象。
- **选中态**：`v-model:selected` 收的是 id 数组，与 `confirm` 返回的记录一一对应。
- **关闭即取消**：点击右上角或遮罩外关闭，等同于点击「取消」，会触发 `cancel`。
- **弹窗高度**：整体最高 `80vh`，超出后不再撑高弹窗；左侧分类区与右侧内容区**各自滚动**，标题、搜索 / 排序工具栏与底部分页始终可见。
- **销毁**：弹窗关闭后内容整体销毁，下次打开重新拉取数据。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | 弹窗开关，配合 `v-model:open`；使用 `action` 插槽时可省略 |
| `request` | `RequestFn<T, FileModalQuery>` | - | **必填**，与 ProTable 同签名 |
| `columns` | `number` | `6` | 宫格一行几列 |
| `modes` | `Array<'list' \| 'table'>` | `['list', 'table']` | 可用视图，第一项为默认；只有一项时不显示切换按钮 |
| `groups` | `FileModalGroup[]` | `[]` | 分类数据 |
| `createGroup` | `(payload) => Promise<FileModalGroup>` | - | 添加分类；不传时隐藏相关入口 |
| `updateGroup` | `(group, payload) => Promise<FileModalGroup> \| FileModalGroup` | - | 编辑分类；不传时菜单里不展示「编辑分类」 |
| `removeGroup` | `(group) => Promise<void> \| void` | - | 删除分类；不传时菜单里不展示「删除分类」 |
| `upload` | `(file, context) => Promise<T>` | - | 上传回调；不传时隐藏「上传素材」。图片按 `cropperRatios` 裁剪，其余类型直传 |
| `accept` | `string` | `'image/*'` | 文件选择框的类型限制，同时决定校验的大类：`image/*` 只收图片，`video/*` 只收视频并跳过裁剪 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `selected` | `Key[]` | - | 已选 id，配合 `v-model:selected` |
| `title` | `string` | `'选择素材'` | 弹窗标题 |
| `confirmText` | `string` | `'确定'` | 确认按钮文案 |
| `cancelText` | `string` | `'取消'` | 取消按钮文案 |
| `uploadText` | `string` | `'上传素材'` | 上传按钮文案 |
| `addGroupText` | `string` | `'添加分类'` | 添加分类的按钮与菜单文案 |
| `editGroupText` | `string` | `'编辑分类'` | 编辑分类的菜单文案，同时作为输入弹窗标题 |
| `removeGroupText` | `string` | `'删除分类'` | 删除分类的菜单文案，同时作为确认弹窗标题 |
| `removeGroupConfirmText` | `string` | `'确定删除该分类吗？分类下的素材不会被删除。'` | 删除分类的确认提示 |
| `emptyText` | `string` | `'暂无素材'` | 空数据文案 |
| `cropperRatios` | `number[]` | `[]` | 可选裁剪比例；空数组表示不裁剪，`0` 为「按图片原比例」 |
| `cropperRatioLabels` | `string[]` | `[]` | 比例按钮文案，缺省项自动生成 |
| `cropperTitle` | `string` | `'裁剪图片'` | 裁剪弹窗标题 |
| `modalProps` | `Partial<DialogProps>` | - | 透传给 `ElDialog` |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:open` | `boolean` | 弹窗开关变化 |
| `update:selected` | `Key[]` | 选中 id 变化 |
| `confirm` | `T[]` | 点击确定，回传选中的素材记录 |
| `cancel` | - | 取消或关闭弹窗 |
| `groupChange` | `string \| undefined` | 切换分类 |
| `groupCreated` | `FileModalGroup, parentId?` | 添加分类成功，`parentId` 是它挂在哪一级分类下 |
| `groupUpdated` | `FileModalGroup, parentId?` | 编辑分类成功，`parentId` 是变更后的上级分类 |
| `groupRemoved` | `FileModalGroup` | 删除分类成功 |
| `uploaded` | `T` | 上传成功 |
| `uploadError` | `Error` | 上传失败 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `action` | `{ open, visible }` | 触发入口；传入后点击打开弹窗，不传时由 `v-model:open` 控制 |

## 类型

```ts
interface FileModalAsset {
  id: string | number
  name: string
  url: string
  /** 卡片里展示的预览图，图片与视频都用它；未传时退回 url */
  abbreviateUrl?: string
  /** 点击预览时展示的地址；未传时退回 url */
  previewUrl?: string
  size?: number
  createdAt?: string | number
  groupId?: string
  [key: string]: unknown
}

interface FileModalGroup {
  id: string
  name: string
  color?: string
  /** 子分类，层级结构由它表达 */
  children?: FileModalGroup[]
  [key: string]: unknown
}

interface FileModalGroupPayload {
  name: string
  color: string
  /** 上级分类 id，未传即一级分类 */
  parentId?: string
}

type FileModalCreateGroup = (payload: FileModalGroupPayload) => Promise<FileModalGroup>
type FileModalUpdateGroup = (
  group: FileModalGroup,
  payload: FileModalGroupPayload,
) => Promise<FileModalGroup> | FileModalGroup
type FileModalRemoveGroup = (group: FileModalGroup) => Promise<void> | void
```

素材记录可自由扩展字段（`[key: string]: unknown`），组件只读取上面声明的这些。
