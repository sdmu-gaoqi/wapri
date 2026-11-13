---
title: FileList 文件列表
group:
  title: 组件
  order: 2
---

# FileList 文件列表

数据驱动的文件卡片网格：传入 `FileListItem[]` 即可渲染缩略图与名称，内置图片 / 视频 / 文档预览、删除与拖动排序。

与 [FileModal](/element-pros/file-modal)（从素材库选择）和 [CropperUpload](/element-pros/cropper-upload)（上传裁剪）不同，`FileList` 只负责展示，不查询数据、不负责上传，业务只需要维护一份数组。

<code src="./demo/basic.vue" title="基础用法"></code>

## 数据与回写

组件接收 `data`，删除与排序后抛出 `update:data`，配合 `v-model:data` 即可自动回写：

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { FileList, type FileListItem } from '@wapri/element-pro'

const data = ref<FileListItem[]>([
  { name: '合同.pdf', abbreviateUrl: '/thumb/contract.png', previewUrl: '/files/contract.pdf' },
])
</script>

<template>
  <FileList v-model:data="data" @remove="onRemove" @sort="onSort" />
</template>
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 文件名称，展示在缩略图下方 |
| `abbreviateUrl` | `string` | 缩略图地址 |
| `previewUrl` | `string` | 预览地址，图片、视频、文档都取这个地址 |
| 其余字段 | `unknown` | 通过索引签名透传，删除 / 排序后原样保留 |

组件不修改传入的数组对象：删除和排序都会生成新数组，业务可以在 `remove` / `sort` 里做持久化。

## 预览分流

点击卡片或预览按钮时按媒体类型选择查看器：

| 类型 | 判断依据 | 预览方式 |
| --- | --- | --- |
| 图片 | MIME 或扩展名 | `ElImageViewer`，只在图片项之间左右切换 |
| 视频 | MIME 或扩展名 | `ElDialog` + `<video controls autoplay>` |
| 其他 | 兜底 | `ElDialog` + [`@wapri/preview`](/previews) |

媒体类型优先看 `type` / `mime` / `mimeType` / `contentType` / `fileType`，再看 `previewUrl` / `abbreviateUrl` / `name` 的扩展名，`data:` 地址直接看前缀。

文档预览按需动态加载 `@wapri/preview`，不使用文档预览时不会打进首屏包体。PDF 需要业务自己配置 pdf.js worker：

```ts
import { configurePdfjs } from '@wapri/preview'

configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })
```

预览失败时弹窗内展示错误提示，并抛出 `error` 事件。

## 只读与操作

- `previewable` 为 `false` 时不响应点击，也不显示预览按钮。
- `removable` 为 `false` 时不显示删除按钮。
- `sortable` 为 `false` 时不注册拖拽。
- `disabled` 为 `true` 时禁用删除与拖拽，但仍可预览。

拖动排序基于 [@vue-dnd-kit/core](https://www.npmjs.com/package/@vue-dnd-kit/core)，需要 `vue >= 3.5`；拖到列表外释放会取消本次排序。

开启拖拽时，卡片的键盘操作交给拖拽库：聚焦卡片后空格 / 回车拾取，方向键移动，再按空格 / 回车放下，Esc 取消；预览与删除用卡片内的按钮。关闭拖拽后卡片可用空格 / 回车打开预览。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `FileListItem[]` | `[]` | 文件列表，支持 `v-model:data` |
| `columns` | `number` | `4` | 每行列数，窄屏（≤640px）自动降为 2 列 |
| `sortable` | `boolean` | `true` | 是否支持拖动排序 |
| `removable` | `boolean` | `true` | 是否显示删除按钮 |
| `previewable` | `boolean` | `true` | 是否支持点击预览 |
| `disabled` | `boolean` | `false` | 禁用删除与排序 |
| `emptyText` | `string` | `'暂无文件'` | 空列表文案 |
| `rowKey` | `string \| ((item, index) => Key)` | - | 卡片 key，默认取 `id`，没有时用名称与缩略图地址组合 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:data` | `FileListItem[]` | 删除或排序后的新数组 |
| `preview` | `item, index, mediaType` | 打开预览 |
| `remove` | `item, index` | 删除某一项 |
| `sort` | `data, oldIndex, newIndex` | 拖动排序完成 |
| `error` | `Error` | 文档预览失败 |

## Expose

| 方法 | 说明 |
| --- | --- |
| `preview(index)` | 打开指定项的预览 |
| `closePreview()` | 关闭当前预览 |
| `getData()` | 获取当前渲染顺序的副本 |

## 类型

```ts
interface FileListItem {
  name: string
  abbreviateUrl: string
  previewUrl: string
  [key: string]: unknown
}

type FileMediaType = 'image' | 'video' | 'other'
```
