import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire, registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createRenderer, h, nextTick, reactive, ref } from 'vue'

const require = createRequire(import.meta.url)

/**
 * `element-plus` 的 ESM 构建里 `import AsyncValidator from 'async-validator'`，
 * Node 会解析到 CJS 的 `dist-node/index.js`，互操作后 `default` 变成 `{ __esModule, default }`，
 * `new AsyncValidator()` 直接抛错，导致 `ElFormItem.validate` 永远 reject `undefined`。
 * Vite 构建走 `module` 字段拿 ESM 版本，所以这里把解析结果指到 `dist-web/index.js`。
 */
const elementPlusDir = path.dirname(require.resolve('element-plus/package.json'))
const asyncValidatorUrl = pathToFileURL(
  createRequire(path.join(elementPlusDir, 'package.json')).resolve('async-validator').replace('dist-node', 'dist-web'),
).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'async-validator') return { url: asyncValidatorUrl, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

/** `@wapri/gutils` 从 workspace 源码导出，测试里用等价的最小实现代替。 */
const gutilsStubSource = `
export const toPath = (value) => (Array.isArray(value) ? value.map(String) : String(value).split('.').filter(Boolean))
export const get = (target, path, fallback) => {
  let current = target
  for (const key of toPath(path)) {
    if (current === null || current === undefined) return fallback
    current = current[key]
  }
  return current === undefined ? fallback : current
}
export const set = (target, path, value) => {
  const keys = toPath(path)
  let current = target
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value
      return
    }
    if (typeof current[key] !== 'object' || current[key] === null) current[key] = {}
    current = current[key]
  })
  return target
}
export const cloneDeep = (value) => JSON.parse(JSON.stringify(value))
export const uuid = () => Math.random().toString(36).slice(2)
`

const gutilsStub = {
  name: 'gutils-stub',
  enforce: 'pre',
  resolveId(id) {
    if (id === '@wapri/gutils') return '\0gutils-stub'
    return null
  },
  load(id) {
    if (id === '\0gutils-stub') return gutilsStubSource
    return null
  },
}

const elementPlusPath = pathToFileURL(path.join(elementPlusDir, 'es/index.mjs')).href
const vuePath = import.meta.resolve('vue')

const buildEntry = async (relativePath) => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [gutilsStub, vue()],
    build: {
      write: false,
      minify: false,
      lib: { entry: fileURLToPath(new URL(relativePath, import.meta.url)), formats: ['es'] },
      rollupOptions: {
        external: ['vue', 'element-plus'],
        output: {
          paths: (id) => {
            if (id === 'element-plus') return elementPlusPath
            if (id === 'vue') return vuePath
            return pathToFileURL(require.resolve(id)).href
          },
        },
      },
    },
  })
  const code = result[0].output.find((item) => item.type === 'chunk').code
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const tabFormModule = await buildEntry('../src/TabForm/index.ts')
const tabFormUtils = await buildEntry('../src/TabForm/utils.ts')
const fieldsModule = await buildEntry('../src/ProFormFields/index.ts')
const elementPlus = await import(elementPlusPath)

const { TabForm, TabFormItem } = tabFormModule
const { ProFormText } = fieldsModule

class HostNode {
  constructor(type, text = '') {
    this.type = type
    this.text = text
    this.children = []
    this.props = {}
    this.parent = null
    this.style = {}
    this.dataset = {}
  }
  get parentNode() {
    return this.parent
  }
  /** `ElTabs` 的 `swapChildren` 直接读 DOM 属性，这里补一个只读视图。 */
  get firstChild() {
    return this.children[0] ?? null
  }
  before(node) {
    const parent = this.parent
    if (!parent) return
    const index = parent.children.indexOf(this)
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    parent.children.splice(index === -1 ? parent.children.length : index, 0, node)
  }
  insertBefore(node, anchor) {
    const index = anchor ? this.children.indexOf(anchor) : -1
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = this
    if (index === -1) this.children.push(node)
    else this.children.splice(index, 0, node)
    return node
  }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  getAttribute() {
    return undefined
  }
  removeAttribute() {}
  appendChild(node) {
    this.children.push(node)
  }
  focus() {}
  blur() {}
  hasAttribute() {
    return false
  }
  getBoundingClientRect() {
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }
  querySelector() {
    return null
  }
  querySelectorAll() {
    return []
  }
  closest() {
    return null
  }
}

globalThis.Element = HostNode
// `ElInput` 的 `nativeInputValue` 监听器会读 `document.activeElement`，这里给一个最小实现。
globalThis.document = { activeElement: null }
// `ElTabs` 的 `tab-nav` 用 `@vueuse/core` 的 `useWindowFocus` / `useResizeObserver`，需要 window。
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  document: globalThis.document,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
}

const renderer = createRenderer({
  createElement: (tag) => new HostNode(tag),
  createText: (text) => new HostNode('#text', text),
  createComment: (text) => new HostNode('#comment', text),
  setText: (node, text) => {
    node.text = text
  },
  setElementText: (node, text) => {
    node.text = text
    node.children = []
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
  patchProp: (node, key, prev, value) => {
    node.props[key] = value
  },
  insert: (node, parent, anchor = null) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    const index = anchor ? parent.children.indexOf(anchor) : -1
    if (index === -1) parent.children.push(node)
    else parent.children.splice(index, 0, node)
  },
  remove: (node) => {
    node.parent?.children.splice(node.parent.children.indexOf(node), 1)
  },
})

function mount(t, render) {
  const root = new HostNode('root')
  const app = renderer.createApp({ render })
  app.provide(elementPlus.ID_INJECTION_KEY, { prefix: 1024, current: 0 })
  app.mount(root)
  t.after(() => app.unmount())
  return root
}

function walk(root, visit) {
  for (const node of root.children) {
    visit(node)
    walk(node, visit)
  }
}

const classTokens = (value) => {
  const raw = Array.isArray(value) ? value.join(' ') : String(value ?? '')
  return raw.split(/\s+/).filter(Boolean)
}

const hasClass = (node, token) => classTokens(node.props.class).includes(token)

function collect(root, predicate) {
  const hits = []
  walk(root, (node) => {
    if (predicate(node)) hits.push(node)
  })
  return hits
}

/** 文本可能落在 `#text` 节点，也可能被 `setElementText` 直接写在元素上；注释节点不参与。 */
const nodeText = (node) => {
  if (node.type === '#comment') return ''
  return node.children.length ? node.children.map(nodeText).join('') : node.text
}

const tabLabels = (root) =>
  collect(root, (node) => hasClass(node, 'wa-ui-tab-form__label')).map((node) =>
    node.children
      .filter((child) => !hasClass(child, 'wa-ui-tab-form__badge'))
      .map(nodeText)
      .join(''),
  )
const badges = (root) => collect(root, (node) => hasClass(node, 'wa-ui-tab-form__badge'))

const buildTabs = (options = {}) =>
  h(
    TabForm,
    { ref: options.formRef, model: options.model, ...options.tabFormProps },
    {
      default: () => [
        h(
          TabFormItem,
          { name: 'basic', title: '基础信息' },
          { default: () => [h(ProFormText, { name: 'productName', rules: options.basicRules })] },
        ),
        h(
          TabFormItem,
          { name: 'price', title: '价格库存' },
          { default: () => [h(ProFormText, { name: 'price', rules: options.priceRules })] },
        ),
        h(
          TabFormItem,
          { name: 'ship', title: '配送设置' },
          { default: () => [h(ProFormText, { name: 'shipNote', rules: options.shipRules })] },
        ),
      ],
    },
  )

test('renders one tab per TabFormItem in declaration order', async (t) => {
  const model = reactive({})
  const root = mount(t, () => buildTabs({ model }))
  await nextTick()
  assert.deepEqual(tabLabels(root), ['基础信息', '价格库存', '配送设置'])
})

test('activates the first tab by default and shows its pane', async (t) => {
  const model = reactive({})
  const formRef = ref()
  const root = mount(t, () => buildTabs({ model, formRef }))
  await nextTick()
  assert.equal(formRef.value.active, 'basic')
  const panes = collect(root, (node) => hasClass(node, 'wa-ui-tab-form__pane'))
  assert.equal(panes.length, 3)
  assert.notEqual(panes[0].style.display, 'none')
  assert.equal(panes[1].style.display, 'none')
  assert.equal(panes[2].style.display, 'none')
})

test('all tabs share the same model object', async (t) => {
  const model = reactive({ productName: '办公标签机', price: '99' })
  const formRef = ref()
  mount(t, () => buildTabs({ model, formRef }))
  await nextTick()
  const basic = formRef.value.getFormInstance('basic')
  const price = formRef.value.getFormInstance('price')
  assert.ok(basic)
  assert.ok(price)
  // 两个分段是独立的 ElForm 实例，但读到的是同一个数据对象。
  assert.notEqual(basic.formRef, price.formRef)
  assert.equal(basic.formRef.fields[0].fieldValue, '办公标签机')
  assert.equal(price.formRef.fields[0].fieldValue, '99')
  model.productName = '改过的名称'
  model.price = '199'
  await nextTick()
  assert.equal(basic.formRef.fields[0].fieldValue, '改过的名称')
  assert.equal(price.formRef.fields[0].fieldValue, '199')
})

test('submit validates every tab and jumps to the first invalid one', async (t) => {
  const model = reactive({})
  const formRef = ref()
  const received = []
  mount(t, () =>
    buildTabs({
      model,
      formRef,
      basicRules: [{ required: true, message: '请输入商品名称' }],
      shipRules: [{ required: true, message: '请输入配送说明' }],
      tabFormProps: { onFinish: (values) => received.push(values) },
    }),
  )
  await nextTick()
  assert.equal(await formRef.value.submit(), false)
  assert.equal(formRef.value.active, 'basic')
  assert.deepEqual(formRef.value.getInvalidTabs(), ['basic', 'ship'])
  assert.equal(received.length, 0)
})

test('submit succeeds when every tab passes and passes a shallow copy', async (t) => {
  const model = reactive({ productName: '办公标签机', price: '99' })
  const formRef = ref()
  const received = []
  mount(t, () => buildTabs({ model, formRef, tabFormProps: { onFinish: (values) => received.push(values) } }))
  await nextTick()
  assert.equal(await formRef.value.submit(), true)
  assert.equal(received.length, 1)
  assert.deepEqual(received[0], { productName: '办公标签机', price: '99' })
  assert.notEqual(received[0], model)
})

test('onFinish returning false keeps the form untouched', async (t) => {
  const model = reactive({ productName: '办公标签机' })
  const formRef = ref()
  mount(t, () => buildTabs({ model, formRef, tabFormProps: { onFinish: () => false } }))
  await nextTick()
  assert.equal(await formRef.value.submit(), false)
  assert.equal(model.productName, '办公标签机')
})

test('invalid tabs get a badge and the badge clears after a successful submit', async (t) => {
  const model = reactive({})
  const formRef = ref()
  const root = mount(t, () => buildTabs({ model, formRef, basicRules: [{ required: true, message: '必填' }] }))
  await nextTick()
  assert.equal(badges(root).length, 0)
  await formRef.value.submit()
  await nextTick()
  assert.equal(badges(root).length, 1)
  model.productName = '办公标签机'
  await nextTick()
  await formRef.value.submit()
  await nextTick()
  assert.equal(badges(root).length, 0)
})

test('resetFields clears values and invalid markers', async (t) => {
  const model = reactive({ productName: '办公标签机' })
  const formRef = ref()
  const root = mount(t, () => buildTabs({ model, formRef, basicRules: [{ required: true, message: '必填' }] }))
  await nextTick()
  await formRef.value.submit()
  await nextTick()
  assert.equal(badges(root).length, 0)
  formRef.value.resetFields()
  await nextTick()
  assert.deepEqual(formRef.value.getInvalidTabs(), [])
})

test('active is controlled when the prop is provided', async (t) => {
  const model = reactive({})
  const formRef = ref()
  const changes = []
  mount(t, () =>
    buildTabs({
      model,
      formRef,
      tabFormProps: { 'active': 'price', 'onUpdate:active': (value) => changes.push(value) },
    }),
  )
  await nextTick()
  assert.equal(formRef.value.active, 'price')
  await formRef.value.submit()
  assert.deepEqual(changes, [])
})

test('submitter false hides every built-in button', async (t) => {
  const model = reactive({})
  const root = mount(t, () => buildTabs({ model, tabFormProps: { submitter: false } }))
  await nextTick()
  assert.equal(collect(root, (node) => hasClass(node, 'wa-ui-tab-form__actions')).length, 0)
})

test('duplicate item names keep the first registration and warn', async (t) => {
  const model = reactive({})
  const warnings = []
  const original = console.warn
  console.warn = (message) => warnings.push(String(message))
  t.after(() => {
    console.warn = original
  })
  const root = mount(t, () =>
    h(
      TabForm,
      { model },
      {
        default: () => [
          h(TabFormItem, { name: 'same', title: '第一个' }, { default: () => [] }),
          h(TabFormItem, { name: 'same', title: '第二个' }, { default: () => [] }),
        ],
      },
    ),
  )
  await nextTick()
  assert.equal(tabLabels(root).length, 1)
  assert.equal(
    warnings.some((message) => message.includes('重复')),
    true,
  )
})

test('TabForm exposes Item as a registered sub component', async () => {
  assert.equal(typeof TabForm.Item, 'object')
  assert.equal(TabForm.Item.name, 'TabFormItem')
  assert.equal(typeof TabForm.Item.install, 'function')
  assert.equal(TabForm.Item, TabFormItem)
})

test('collectInvalidTabs keeps declaration order', async () => {
  const calls = []
  const items = [
    {
      name: 'a',
      getForm: () => ({
        validate: async () => {
          calls.push('a')
          throw new Error('x')
        },
      }),
    },
    {
      name: 'b',
      getForm: () => ({
        validate: async () => {
          calls.push('b')
        },
      }),
    },
    {
      name: 'c',
      getForm: () => ({
        validate: async () => {
          calls.push('c')
          throw new Error('x')
        },
      }),
    },
  ]
  assert.deepEqual(await tabFormUtils.collectInvalidTabs(items), ['a', 'c'])
  assert.deepEqual(calls, ['a', 'b', 'c'])
})

test('snapshotModel returns a shallow copy', async () => {
  const model = { a: 1 }
  const snapshot = tabFormUtils.snapshotModel(model)
  assert.deepEqual(snapshot, { a: 1 })
  assert.notEqual(snapshot, model)
})
