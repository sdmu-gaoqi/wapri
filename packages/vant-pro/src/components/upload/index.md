---
title: WaUpload 上传
group:
  title: 表单
  order: 1
---

# WaUpload 上传

上传入口 + 缩略图网格。组件不碰任何上传接口，也不渲染原生 `input[type=file]`：点「+」先弹 `van-share-sheet` 动作面板，选中来源后把 `source` 和上下文交给父组件注入的 `pick`，`await` 到的结果合并进列表。

<code src="./demo/basic.vue" iframe="640" title="基础用法：pick 注入取图能力，列表受控"></code>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `UploadFileItem[]` | `[]` | 列表，受控 |
| `pick` | `UploadPickHandler` | — | 取图 / 取文件能力，组件 `await` 后合并进列表 |
| `maxCount` | `number` | `9` | 最多几个 |
| `accept` | `string` | `'image/*'` | 只作为上下文传给 `pick`，组件自身不使用文件选择控件 |
| `disabled` | `boolean` | `false` | 隐藏「+」与删除按钮 |
| `readonly` | `boolean` | `false` | 同上，语义更偏「只读展示」 |
| `previewable` | `boolean` | `true` | 点击缩略图是否 emit `preview` |
| `sources` | `UploadSource[]` | 拍照 / 从相册选择 / 选择文件 | 动作面板项，`{ key, name, icon? }` |
| `maxSize` | `number` | `10 * 1024 * 1024` | 单文件字节上限 |
| `uploadText` | `string` | `'上传'` | 「+」下面的文案 |

`pick` 的签名是 `(source, context) => Promise<UploadPickResult | UploadPickResult[] | null | void>`，`context` 里带 `accept`、`maxSize`、`remaining`，业务算剩余额度时不用回读组件 props。

## Emits

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(value: UploadFileItem[])` | 新增 / 删除后抛新数组 |
| `select` | `(source: UploadSource)` | 选中动作面板项，**先于** `pick` 触发；没传 `pick` 时可在这里自己取图 |
| `picked` | `(items: UploadFileItem[])` | 本次新增的项，不含历史项 |
| `remove` | `(item, index)` | 点删除 |
| `retry` | `(item, index)` | 失败态点击整块热区 |
| `preview` | `(item, index)` | `previewable && item.url` 时点击缩略图 |
| `error` | `(payload: UploadErrorPayload)` | `{ type: 'size' \| 'count' \| 'pick', message, item?, source? }` |

## 行为约定

- `status: 'uploading'` 时浮层显示 `van-loading` 与百分比；`'failed'` 时显示重试图标，点整块格子 emit `retry`。
- 非图片按文件名渲染 `van-icon` + 名称；没有扩展名的地址按图片处理（H5 主要来源是拍照与相册）。
- `pick` 抛错或返回空数组视为「用户取消」，静默不添加、不提示；业务异常自己用 `@select` 兜底。
- 超过 `maxSize` 的项不进列表，逐项 emit `error`，并按一次选择只弹一次 `showToast`。
- `item.deletable === false` 时不显示右上角删除按钮，用于「只允许追加」的场景。
