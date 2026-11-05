/** 引导步骤里的一段文本，`bold` 为 true 时渲染为加粗 */
export interface GuideStepSegment {
  text: string
  bold: boolean
}

const BOLD_PATTERN = /\*\*(.+?)\*\*/g

/**
 * 解析单条引导步骤，把 `**文案**` 拆成加粗片段，其余按普通文本处理。
 * 用于在引导文案里突出「在浏览器中打开」这类关键动作。
 *
 * @param step 原始步骤文案
 * @returns 按顺序排列的文本片段，至少返回一段
 */
export function parseGuideStep(step: string): GuideStepSegment[] {
  const segments: GuideStepSegment[] = []
  let lastIndex = 0

  BOLD_PATTERN.lastIndex = 0
  let matched = BOLD_PATTERN.exec(step)
  while (matched) {
    const start = matched.index
    if (start > lastIndex) {
      segments.push({ text: step.slice(lastIndex, start), bold: false })
    }
    segments.push({ text: matched[1] as string, bold: true })
    lastIndex = start + matched[0].length
    matched = BOLD_PATTERN.exec(step)
  }

  if (lastIndex < step.length) {
    segments.push({ text: step.slice(lastIndex), bold: false })
  }

  return segments.length ? segments : [{ text: step, bold: false }]
}
