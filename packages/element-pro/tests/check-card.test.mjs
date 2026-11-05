import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createRenderer, h, nextTick, ref } from 'vue'

const require = createRequire(import.meta.url)
const bundle = await build({
  configFile: false,
  logLevel: 'silent',
  plugins: [vue()],
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/CheckCard/index.ts', import.meta.url)), formats: ['es'] },
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: { paths: (id) => pathToFileURL(require.resolve(id)).href },
    },
  },
})
const { CheckCard, CheckCardGroup } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle[0].output.find((item) => item.type === 'chunk').code).toString('base64')}`
)

class HostNode {
  constructor(type, text = '') {
    this.type = type
    this.text = text
    this.children = []
    this.props = {}
    this.parent = null
  }
  closest() {
    return ['button', 'input', 'a'].includes(this.type) ? this : null
  }
}
// The renderer uses lightweight host nodes, without adding a DOM dependency.
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
  patchProp: (node, key, previous, value) => {
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
  app.mount(root)
  t.after(() => app.unmount())
  return root
}
function cards(root) {
  return root.children.flatMap((node) => (node.props.role === 'checkbox' ? [node] : cards(node)))
}
async function click(node, target = node) {
  node.props.onClick({ target, currentTarget: node })
  await nextTick()
}

test('standalone defaults toggle and controlled values remain controlled', async (t) => {
  const checked = ref(false)
  const changes = []
  const root = mount(t, () =>
    h('div', [
      h(CheckCard, { defaultChecked: true, title: 'A' }),
      h(CheckCard, { checked: checked.value, onChange: (value) => changes.push(value) }),
    ]),
  )
  await click(cards(root)[0])
  assert.equal(cards(root)[0].props['aria-checked'], false)
  await click(cards(root)[1])
  assert.deepEqual(changes, [true])
  assert.equal(cards(root)[1].props['aria-checked'], false)
  checked.value = true
  await nextTick()
  assert.equal(cards(root)[1].props['aria-checked'], true)
})

test('single group supports zero, empty string, cancellation and external reset', async (t) => {
  const value = ref(null)
  const root = mount(t, () =>
    h(CheckCardGroup, {
      'modelValue': value.value,
      'onUpdate:modelValue': (next) => {
        value.value = next
      },
      'options': [0, ''],
    }),
  )
  await click(cards(root)[0])
  assert.equal(value.value, 0)
  await click(cards(root)[1])
  assert.equal(value.value, '')
  assert.equal(cards(root)[0].props['aria-checked'], false)
  await click(cards(root)[1])
  assert.equal(value.value, null)
  value.value = 0
  await nextTick()
  assert.equal(cards(root)[0].props['aria-checked'], true)
})

test('multiple selection preserves initial array and blocks disabled items', async (t) => {
  const initial = ['a']
  const changes = []
  const root = mount(t, () =>
    h(CheckCardGroup, {
      multiple: true,
      defaultValue: initial,
      onChange: (value) => changes.push(value),
      options: ['a', 'b', { value: 'c', disabled: true }],
    }),
  )
  await click(cards(root)[1])
  assert.deepEqual(changes.at(-1), ['a', 'b'])
  await click(cards(root)[0])
  assert.deepEqual(changes.at(-1), ['b'])
  await click(cards(root)[2])
  assert.equal(changes.length, 2)
  assert.deepEqual(initial, ['a'])
})

test('group disabled cannot be overridden; missing values are disabled', async (t) => {
  const disabled = ref(true)
  const root = mount(t, () =>
    h(CheckCardGroup, { disabled: disabled.value }, () => [
      h(CheckCard, { value: 'a', disabled: false }),
      h(CheckCard, { title: 'no value' }),
    ]),
  )
  await click(cards(root)[0])
  assert.equal(cards(root)[0].props['aria-checked'], false)
  disabled.value = false
  await nextTick()
  await click(cards(root)[0])
  assert.equal(cards(root)[0].props['aria-checked'], true)
  assert.equal(cards(root)[1].props.tabindex, -1)
})

test('interactive descendants do not toggle, keyboard toggles focused card', async (t) => {
  const root = mount(t, () => h(CheckCard, { title: 'A' }))
  const card = cards(root)[0]
  await click(card, new HostNode('button'))
  assert.equal(card.props['aria-checked'], false)
  const event = { target: card, currentTarget: card, key: ' ', preventDefault() {} }
  for (const handler of card.props.onKeydown) handler(event)
  await nextTick()
  assert.equal(card.props['aria-checked'], true)
})

test('install registers both named components and exposes Group', () => {
  const registered = []
  CheckCard.install({ component: (name) => registered.push(name) })
  assert.deepEqual(registered, ['CheckCard', 'CheckCardGroup'])
  assert.equal(CheckCard.Group, CheckCardGroup)
})

test('form disabled and group change validation use Element Plus context', async (t) => {
  const { formContextKey, formItemContextKey } = require('element-plus')
  const { provide, reactive } = await import('vue')
  const form = reactive({ disabled: true })
  const validations = []
  const host = {
    setup() {
      provide(formContextKey, form)
      provide(formItemContextKey, {
        validate: async (trigger) => {
          validations.push(trigger)
          throw new Error('invalid')
        },
      })
      return () => h(CheckCardGroup, { options: ['a'] })
    },
  }
  const root = mount(t, () => h(host))
  await click(cards(root)[0])
  assert.deepEqual(validations, [])
  form.disabled = false
  await nextTick()
  await click(cards(root)[0])
  assert.deepEqual(validations, ['change'])
  assert.equal(cards(root)[0].props['aria-checked'], true)
})
