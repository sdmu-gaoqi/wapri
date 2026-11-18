import { HmacMD5, AES, enc, mode, pad } from 'crypto-js'
import { isEmpty } from 'lodash-es'

export const aesEncrypt = (input: string, key: string) => {
  const secretKey = enc.Utf8.parse(key)
  const iv = enc.Utf8.parse(key.substring(0, 16))
  const encrypted = AES.encrypt(input, secretKey, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })
  const text = encrypted.ciphertext.toString()

  return enc.Base64.stringify(enc.Hex.parse(text))
}

export const aesDecrypt = (input: string, key: string) => {
  const secretKey = enc.Utf8.parse(key)
  const iv = enc.Utf8.parse(key.substring(0, 16))
  const decrypted = AES.decrypt(input, secretKey, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })
  return decrypted.toString(enc.Utf8)
}

export const getSign = (params: Record<string, string | number>, secretKey: string, excludeKeys: string[] = []) => {
  let message = ''
  Object.keys(params)
    .filter((key) => {
      return !excludeKeys.includes(key) && !isEmpty(params[key])
    })
    .sort()
    .forEach((key, index) => {
      let paramsKey = encodeURIComponent(params[key])
      paramsKey = paramsKey?.replace(/\*/g, '%2A')
      message += `${index === 0 ? '' : '&'}${key}=${paramsKey || ''}`
    })
  return HmacMD5(message, secretKey).toString()
}
