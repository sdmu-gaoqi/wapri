/**
 * 图片处理相关常量（火山引擎 TOS）。
 *
 * 处理能力完全由 URL 上的 `x-tos-process` 参数驱动，服务端实时处理、不落存储，
 * 因此前端只需要拼参数，不需要上传或二次存储。
 */

/** 图片处理的 query 参数名 */
export const TOS_IMAGE_PROCESS_KEY = 'x-tos-process'

/** 处理串的 action 前缀，完整形态为 `image/resize,w_300/format,webp` */
export const TOS_IMAGE_PROCESS_PREFIX = 'image'

/** 缩放结果图允许的最大边长（px），超出会被服务端拒绝 */
export const TOS_IMAGE_MAX_SIZE = 16384

/** 质量的取值范围 */
export const TOS_IMAGE_QUALITY_RANGE = { min: 1, max: 100 } as const
