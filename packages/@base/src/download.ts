/**
 * 下载 Blob 对象为文件
 * @param {string} name 文件名
 * @param {Blob} blob Blob 对象
 */
export const downloadBlob = (name: string, blob: Blob) => {
  try {
    if ('download' in document.createElement('a')) {
      // 非IE下载
      const elink = document.createElement('a')
      elink.download = name
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)
    } else {
      // IE10+下载
      // @ts-ignore
      window?.navigator?.msSaveBlob(blob, name)
    }
  } catch (e) {}
}

export const blobToJson = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(arrayBuffer)

      try {
        const jsonData = JSON.parse(jsonString)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}
