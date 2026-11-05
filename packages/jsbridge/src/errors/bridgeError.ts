/** Native 业务方法返回失败时抛出的错误，保留原始错误码与错误信息。 */
export class BridgeError extends Error {
  /** Native 响应中的 code。 */
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'BridgeError'
    this.code = code
  }
}
