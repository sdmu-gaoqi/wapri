import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createRenderer, h, nextTick, ref } from 'vue'

const require = createRequire(import.meta.url)

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

const elementPlusDir = path.dirname(require.resolve('element-plus/package.json'))
const elementPlusPath = pathToFileURL(path.join(elementPlusDir, 'es/index.mjs')).href
const vuePath = import.meta.resolve('vue')

const bundle = await build({
  configFile: false,
  logLevel: 'silent',
  plugins: [gutilsStub, vue()],
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/StepsForm/index.ts', import.meta.url)), formats: ['es'] },
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

const stepsFormModule = await import(
  `data:text/javascript;base64,${Buffer.from(bundle[0].output.find((item) => item.type === 'chunk').code).toString('base64')}`
)
const fieldsModule = await build({
  configFile: false,
  logLevel: 'silent',
  plugins: [gutilsStub, vue()],
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/ProFormFields/index.ts', import.meta.url)), formats: ['es'] },
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
}).then(
  (result) =>
    import(
      `data:text/javascript;base64,${Buffer.from(result[0].output.find((item) => item.type === 'chunk').code).toString('base64')}`
    ),
)

const elementPlus = await import(elementPlusPath)
const stepsFormUtils = await build({
  configFile: false,
  logLevel: 'silent',
  plugins: [gutilsStub, vue()],
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/StepsForm/utils.ts', import.meta.url)), formats: ['es'] },
    rollupOptions: { external: ['vue', 'element-plus'] },
  },
}).then(
  (result) =>
    import(
      `data:text/javascript;base64,${Buffer.from(result[0].output.find((item) => item.type === 'chunk').code).toString('base64')}`
    ),
)
const { StepsForm, StepsFormStep } = stepsFormModule
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
  /** Element Plus 的 `useOrderedChildren` 直接读 DOM 属性，这里补一个只读视图。 */
  get parentNode() {
    return this.parent
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
  closest() {
    return null
  }
}

globalThis.Element = HostNode

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

function texts(root) {
  const hits = []
  walk(root, (node) => {
    if (node.type === '#text' && String(node.text).trim()) hits.push(String(node.text).trim())
  })
  return hits
}

const classTokens = (value) => {
  const raw = Array.isArray(value) ? value.join(' ') : String(value ?? '')
  return raw.split(/\s+/).filter(Boolean)
}

const hasClass = (node, token) => classTokens(node.props.class).includes(token)

function steps(root) {
  const hits = []
  walk(root, (node) => {
    if (hasClass(node, 'wa-ui-steps-form__step')) hits.push(node)
  })
  return hits
}

function panels(root) {
  const hits = []
  walk(root, (node) => {
    if (hasClass(node, 'wa-ui-steps-form__panel')) hits.push(node)
  })
  return hits
}

const buildSteps = (options = {}) =>
  h(
    StepsForm,
    { ref: options.formRef, ...options.stepsFormProps },
    {
      default: () => [
        h(
          StepsFormStep,
          { name: 'project', title: '项目信息', initialValues: options.projectValues },
          { default: () => [h(ProFormText, { name: 'projectName' })] },
        ),
        h(
          StepsFormStep,
          { name: 'owner', title: '负责人', initialValues: options.ownerValues },
          { default: () => [h(ProFormText, { name: 'ownerName' })] },
        ),
        h(StepsFormStep, { name: 'note', title: '备注' }, { default: () => [h(ProFormText, { name: 'remark' })] }),
      ],
    },
  )

test('renders one step per StepForm in declaration order', async (t) => {
  const root = mount(t, () => buildSteps())
  await nextTick()
  assert.equal(steps(root).length, 3)
  assert.deepEqual(
    texts(root).filter((text) => ['项目信息', '负责人', '备注'].includes(text)),
    ['项目信息', '负责人', '备注'],
  )
})

test('next and prev move between steps without losing visibility control', async (t) => {
  const formRef = ref()
  mount(t, () => buildSteps({ formRef }))
  await nextTick()
  assert.equal(formRef.value.current, 0)
  assert.equal(await formRef.value.next(), true)
  assert.equal(formRef.value.current, 1)
  formRef.value.prev()
  await nextTick()
  assert.equal(formRef.value.current, 0)
})

test('steps beyond the first stay mounted but hidden', async (t) => {
  const formRef = ref()
  const root = mount(t, () => buildSteps({ formRef }))
  await nextTick()
  const all = panels(root)
  assert.equal(all.length, 3)
  assert.notEqual(all[0].style.display, 'none')
  assert.equal(all[1].style.display, 'none')
  assert.equal(all[2].style.display, 'none')
})

test('submit merges every step model and resets afterwards', async (t) => {
  const formRef = ref()
  const received = []
  mount(t, () =>
    buildSteps({
      formRef,
      projectValues: { projectName: '青禾项目', shared: '第一步' },
      ownerValues: { ownerName: '张三', shared: '第二步' },
      stepsFormProps: {
        onFinish: (values) => {
          received.push(values)
        },
      },
    }),
  )
  await nextTick()

  assert.deepEqual(formRef.value.getAllFieldsValue(), {
    projectName: '青禾项目',
    ownerName: '张三',
    shared: '第二步',
  })

  await formRef.value.submit()
  assert.equal(received.length, 1)
  assert.deepEqual(received[0], { projectName: '青禾项目', ownerName: '张三', shared: '第二步' })
  assert.equal(formRef.value.current, 0)
})

test('initialValues only fill keys that are still empty', async () => {
  const { applyInitialValues } = stepsFormUtils
  const model = { a: 'keep' }
  applyInitialValues(model, { a: 'override', b: 'fill' })
  assert.deepEqual(model, { a: 'keep', b: 'fill' })
})

test('submit keeps the current step when onFinish returns false', async (t) => {
  const formRef = ref()
  mount(t, () => buildSteps({ formRef, stepsFormProps: { onFinish: () => false } }))
  await nextTick()
  assert.equal(await formRef.value.submit(), false)
  assert.equal(formRef.value.current, 0)
})

test('next on the last step behaves like submit', async (t) => {
  const formRef = ref()
  const received = []
  mount(t, () => buildSteps({ formRef, stepsFormProps: { onFinish: (values) => received.push(values) } }))
  await nextTick()
  await formRef.value.next()
  await formRef.value.next()
  assert.equal(formRef.value.current, 2)
  assert.equal(await formRef.value.next(), true)
  assert.equal(received.length, 1)
})

test('allowStepSelect controls clicking a step', async (t) => {
  const selectableRef = ref()
  const lockedRef = ref()
  const selectableRoot = mount(t, () =>
    buildSteps({ formRef: selectableRef, stepsFormProps: { allowStepSelect: true } }),
  )
  const lockedRoot = mount(t, () => buildSteps({ formRef: lockedRef }))
  await nextTick()
  steps(selectableRoot)[2].props.onClick?.()
  await nextTick()
  assert.equal(selectableRef.value.current, 2)
  steps(lockedRoot)[2].props.onClick?.()
  await nextTick()
  assert.equal(lockedRef.value.current, 0)
})

test('submitter false hides every built-in button', async (t) => {
  const root = mount(t, () => buildSteps({ stepsFormProps: { submitter: false } }))
  await nextTick()
  const buttons = []
  walk(root, (node) => {
    if (hasClass(node, 'wa-ui-steps-form__actions')) buttons.push(node)
  })
  assert.equal(buttons.length, 0)
})

test('duplicate step names keep the first registration and warn', async (t) => {
  const formRef = ref()
  const warnings = []
  const original = console.warn
  console.warn = (message) => warnings.push(String(message))
  t.after(() => {
    console.warn = original
  })
  const root = mount(t, () =>
    h(
      StepsForm,
      { ref: formRef },
      {
        default: () => [
          h(StepsFormStep, { name: 'same', title: '第一个' }, { default: () => [] }),
          h(StepsFormStep, { name: 'same', title: '第二个' }, { default: () => [] }),
        ],
      },
    ),
  )
  await nextTick()
  assert.equal(steps(root).length, 1)
  assert.equal(texts(root).includes('第一个'), true)
  assert.equal(
    warnings.some((message) => message.includes('重复')),
    true,
  )
})

test('a step whose onFinish returns false blocks the transition', async (t) => {
  const formRef = ref()
  mount(t, () =>
    h(
      StepsForm,
      { ref: formRef },
      {
        default: () => [
          h(StepsFormStep, { name: 'project', title: '项目', onFinish: () => false }, { default: () => [] }),
          h(StepsFormStep, { name: 'owner', title: '负责人' }, { default: () => [] }),
        ],
      },
    ),
  )
  await nextTick()
  assert.equal(await formRef.value.next(), false)
  assert.equal(formRef.value.current, 0)
})

test('StepsForm exposes StepForm as a registered sub component', async () => {
  assert.equal(typeof StepsForm.StepForm, 'object')
  assert.equal(StepsForm.StepForm.name, 'StepsFormStep')
  assert.equal(typeof StepsForm.StepForm.install, 'function')
  assert.equal(StepsForm.StepForm, StepsFormStep)
})

test('mergeStepValues keeps the later step value for the same key', async () => {
  const { mergeStepValues } = stepsFormUtils
  assert.deepEqual(mergeStepValues([{ a: 1, b: 2 }, { b: 3 }]), { a: 1, b: 3 })
})
