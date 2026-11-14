/** 按原生 accept 规则（`.png` 扩展名 / `image/*` 通配 / `image/png` 精确）判断文件是否可选。 */
export const matchAccept = (file: File, accept?: string): boolean => {
  const tokens = (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (!tokens.length) {
    return true
  }
  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token)
    }
    if (token.endsWith('/*')) {
      return mime.startsWith(token.slice(0, -1))
    }
    return mime === token
  })
}

/** 按 accept 把文件拆成可用与被过滤掉的两组。 */
export const splitByAccept = (files: File[], accept?: string): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = []
  const rejected: File[] = []
  for (const file of files) {
    ;(matchAccept(file, accept) ? accepted : rejected).push(file)
  }
  return { accepted, rejected }
}
