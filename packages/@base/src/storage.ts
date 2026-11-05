/**
 * 在 App 壳未提供浏览器存储时，回退到内存存储，避免读写时抛出异常。
 */

export type StorageType = 'localStorage' | 'sessionStorage'

const noSupportLS = (type: StorageType) => {
  try {
    const storage = globalThis[type]

    storage.setItem('_wapri-test-key', 'miao')
    storage.getItem('_wapri-test-key')
    storage.removeItem('_wapri-test-key')
    return false
  } catch {
    return true
  }
}

class MemoryStorage {
  private cache = new Map<string, string>()

  setItem(key: string, value: string) {
    this.cache.set(key, value)
  }

  getItem(key: string) {
    return this.cache.get(key) ?? null
  }

  clear() {
    this.cache.clear()
  }

  removeItem(key: string) {
    this.cache.delete(key)
  }
}

export class MyStorage implements Pick<Storage, 'setItem' | 'getItem' | 'clear' | 'removeItem'> {
  private readonly memory = new MemoryStorage()
  readonly noSupportLS: boolean

  constructor(public readonly type: StorageType) {
    this.noSupportLS = noSupportLS(type)
  }

  getItem(key: string) {
    if (this.noSupportLS) {
      return this.memory.getItem(key)
    }

    try {
      return this.storage.getItem(key)
    } catch {
      return this.memory.getItem(key)
    }
  }

  setItem(key: string, value: string) {
    if (this.noSupportLS) {
      this.memory.setItem(key, value)
      return
    }

    try {
      this.storage.setItem(key, value)
      this.memory.removeItem(key)
    } catch {
      this.memory.setItem(key, value)
    }
  }

  clear() {
    if (this.noSupportLS) {
      this.memory.clear()
      return
    }

    try {
      this.storage.clear()
      this.memory.clear()
    } catch {
      this.memory.clear()
    }
  }

  removeItem(key: string) {
    if (this.noSupportLS) {
      this.memory.removeItem(key)
      return
    }

    try {
      this.storage.removeItem(key)
      this.memory.removeItem(key)
    } catch {
      this.memory.removeItem(key)
    }
  }

  private get storage() {
    return globalThis[this.type]
  }
}

export const storage = new MyStorage('localStorage')
export const session = new MyStorage('sessionStorage')

export default storage
