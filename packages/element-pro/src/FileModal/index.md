---
title: FileModal 素材选择
group:
  title: 组件
  order: 2
---

# FileModal 素材选择

素材选择弹窗：左侧分组、右侧素材网格，内置搜索、排序、分页、新建分组与裁剪上传。

列表部分复用 [ProTable](/element-pros/pro-table) 的列表模式（`modes: ['list']`），因此 `request` 的签名、分页参数、`RequestResult` 结构与 ProTable **完全一致**。

<code src="./demo/basic.vue" title="基础用法"></code>

## 对外 API

组件对外只暴露两个数据侧概念：`request` 与 `columns`（一行几列）。分组与上传通过独立 prop 注入，未传对应能力时相关按钮自动隐藏。

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { FileModal } from '@wapri/element-pro'
import type { FileModalAsset, FileModalGroup, FileModalQuery } from '@wapri/element-pro'

const open = ref(false)
const selected = ref<Array<string | number>>([])

const request = async (params: FileModalQuery & { current: number; pageSize: number }) => {
  // params: current / pageSize / keyword / sortBy / groupId
  return { data: [], total: 0 }
}

const createGroup = async (payload: { name: string; color: string }): Promise<FileModalGroup> => {
  return { id: 'g-1', name: payload.name, color: payload.color }
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
    :create-group="createGroup"
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

每张图片 / 视频卡片右下角有一个预览按钮，点击后由**组件自己**展示预览：图片用 `ElImageViewer`，视频用弹窗内的 `<video>`。业务不需要自己实现预览。

素材上两个地址字段分工明确：

| 字段 | 用途 |
| --- | --- |
| `abbreviateUrl` | 卡片里的预览图，图片与视频都用它（视频填封面帧）；未传时退回 `url` |
| `previewUrl` | 点击预览时展示的地址；未传时退回 `url` |

组件不会自己解析视频首帧：视频卡片用 `<video preload="metadata">` 拉取首帧，`abbreviateUrl` 作为 `poster` 兜底；接口能给出封面帧时优先填 `abbreviateUrl`。

类型判断优先信任 `asset.type`（MIME），拿不到时按 `url` / `name` 的扩展名兜底；只有图片与视频展示预览按钮，其它类型不渲染入口。

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

- **新建分组**：`createGroup` 返回的记录会插入左侧分组列表，并**自动切换到该分组**。
- **上传**：裁剪确认后调用 `upload(file, { groupId })`，返回的素材会**自动选中**并刷新到第一页，同时带上当前分组 id。
- **多选**：`multiple` 为 `false`（默认）时点击即替换选中；为 `true` 时点击切换。
- **确认**：`confirm` 回传完整的素材记录（不是 id）。组件内部按 id 缓存已加载过的素材，因此跨页选择也能拿到完整对象。
- **选中态**：`v-model:selected` 收的是 id 数组，与 `confirm` 返回的记录一一对应。
- **关闭即取消**：点击右上角或遮罩外关闭，等同于点击「取消」，会触发 `cancel`。
- **销毁**：弹窗关闭后内容整体销毁，下次打开重新拉取数据。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | 弹窗开关，配合 `v-model:open` |
| `request` | `RequestFn<T, FileModalQuery>` | - | **必填**，与 ProTable 同签名 |
| `columns` | `number` | `6` | 一行几列 |
| `groups` | `FileModalGroup[]` | `[]` | 分组数据 |
| `createGroup` | `(payload) => Promise<FileModalGroup>` | - | 新建分组；不传时隐藏「添加分组」 |
| `upload` | `(file, context) => Promise<T>` | - | 上传裁剪结果；不传时隐藏「上传素材」 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `selected` | `Key[]` | - | 已选 id，配合 `v-model:selected` |
| `title` | `string` | `'选择素材'` | 弹窗标题 |
| `confirmText` | `string` | `'确定'` | 确认按钮文案 |
| `cancelText` | `string` | `'取消'` | 取消按钮文案 |
| `uploadText` | `string` | `'上传素材'` | 上传按钮文案 |
| `addGroupText` | `string` | `'添加分组'` | 新建分组按钮文案 |
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
| `groupChange` | `string \| undefined` | 切换分组 |
| `groupCreated` | `FileModalGroup` | 新建分组成功 |
| `uploaded` | `T` | 上传成功 |
| `uploadError` | `Error` | 上传失败 |

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
  [key: string]: unknown
}
```

素材记录可自由扩展字段（`[key: string]: unknown`），组件只读取上面声明的这些。
