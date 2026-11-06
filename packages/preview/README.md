# @wapri/preview

面向 H5 的文件预览包：文本、PDF、Word（docx）、Excel（xlsx / xls / csv）。解析与渲染分离，按可视区域懒渲染，支持本地文件与远程地址。

## 安装

```bash
pnpm add @wapri/preview
```

## 快速开始

```ts
import { previewFile } from '@wapri/preview'

const handle = await previewFile(file, {
  container: document.querySelector('#viewer')!,
  pdf: { thumbnails: true },
})

handle.refresh() // 容器尺寸变化后重排
handle.destroy() // 释放 canvas、worker、objectURL
```

远程文件与自定义请求头：

```ts
const handle = await previewFile(
  { url: '/files/report.pdf', headers: { Authorization: 'Bearer token' } },
  { container: document.querySelector('#viewer')! },
)
```

`previewFile` 会读取文件头识别类型，再分发到 `previewText` / `previewPdf` / `previewWord` / `previewXlsx`。

## API

| 方法 | 说明 |
| --- | --- |
| `previewFile(input, options)` | 自动识别类型并预览 |
| `previewText(input, options)` | 文本预览，按行分块懒渲染 |
| `previewPdf(input, options)` | PDF 预览，pdf.js + Canvas，支持缩略图 |
| `previewWord(input, options)` | Word 预览，mammoth 解析 + opentype 排版 + Canvas 分页 |
| `previewXlsx(input, options)` | Excel 预览，SheetJS 解析 + 虚拟表格 |
| `configurePdfjs(config)` | 配置 pdf.js worker、CMap、标准字体地址 |

`input` 支持 `File` / `Blob` / `ArrayBuffer` / `ArrayBufferView` / URL 字符串 / `{ url, fileName?, headers? }`。

通用 options：`container`、`className`、`lazy`、`overscan`、`theme`、`onProgress`。

## 渲染策略

| 类型 | 解析 | 渲染 | 懒渲染粒度 |
| --- | --- | --- | --- |
| 文本 | 主线程按行分块 | DOM | 80 行一块 |
| PDF | pdf.js worker | Canvas | 每页 |
| Word | mammoth + opentype 排版 | Canvas | 每页 |
| XLSX | SheetJS（worker 优先） | DOM 绝对定位单元格 | 可视行列 |

## 资源与配置

- PDF：必须调用 `configurePdfjs({ workerSrc })` 指定可访问的 `pdf.worker.min.mjs` 地址。打包器会把 `import.meta.url` 改写成构建路径（webpack 下是 `file://`），包内相对路径无法可靠定位 worker；文档站 demo 使用 `/pdf.worker.min.mjs`，业务按自己的部署位置配置。中文 PDF 建议同时配置 `cMapUrl`。
- XLSX：默认尝试用包内 `dist/vendor/xlsx.full.min.js` 在 worker 中解析，地址不可用时自动回退主线程；也可以用 `workerScript` 显式指定自己的 UMD 地址。
- Word：传入 `fonts`（TTF / OTF 的 `ArrayBuffer[]`）可用 opentype.js 精确测量并绘制，不传时回退 Canvas 字体。

## 依赖

- `@wapri/gbase`：Worker 通道、Object URL 管理、文件读取、类型嗅探、可视区域观察
- `pdfjs-dist`、`mammoth`、`xlsx`、`opentype.js`

## 注意

- 预览只读取用户选择的文件，不上传、不落盘。
- 大文件解析会占用主线程内存，`maxCells`（XLSX）等上限参数可按业务调整。
