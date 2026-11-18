/**
 * 在 App 壳未提供浏览器存储时，回退到内存存储，避免读写时抛出异常。
 */

import Cookies from 'js-cookie'

export type StorageType = 'localStorage' | 'sessionStorage' | 'cookie'

type SimpleStorage = Pick<Storage, 'setItem' | 'getItem' | 'clear' | 'removeItem'>

/** js-cookie 默认写到 path=/，clear 也按这个范围删除，与业务里其它 Cookies.set 的默认值一致 */
const cookieStorage: SimpleStorage = {
  getItem: (key) => Cookies.get(key) ?? null,
  setItem: (key, value) => {
    Cookies.set(key, value)
  },
  removeItem: (key) => {
    Cookies.remove(key)
  },
  clear: () => {
    for (const key of Object.keys(Cookies.get())) {
      Cookies.remove(key)
    }
  },
}

const noSupportCookie = () => {
  try {
    Cookies.set('_wapri-test-key', 'miao')
    const ok = Cookies.get('_wapri-test-key') === 'miao'
    Cookies.remove('_wapri-test-key')
    return !ok
  } catch {
    return true
  }
}

const noSupportStorage = (type: StorageType) => {
  if (type === 'cookie') {
    return noSupportCookie()
  }

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

export class MyStorage implements SimpleStorage {
  private readonly memory = new MemoryStorage()
  readonly noSupportLS: boolean

  constructor(public readonly type: StorageType) {
    this.noSupportLS = noSupportStorage(type)
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

  private get storage(): SimpleStorage {
    return this.type === 'cookie' ? cookieStorage : globalThis[this.type]
  }
}

export const storage = new MyStorage('localStorage')
export const session = new MyStorage('sessionStorage')
export const cookie = new MyStorage('cookie')

export default storage
