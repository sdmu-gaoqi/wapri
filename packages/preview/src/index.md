---
nav:
  title: preview
  order: 1
title: 简介
group:
  order: -10
---

# preview

preview 是一个面向 H5 的文件预览包：本地文件与远程地址统一入口，解析与渲染分离，**看到哪里渲染哪里**。

支持的类型：文本、PDF、Word（docx）、Excel（xlsx / xls / csv）。

## 安装

```bash
pnpm add @wapri/preview
```

## 使用示例

```typescript
import { previewFile } from '@wapri/preview'

const handle = await previewFile(file, {
  container: document.querySelector('#viewer')!,
  thumbnails: true,
})

// 释放 canvas、worker、objectURL
handle.destroy()
```

<code src="./demo/basic.vue" title="本地文件 / 分段文本 / 远程地址"></code>

## 远程文件

demo 里第二行输入框可直接填远程地址（默认使用文档站的 `/demo/sample.pdf`），也可以带请求头：

```typescript
await previewFile(
  { url: 'https://example.com/files/report.pdf', headers: { Authorization: 'Bearer token' } },
  { container },
)
```

## 单独调用

```typescript
import { previewPdf, previewText, previewWord, previewXlsx } from '@wapri/preview'

await previewText('一段文本', { container })
await previewPdf('/files/demo.pdf', { container })
await previewWord(file, { container })
await previewXlsx('/files/demo.xlsx', { container })
```

## 渲染策略

| 类型 | 解析 | 渲染 | 懒渲染粒度 |
| --- | --- | --- | --- |
| 文本 | 主线程按行分块 | DOM | 80 行一块 |
| PDF | pdf.js worker | Canvas | 每页 |
| Word | mammoth + opentype 排版 | Canvas | 每页 |
| XLSX | SheetJS（worker 优先） | DOM 绝对定位单元格 | 可视行列 |

## 资源说明

- PDF：必须通过 `configurePdfjs({ workerSrc })` 指定可访问的 `pdf.worker.min.mjs`；打包器会把 `import.meta.url` 改写成构建路径，默认相对路径不可靠。中文 PDF 建议同时配置 `cMapUrl`。
- XLSX：默认尝试用包内 `dist/vendor/xlsx.full.min.js` 在 worker 中解析，地址不可用时自动回退主线程；也可以用 `workerScript` 指定自己的 UMD 地址。
- Word：传入 `fonts`（TTF / OTF 的 ArrayBuffer）可用 opentype.js 精确测量并绘制；不传时回退 Canvas 字体。
