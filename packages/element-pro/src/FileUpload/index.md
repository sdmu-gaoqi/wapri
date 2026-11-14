---
title: FileUpload 上传面板
group:
  title: 组件
  order: 2
---

# FileUpload 上传面板

表单里的上传入口：标题 + 拖拽提示 + 按钮区，点一下、拖进来、键盘回车都能选文件。组件只负责拿到 `File[]`，上传请求与列表回写留给业务，方便接素材库、裁剪、批量上传等不同流程。

常与 [FileList](/element-pros/file-list) 搭配：把 `FileUpload` 放进 `append` 插槽当追加单元格（此时传 `width="100%"` 撑满单元格），拿到文件后上传、转成 `FileListItem` 写回 `v-model:data`。需要裁剪走 [CropperUpload](/element-pros/cropper-upload)，需要从素材库挑则把 [FileModal](/element-pros/file-modal) 的开弹窗动作挂到 `actions` 插槽上。

<code src="./demo/basic.vue" title="基础用法"></code>

`select` 抛出的是**过滤后**的文件：`accept` 既传给原生文件框，也用于过滤拖进来的文件，被拦下的通过 `reject` 抛出，业务可据此提示。`multiple` 为 `false` 时只保留第一个。

<code src="./demo/actions.vue" title="自定义按钮区"></code>

`actions` 插槽会替换自带的「直接上传」按钮，插槽参数里的 `open` 保留打开文件选择框的能力。放「打开素材库」这类按钮时，不需要自己拦冒泡——按钮区的点击不会触发面板的选文件。

## 宽度

默认宽度 240px，容器比它窄时跟随容器；放进表单或网格里需要撑满时传 `'100%'`：

```vue | pure
<template>
  <FileUpload width="100%" accept="image/*" />
</template>
```

## 上传中与禁用

```vue | pure
<template>
  <FileUpload
    accept="image/*"
    :loading="uploading"
    @select="upload"
  />
</template>
```

- `loading` 时图标换成旋转的 loading、标题文案换成 `loadingText`，面板与按钮都不再响应。
- `disabled` 时整体置灰并禁用交互，通常用于「已达上限」。
- 上传进度与失败提示由业务自己处理，组件不内置请求。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `accept` | `string` | - | 允许的文件类型，写法同原生 `input[type=file]`，拖入的文件同样按它过滤 |
| `width` | `number \| string` | `240` | 面板宽度，数字按 `px`；需要撑满容器时传 `'100%'` |
| `multiple` | `boolean` | `false` | 是否允许多选 |
| `disabled` | `boolean` | `false` | 禁用上传入口 |
| `loading` | `boolean` | `false` | 上传中，展示 loading 图标并禁用交互 |
| `title` | `string` | `'上传素材'` | 标题文案 |
| `loadingText` | `string` | `'上传中'` | 上传中的标题文案 |
| `tip` | `string` | `'拖拽文件到此处'` | 提示文案 |
| `showUploadButton` | `boolean` | `true` | 是否展示自带的「直接上传」按钮 |
| `uploadText` | `string` | `'直接上传'` | 自带按钮的文案 |
| `clickToPick` | `boolean` | `true` | 点击面板空白处是否打开文件选择框 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `File[]` | 选中或拖入的文件，已按 `accept` 过滤；`multiple` 为 `false` 时最多一个 |
| `reject` | `File[]` | 被 `accept` 过滤掉的文件 |

## Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `icon` | - | 自定义图标 |
| `actions` | `{ open }` | 按钮区；提供后替换自带的「直接上传」按钮，`open` 可直接打开文件选择框 |

## Expose

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开文件选择框 |

## 类型

```ts
interface FileUploadActionSlotProps {
  open: () => void
}
```
