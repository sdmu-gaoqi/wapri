---
title: CropperUpload 上传裁剪
group:
  title: 表单
  order: 3
---

# CropperUpload 上传裁剪

带裁剪能力的上传组件，基于 `ElUpload` 扩展：所有 `ElUpload` 属性、事件、插槽原样透传，选中图片后先弹出裁剪框，用户确认后用裁剪结果继续走原有上传链路。

裁剪能力由 [vue-cropper](https://github.com/xyxiao001/vue-cropper) 提供，支持拖动图片、拖动裁剪框、缩放、比例切换与顺/逆时针旋转。

<code src="./demo/basic.vue" title="基础用法"></code>

## 工作流程

裁剪接入在 `ElUpload` 的 `beforeUpload` 阶段，发生在列表项创建之前，因此**列表缩略图与实际上传的文件都是裁剪后的结果**。

1. 选中图片后不进入上传流程，而是弹出裁剪框；非图片文件（如视频、文档）跳过裁剪，按原逻辑直传。
2. 弹窗左侧为裁剪区，右侧为实时预览：拖动、缩放、旋转、切换比例都会同步刷新预览，并展示「固定 9:16，确认后输出 750 × 1334」这类尺寸提示。
3. 点击「重新选择」可不关闭弹窗换成另一张图；文件类型跟随 `ElUpload` 的 `accept`（未传时默认 `image/*`），非图片会被忽略并提示。
4. 点击「确定」后返回裁剪结果（沿用原文件的 `uid`，文件名跟随当前图片），由 `ElUpload` 用它创建列表项并发起上传：
   - 传了 `http-request` → 交给自定义上传逻辑；
   - 未传 → 使用 `ElUpload` 默认的 xhr 上传。
5. 点击「取消」、关闭按钮或按下 ESC，等同放弃本次上传：直接返回 `false`，`ElUpload` 会移除该文件（等同于 `on-remove` 回调），并触发 `cancel` 事件。

## 透传规则

组件使用 `inheritAttrs: false`，未声明为 props 的属性会通过 `v-bind="$attrs` 交给 `ElUpload`，因此 `action`、`accept`、`list-type`、`multiple`、`limit`、`headers`、`data`、`http-request`、`on-success`、`on-progress`、`on-exceed` 等全部可用。

声明为 prop 的只有两类：

- `beforeUpload`：与裁剪串联，内部先完成裁剪再执行用户钩子；
- 裁剪相关配置（见下表）。

用户自定义的 `beforeUpload` 在裁剪之后执行，拿到的是裁剪结果；返回 `false` 可终止上传，返回 `Blob` / `File` 可再次替换上传文件。

插槽 `default`、`trigger`、`tip` 同步透传给 `ElUpload`。

## 裁剪结果

裁剪通过 canvas 导出，输出类型与原图一致（`image/jpeg`、`image/png`、`image/webp`），原图是其它类型时回退 `image/png`，并同步修正文件扩展名；文件名保持不变。

`ElUpload` 会先用原图创建列表项，裁剪完成后组件会把列表项的缩略图、文件名与 `raw` 替换为裁剪结果，因此无论是否受控 `file-list`，列表展示的都是裁剪后的图片。

圆形裁剪（`circle`）时裁剪框按正圆展示，裁剪画布的四角会被裁掉，输出固定为 `image/png` 以保留透明四角；上传列表的缩略图也会同步按圆形展示（`.el-upload-list__item-thumbnail` 与图片卡片均加 `border-radius: 50%`，随 `circle` 生效，可通过覆盖该样式调整）。

导出尺寸规则：

- 不传 `outputWidth` 时按**原图像素**导出（裁剪框显示尺寸 ÷ 当前缩放比例），提示里的数字就是最终像素；大图缩小显示也不会降采样，导出分辨率等于原图对应区域，不会发糊；
- 传 `outputWidth` 时按该宽度等比缩放导出，高度由裁剪比例换算，与屏幕尺寸、dpr 无关，适合「固定输出 750 × 1334」这类有明确规格的场景。

> 图片旋转过 90° 时导出会走 vue-cropper 自带的算法（分辨率按裁剪框显示尺寸 × dpr），未旋转时一律按原图像素导出。

原图超过 `maxImgSize`（默认 4096）时会先等比压缩再裁剪，避免超大图占用过多内存。

## 拖拽排序

`sortable` 打开后，上传列表的每一项都可以拖动调整顺序（商品图集、轮播图这类「顺序即语义」的场景）：

- 松手后按新顺序回写 `file-list`：受控用法触发 `update:fileList`，非受控用法更新组件内部列表；
- 排序只改列表顺序，不会重新上传、也不会重新裁剪，`beforeUpload`、`remove` 等原有链路按新列表照常执行；
- 拖拽底座是 [@vue-dnd-kit/core](https://www.npmjs.com/package/@vue-dnd-kit/core)（需要 `vue >= 3.5`），组件自带 `DnDProvider`，业务不用另外包；
- 截图墙（`list-type="picture-card"`）与文字列表都支持；触屏长按、键盘聚焦后按空格 + 方向键同样可用。

<code src="./demo/sortable.vue" title="拖拽调整顺序"></code>

## 使用

```vue | pure
<script setup lang="ts">
import { CropperUpload } from '@wapri/element-pro'

const onCrop = (file: File, rawFile: File) => {
  // 裁剪后的文件与原始文件
}
</script>

<template>
  <CropperUpload
    action="/upload"
    accept="image/*"
    list-type="picture-card"
    title="裁剪商城封面"
    :ratios="[9 / 16]"
    :output-width="750"
    confirm-text="确认裁剪并上传"
    :cropper-options="{ fixedBox: true }"
    @crop="onCrop"
  />
</template>
```

## Props

除下表外，其余 `ElUpload` 属性均透传。

| 属性            | 说明                                                             | 类型                  | 默认值                 |
| --------------- | ---------------------------------------------------------------- | --------------------- | ---------------------- |
| `beforeUpload`  | 上传前钩子，在裁剪之后执行，拿到的是裁剪结果；返回 `false` 终止上传，返回 `Blob` / `File` 可替换上传文件 | `UploadHooks['beforeUpload']` | - |
| `cropper`       | 是否启用裁剪，置 `false` 时退化为原生 `ElUpload`                | `boolean`             | `true`                 |
| `aspectRatio`   | 初始裁剪比例，也支持 `4/3` 写法；需出现在 `ratios` 中，否则以 `ratios` 第一项为准 | `number \| string` | `1` |
| `ratios`        | 弹窗内可切换的比例列表，`0` 表示自由比例；只传一项时隐藏比例切换 | `number[]`            | `[1, 4/3, 16/9, 9/16]` |
| `ratioLabels`   | 比例按钮文案，与 `ratios` 一一对应；未传项按比例自动生成（`0` → `自由`） | `string[]`  | -                      |
| `cropperOptions` | 透传给 vue-cropper 的配置，见下表 | `CropperOptions` | `{}` |
| `preview`       | 是否展示右侧实时预览与输出尺寸提示                               | `boolean`             | `true`                 |
| `outputWidth`   | 固定输出宽度（px），高度按裁剪比例换算；不传时按原图像素输出 | `number`         | -                      |
| `circle`        | 圆形裁剪，用于头像等场景；裁剪结果四角透明（输出 png），上传列表缩略图同步按圆形展示 | `boolean`             | `false`                 |
| `canvasHeight`  | 裁剪区域高度，也可通过 CSS 变量 `--wa-ui-cropper-upload-canvas-height` 覆盖 | `number \| string` | `'420px'` |
| `title`         | 弹窗标题                                                         | `string`              | `'裁剪图片'`           |
| `confirmText`   | 确认按钮文案                                                     | `string`              | `'确定'`               |
| `cancelText`    | 取消按钮文案                                                     | `string`              | `'取消'`               |
| `reselectText`  | 「重新选择」按钮文案                                             | `string`              | `'重新选择'`           |
| `sortable`      | 上传列表是否可拖拽调整顺序，松手后按新顺序回写 `file-list`       | `boolean`             | `false`                |
| `sortableDisabled` | 关闭拖拽排序（仅 `sortable` 为 `true` 时生效）                 | `boolean`             | `false`                |

### cropperOptions

未传的字段使用 vue-cropper 的默认行为；`fixed`、`fixedNumber`、`img` 由组件按 `ratios`、`aspectRatio` 与选中文件驱动，不通过该属性覆盖。

| 字段         | 说明                                             | 类型      | 默认值      |
| ------------ | ------------------------------------------------ | --------- | ----------- |
| `canMove`    | 是否可拖动图片                                   | `boolean` | `true`      |
| `canMoveBox` | 是否可拖动裁剪框                                 | `boolean` | `true`      |
| `fixedBox`   | 固定裁剪框大小，禁止拖动改变裁剪框               | `boolean` | `false`     |
| `centerBox`  | 裁剪框是否限制在图片范围内，关闭后裁剪结果可能带入画布背景色 | `boolean` | `true`  |
| `info`       | 是否显示裁剪框尺寸提示                           | `boolean` | `true`      |
| `canScale`   | 是否支持滚轮 / 双指缩放                          | `boolean` | `true`      |
| `mode`       | 图片布局方式，`contain` 居中留白、`cover` 填满容器 | `string`  | `'contain'` |
| `high`       | 兼容字段：未旋转时按原图像素导出，不再受 dpr 影响；旋转后走 vue-cropper 算法时生效 | `boolean` | `true` |
| `enlarge`    | 兼容字段：未旋转时导出按原图像素，不再按倍数放大；旋转后走 vue-cropper 算法时生效 | `number` | `1` |
| `maxImgSize` | 图片最大尺寸，超过该边长会先等比压缩再裁剪       | `number`  | `4096`      |
| `outputSize` | 导出图片质量，`0`-`1`，仅 jpeg / webp 生效       | `number`  | `1`         |
| `fillColor`  | 导出时填充的背景色，如 `#fff`；不传时透明区域保持透明 | `string` | `''`        |

## Events

| 事件名  | 说明                                 | 回调参数                       |
| ------- | ------------------------------------ | ------------------------------ |
| `crop`  | 裁剪完成，随后会用裁剪结果发起上传  | `(file: File, rawFile: File)`  |
| `cancel` | 用户取消裁剪，该文件不会进入上传与列表（等同于 `on-remove`） | `(rawFile: File)`  |
| `error` | 图片加载或裁剪结果生成失败          | `(error: Error)`               |
| `reselect` | 弹窗内「重新选择」了图片，组件已自动换成新图继续裁剪 | `(rawFile: File)` |

`ElUpload` 的 `change`、`success`、`progress`、`error` 等事件通过 `$attrs` 透传，按原有语义触发。

## Slots

| 插槽名    | 说明                       |
| --------- | -------------------------- |
| `default` | 上传触发区域，透传给 `ElUpload` |
| `trigger` | 列表中的上传触发元素       |
| `tip`     | 列表下方的说明文案         |

## Expose

| 名称        | 说明                       | 类型          |
| ----------- | -------------------------- | ------------- |
| `uploadRef` | `ElUpload` 实例，可调用其 `abort`、`clearFiles`、`submit` 等方法 | `UploadInstance` |

## 说明

- 裁剪弹窗通过 `append-to-body` 挂载到 `body`，样式使用固定的 `wa-ui-cropper-upload-` 前缀类名。
- 弹窗主体分两栏：左侧裁剪区 + 工具栏，右侧实时预览；`preview` 置为 `false` 时收窄为单栏（弹窗宽度 680px，带预览时 900px）。
- 工具栏从左到右依次为「重新选择」、缩放/旋转按钮组、比例切换按钮组（只有多项比例时出现）。比例按钮默认按比例生成文案，可用 `ratioLabels` 覆盖成业务文案，例如把自由比例显示成「自定义」。
- 预览不再消费 vue-cropper 的 `real-time` 中间态（该事件内部有节流，会丢最后一帧），改为读取裁剪框状态（`cropOffsertX/Y`、`cropW/H`）反算出它在原图上的源区域，再用同一套裁剪逻辑绘制到 `<canvas>` 上，因此和最终导出像素一一对应；尺寸提示与实际导出算法一致（`outputWidth` 优先，否则按原图像素）。
- 拖动、缩放、旋转、切换比例都会触发预览重绘（`requestAnimationFrame` 合并同一帧内的多次调用），预览画布按容器尺寸自适应，不再受宿主 `img { max-width: 100% }` 这类全局样式影响。
- 裁剪框默认按所选比例居中生成并限制在图片范围内（固定比例默认占图片可用区域的 90%）；自由比例（`0`）直接铺满整张图片；切换比例后会按新比例重建裁剪框。图片加载后组件会自动校正缩放与居中位置，不受弹窗打开时测量时机的影响。
- 图片未加载完成时「确定」按钮禁用、预览区显示比例占位，避免导出空白画布。
- 裁剪弹窗每次打开都会按 `aspectRatio` 重置比例；图片对象地址（`blob:`）在换图或组件卸载时释放。
- 一次选择多张图片时会依次弹出裁剪框，逐张确认。