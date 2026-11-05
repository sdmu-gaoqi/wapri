import type { UploadRawFile } from 'element-plus'

/** canvas.toBlob 支持输出的图片类型，其余类型统一回退 png */
const CANVAS_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** vue-cropper `outputType` 支持的格式 */
export type CropperOutputFormat = 'jpeg' | 'png' | 'webp'

/** 是否是需要裁剪的图片 */
export const isImageFile = (file: File): boolean => file.type.startsWith('image/')

/** 裁剪输出类型：优先与原图一致，canvas 不支持的类型回退 png */
export const getOutputType = (raw: File): string => (CANVAS_TYPES.includes(raw.type) ? raw.type : 'image/png')

/** vue-cropper 的 outputType 只接收格式名，不带 `image/` 前缀 */
export const getOutputFormat = (raw: File): CropperOutputFormat => {
  const format = getOutputType(raw).replace('image/', '')
  return format === 'jpeg' || format === 'webp' ? format : 'png'
}

/** 输出类型变化时同步修正扩展名，其余保留原文件名 */
const buildFileName = (raw: File, type: string): string => {
  const ext = EXT_BY_TYPE[type] ?? 'png'
  const base = raw.name.replace(/\.[^.]+$/, '')
  return base ? `${base}.${ext}` : `cropped.${ext}`
}

/**
 * canvas → File；画布过大等导致 toBlob 返回空时抛出错误。
 * `outputType` 可强制指定输出类型，圆形裁剪需要输出 png 保留透明四角。
 */
export const canvasToFile = (canvas: HTMLCanvasElement, raw: File, outputType?: string): Promise<File> =>
  new Promise<File>((resolve, reject) => {
    const type = outputType ?? getOutputType(raw)
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('裁剪失败，图片过大无法生成文件'))
        return
      }
      const mimeType = blob.type || type
      resolve(new File([blob], buildFileName(raw, mimeType), { type: mimeType }))
    }, type)
  })

/** 裁剪结果是 Blob 时直接转成 File，文件名与扩展名跟随实际编码格式 */
export const blobToFile = (blob: Blob, raw: File): File => {
  const type = blob.type || getOutputType(raw)
  return new File([blob], buildFileName(raw, type), { type })
}

/** Blob → canvas，用于圆形裁剪时二次加工裁剪结果 */
export const blobToCanvas = (blob: Blob): Promise<HTMLCanvasElement> =>
  new Promise<HTMLCanvasElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    const release = () => URL.revokeObjectURL(url)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext('2d')
      release()
      if (!ctx) {
        reject(new Error('裁剪失败，当前环境不支持 canvas'))
        return
      }
      ctx.drawImage(image, 0, 0)
      resolve(canvas)
    }
    image.onerror = () => {
      release()
      reject(new Error('裁剪失败，未能读取裁剪结果'))
    }
    image.src = url
  })

/** 按目标尺寸重绘画布，用于把裁剪结果锁定成固定输出宽度 */
export const resizeCanvas = (canvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement => {
  if (canvas.width === width && canvas.height === height) return canvas
  const output = document.createElement('canvas')
  output.width = width
  output.height = height
  const ctx = output.getContext('2d')
  if (!ctx) return canvas
  ctx.drawImage(canvas, 0, 0, width, height)
  return output
}

/** 裁剪结果是新文件，补回原 uid 以复用 ElUpload 的进度、取消等回调 */
export const inheritUid = (file: File, raw: UploadRawFile): UploadRawFile =>
  Object.assign(file, { uid: raw.uid }) as UploadRawFile

/**
 * 圆形裁剪结果：把矩形画布的四角裁掉，只保留椭圆区域内的像素。
 *
 * vue-cropper 的 `getCropBlob` 只按裁剪框的矩形区域导出图片，
 * 圆形裁剪仅影响弹窗内的裁剪框样式（`border-radius`），
 * 若不在这里裁掉四角，头像上传后四角仍是图片内容，展示出来是正方形的。
 *
 * 裁剪框为正方形时等价于圆形，非正方形时与预览的椭圆保持一致。
 */
export const clipEllipseCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const output = document.createElement('canvas')
  output.width = canvas.width
  output.height = canvas.height
  const ctx = output.getContext('2d')
  if (!ctx) return canvas

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(canvas, 0, 0)
  ctx.restore()
  return output
}

/**
 * 比例拆成 vue-cropper 需要的 `[宽, 高]`：
 * 1 → [1, 1]，4/3 → [4, 3]，无法整除时按小数保留第一个值。
 */
export const splitRatio = (ratio: number): [number, number] => {
  if (!ratio || ratio <= 0) return [1, 1]
  if (Number.isInteger(ratio)) return [ratio, 1]
  for (const denominator of [2, 3, 4, 5, 7, 8, 9, 16]) {
    const numerator = Math.round(ratio * denominator)
    if (numerator > 0 && Math.abs(numerator / denominator - ratio) < 1e-6) {
      return [numerator, denominator]
    }
  }
  return [ratio, 1]
}

/** 比例文案：1 → 1:1，4/3 → 4:3，0 → 自由 */
export const formatRatio = (ratio: number): string => {
  if (!ratio) return '自由'
  const [width, height] = splitRatio(ratio)
  if (Number.isInteger(width) && Number.isInteger(height)) return `${width}:${height}`
  return ratio.toFixed(2)
}

/** 比例归一化：支持 4/3、'4/3' 两种写法，无法解析时按 0（自由比例）处理 */
export const parseRatio = (value: number | string): number => {
  const numberValue = Number(value)
  if (!Number.isNaN(numberValue)) return numberValue

  const [width, height] = String(value)
    .split('/')
    .map((item) => Number(item.trim()))
  return width > 0 && height > 0 ? width / height : 0
}
