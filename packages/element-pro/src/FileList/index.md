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

<code src="./demo/upload-crop.vue" title="指定卡片宽度 + 上传裁剪"></code>

`width` 用来固定卡片宽度、按容器宽度自动换行；`append` 插槽渲染在网格末尾，适合放「上传」这类追加单元格。示例把 [CropperUpload](/element-pros/cropper-upload) 放进插槽，选中图片先裁剪、确认后再写入 `FileList` 的数据。

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
| `name` | `string` | 文件名称，以黑底半透明白字叠在缩略图底部，长名称省略 |
| `abbreviateUrl` | `string` | 缩略图地址，可选；视频卡片用作封面帧 |
| `previewUrl` | `string` | 预览地址，图片、视频、文档都取这个地址 |
| 其余字段 | `unknown` | 通过索引签名透传，删除 / 排序后原样保留 |

`abbreviateUrl` 可以不传：文档项按 `name` / `previewUrl` / `url` 的扩展名或 MIME 展示对应的 PDF / XLSX / DOCX / PPTX 图标，图标里带扩展名短文案；图片项缺失时退回 `previewUrl`，视频项直接播 `previewUrl` 首帧。

组件不修改传入的数组对象：删除和排序都会生成新数组，业务可以在 `remove` / `sort` 里做持久化。

## 卡片展示

- 名称固定叠在缩略图底部：黑底半透明白字，单行省略，不拦截卡片点击。
- 操作按钮（预览 / 删除）排在缩略图右上角，hover 或聚焦时显示；触屏设备常驻显示。
- 视频卡片播放 `previewUrl` 的首帧，`abbreviateUrl` 只作为 `poster` 封面。
- 没有可用缩略图时展示类型占位图标：PDF 红、Excel 绿、Word 蓝、PPT 橙，图标里带扩展名短文案。

## 预览分流

点击卡片或预览按钮时按媒体类型选择查看器：

| 类型 | 判断依据 | 预览方式 |
| --- | --- | --- |
| 图片 | MIME 或扩展名 | `ElImageViewer`，只在图片项之间左右切换 |
| 视频 | MIME 或扩展名 | `ElDialog` + [`@wapri/gplayer`](/players) 的 `VideoPlayer` |
| 其他 | 兜底 | `ElDialog` + [`@wapri/preview`](/previews) |

媒体类型优先看 `type` / `mime` / `mimeType` / `contentType` / `fileType`，再看 `previewUrl` / `abbreviateUrl` / `name` 的扩展名，`data:` 地址直接看前缀。

卡片里的视频不会用 `<img>`：识别为视频时改用 `<video preload="metadata">` 播放 `previewUrl` 的首帧，`abbreviateUrl` 作为 `poster` 封面；首帧加载失败退回封面图，封面也失败再降级为文件图标。

## 视频预览

视频弹窗用的是 [`@wapri/gplayer`](/players) 的 `VideoPlayer`，地址取 `previewUrl`、`abbreviateUrl` 作为封面、打开即播。默认启用五个插件（播放器右侧设置菜单里各占一项）：

| key | 右侧菜单 | 行为 |
| --- | --- | --- |
| `playbackRate` | 播放速度 | 选择语速 |
| `aspectRatio` | 画面比例 | 选择比例 |
| `filter` | 画面调节 | 亮度 / 对比度 / 饱和度 |
| `flip` | 画面翻转 | 水平 / 垂直翻转 |
| `pip` | 画中画 | 开关画中画 |

`videoPlugins` 原样透传给播放器的 `plugins`，写法与播放器一致（字符串 / `{ key, setting }` / `pluginEntry`）：

```vue | pure
<template>
  <!-- 只保留截图，并改文件名前缀 -->
  <FileList
    v-model:data="data"
    :video-plugins="[{ key: 'screenshot', setting: () => ({ filename: 'cover' }) }]"
  />
</template>
```

传 `[]` 即关掉全部插件，回到只有控制条的状态。插件能力见 [player 文档](/players)。

文档预览按需动态加载 `@wapri/preview`，不使用文档预览时不会打进首屏包体。PDF 需要业务自己配置 pdf.js worker：

```ts
import { configurePdfjs } from '@wapri/preview'

configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })
```

预览失败时弹窗内展示错误提示，并抛出 `error` 事件。

## 布局

默认按 `columns` 固定列数排列，窄屏（≤640px）自动降为 2 列。需要固定卡片大小时改传 `width`：

```vue | pure
<template>
  <!-- 每张卡片 120px 宽，一行能放几张由容器宽度决定 -->
  <FileList v-model:data="data" :width="120" />
</template>
```

- `width` 支持数字（按 `px`）与字符串（`8rem`、`30%`）。
- 设置 `width` 后 `columns` 失效，窄屏也不再强制两列；容器比卡片还窄时卡片会收缩到容器宽度，不会横向溢出。

## 只读与操作

- `previewable` 为 `false` 时不响应点击，也不显示预览按钮。
- `removable` 为 `false` 时不显示删除按钮。
- `sortable` 为 `false` 时不注册拖拽。
- `disabled` 为 `true` 时禁用删除与拖拽，但仍可预览。

拖动排序基于 [@vue-dnd-kit/core](https://www.npmjs.com/package/@vue-dnd-kit/core)，需要 `vue >= 3.5`；拖到列表外释放会取消本次排序。

开启拖拽时，卡片的键盘操作交给拖拽库：聚焦卡片后空格 / 回车拾取，方向键移动，再按空格 / 回车放下，Esc 取消；预览与删除用卡片内的按钮。关闭拖拽后卡片可用空格 / 回车打开预览。

## Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `append` | `{ data, count }` | 网格末尾的追加单元格，占一个卡片位；常放上传入口。有该插槽时空列表不展示 `emptyText` |

`append` 里的上传入口拿到的是裁剪 / 上传后的文件，业务把它转成 `FileListItem` 后写回 `v-model:data` 即可；`count` 可用于限制数量。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `FileListItem[]` | `[]` | 文件列表，支持 `v-model:data` |
| `columns` | `number` | `4` | 每行列数，窄屏（≤640px）自动降为 2 列 |
| `width` | `number \| string` | - | 卡片固定宽度，数字按 `px`；设置后按宽度自动换行，`columns` 失效 |
| `sortable` | `boolean` | `true` | 是否支持拖动排序 |
| `removable` | `boolean` | `true` | 是否显示删除按钮 |
| `previewable` | `boolean` | `true` | 是否支持点击预览 |
| `disabled` | `boolean` | `false` | 禁用删除与排序 |
| `emptyText` | `string` | `'暂无文件'` | 空列表文案 |
| `rowKey` | `string \| ((item, index) => Key)` | - | 卡片 key，默认取 `id`，没有时用名称与缩略图地址组合 |
| `videoPlugins` | `PluginInput[]` | 倍速 / 比例 / 调节 / 翻转 / 画中画 | 视频预览启用的播放器插件，透传给 `VideoPlayer` |

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
  abbreviateUrl?: string
  previewUrl: string
  [key: string]: unknown
}

type FileMediaType = 'image' | 'video' | 'other'
```
