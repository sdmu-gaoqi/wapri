import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

/** NProgress 直接操作 document，这里给一个只实现用到的那几个 API 的最小 DOM。 */
const createStyle = () => {
  const values = new Map()
  const style = {
    setProperty: (name, value) => values.set(name, String(value)),
    removeProperty: (name) => values.delete(name),
    getPropertyValue: (name) => values.get(name) ?? '',
  }
  for (const key of ['opacity', 'transform', 'display']) {
    Object.defineProperty(style, key, {
      get: () => values.get(key) ?? '',
      set: (value) => {
        values.set(key, String(value))
      },
    })
  }
  return style
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName
    this.children = []
    this.parentNode = null
    this.style = createStyle()
    this.attributes = new Map()
    this.classNames = new Set()
  }

  get className() {
    return [...this.classNames].join(' ')
  }

  set className(value) {
    this.classNames = new Set(String(value).split(/\s+/).filter(Boolean))
  }

  get classList() {
    return {
      add: (...names) => names.forEach((name) => this.classNames.add(name)),
      remove: (...names) => names.forEach((name) => this.classNames.delete(name)),
      contains: (name) => this.classNames.has(name),
      toggle: (name, force) => {
        const next = force === undefined ? !this.classNames.has(name) : Boolean(force)
        if (next) this.classNames.add(name)
        else this.classNames.delete(name)
        return next
      },
    }
  }

  get offsetWidth() {
    return 0
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null
  }

  appendChild(node) {
    node.parentNode?.removeChild(node)
    node.parentNode = this
    this.children.push(node)
    return node
  }

  removeChild(node) {
    const index = this.children.indexOf(node)
    if (index >= 0) this.children.splice(index, 1)
    node.parentNode = null
    return node
  }
}

const body = new FakeElement('body')
const documentElement = new FakeElement('html')

globalThis.document = {
  body,
  documentElement,
  createElement: (tagName) => new FakeElement(tagName),
  querySelector: () => null,
}

const buildEntry = async (relativePath) => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      lib: { entry: fileURLToPath(new URL(relativePath, import.meta.url)), formats: ['es'] },
    },
  })
  const code = result[0].output.find((item) => item.type === 'chunk').code
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const { createNProgress } = await buildEntry('../src/NProgress/create.ts')

const barOf = (root) => root.children.find((node) => node.className === 'wa-ui-nprogress__bar')
const spinnerOf = (root) => root.children.find((node) => node.className === 'wa-ui-nprogress__spinner')

/** 每个用例结束后必定 remove，避免定时器或节点漏到下一个用例里。 */
const setup = (t, options) => {
  const progress = createNProgress(options)
  t.after(() => progress.remove())
  return progress
}

test.beforeEach(() => {
  body.children.length = 0
  documentElement.classNames.clear()
})

test('start 挂载进度条并停在 minimum', (t) => {
  const progress = setup(t)
  progress.start()

  const root = body.children.at(-1)
  assert.equal(root.className, 'wa-ui-nprogress')
  assert.equal(root.style.opacity, '1')
  assert.equal(barOf(root).style.transform, 'translate3d(-92%, 0, 0)')
  assert.equal(root.getAttribute('aria-valuenow'), '0.08')
  assert.equal(documentElement.classList.contains('wa-ui-nprogress-busy'), true)
  assert.equal(progress.isStarted(), true)
})

test('重复 start 不回退已走的进度', (t) => {
  const progress = setup(t)
  progress.start().set(0.5)
  progress.start()

  assert.equal(progress.status, 0.5)
})

test('set / inc 控制进度并按区间步长递增', (t) => {
  const progress = setup(t)
  progress.start()
  progress.set(0.5)

  assert.equal(progress.status, 0.5)
  assert.equal(barOf(body.children.at(-1)).style.transform, 'translate3d(-50%, 0, 0)')

  progress.inc()
  assert.equal(progress.status, 0.52)

  progress.set(0.99).inc(0.02)
  assert.equal(progress.status, 0.994)

  progress.set(0.01)
  assert.equal(progress.status, 0.08)
})

test('未开始时 inc 等价于 start', (t) => {
  const progress = setup(t)
  progress.inc()

  assert.equal(progress.status, 0.08)
  assert.equal(body.children.length, 1)
})

test('未开始时 done 不创建节点', (t) => {
  const progress = setup(t)
  progress.done()

  assert.equal(body.children.length, 0)
  assert.equal(progress.status, null)
})

test('done 走满后淡出并移除节点', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const progress = setup(t, { speed: 100, trickle: false })
  progress.start()
  progress.done()

  const root = body.children.at(-1)
  assert.equal(progress.status, null)
  assert.equal(barOf(root).style.transform, 'translate3d(0%, 0, 0)')
  assert.equal(documentElement.classList.contains('wa-ui-nprogress-busy'), false)

  t.mock.timers.tick(100)
  assert.equal(root.style.opacity, '0')
  assert.equal(body.children.length, 1)

  t.mock.timers.tick(100)
  assert.equal(body.children.length, 0)
})

test('淡出期间重新 start 会取消收尾', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const progress = setup(t, { speed: 100, trickle: false })
  progress.start()
  progress.done()

  t.mock.timers.tick(100)
  progress.start()
  t.mock.timers.tick(500)

  assert.equal(body.children.length, 1)
  assert.equal(progress.status, 0.08)
  assert.equal(body.children.at(-1).style.opacity, '1')
})

test('trickle 自动递增，关闭后不建定时器', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const progress = setup(t, { trickleSpeed: 200 })
  progress.start()
  assert.equal(progress.status, 0.08)

  t.mock.timers.tick(200)
  assert.equal(progress.status, 0.18)

  t.mock.timers.tick(200)
  assert.equal(progress.status, 0.28)

  t.mock.timers.tick(200)
  assert.equal(progress.status, 0.32)

  const manual = setup(t, { trickle: false })
  manual.start()
  t.mock.timers.tick(1000)
  assert.equal(manual.status, 0.08)
})

test('configure 立即生效并同步 settings', (t) => {
  const progress = setup(t)
  progress.start()
  progress.configure({ showSpinner: false, color: 'red', zIndex: 3000 })

  const root = body.children.at(-1)
  assert.equal(spinnerOf(root).style.display, 'none')
  assert.equal(root.style.getPropertyValue('--wa-ui-nprogress-color'), 'red')
  assert.equal(root.style.getPropertyValue('--wa-ui-nprogress-z-index'), '3000')
  assert.equal(progress.settings.showSpinner, false)
  assert.equal(progress.settings.zIndex, 3000)

  progress.configure({ color: '' })
  assert.equal(root.style.getPropertyValue('--wa-ui-nprogress-color'), '')
  assert.equal(progress.settings.color, '')
})

test('configure 切换 parent 会把节点搬到新容器', (t) => {
  const panel = new FakeElement('div')
  const progress = setup(t)
  progress.start()
  progress.configure({ parent: panel })

  assert.equal(panel.children.length, 1)
  assert.equal(body.children.length, 0)
  assert.equal(panel.children[0].classList.contains('wa-ui-nprogress--scoped'), true)
})

test('多实例互不影响', (t) => {
  const first = setup(t, { trickle: false })
  const second = setup(t, { trickle: false })
  first.start()
  second.start()
  first.set(0.5)

  assert.equal(first.status, 0.5)
  assert.equal(second.status, 0.08)
  assert.equal(body.children.length, 2)

  first.remove()
  assert.equal(body.children.length, 1)
})

test('remove 幂等且清掉忙碌标记', (t) => {
  const progress = setup(t)
  progress.start()
  progress.remove()
  progress.remove()

  assert.equal(progress.status, null)
  assert.equal(body.children.length, 0)
  assert.equal(documentElement.classList.contains('wa-ui-nprogress-busy'), false)
})

test('无 document 时全部空操作', () => {
  const documentRef = globalThis.document
  globalThis.document = undefined

  const progress = createNProgress()
  progress.start()
  progress.inc()
  progress.done()
  progress.remove()

  assert.equal(progress.status, null)

  globalThis.document = documentRef
})
