import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'
import { effectScope, reactive } from 'vue'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/shared/overlayForm/useOverlayForm.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const moduleSource = compiled.replace(
  "from 'vue'",
  `from '${pathToFileURL(require.resolve('vue/dist/vue.runtime.esm-bundler.js')).href}'`,
)
const { useOverlayForm } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`)

function setup(t, overrides = {}, valid = true) {
  const scope = effectScope()
  t.after(() => scope.stop())
  const props = reactive({ open: true, model: { name: '测试' }, ...overrides })
  const events = []
  const form = scope.run(() => useOverlayForm(props, (...args) => events.push(args)))
  let resets = 0
  form.formRef.value = {
    validate: async () => {
      if (!valid) throw new Error('invalid')
      return true
    },
    resetFields: () => {
      resets += 1
    },
    clearValidate: () => {},
  }
  return { props, events, form, resets: () => resets }
}

test('valid submission awaits save and requests close', async (t) => {
  let saved
  const { form, events, props } = setup(t, {
    onFinish: async (values) => {
      saved = values
      return true
    },
  })
  assert.equal(await form.submit(), true)
  assert.equal(saved, props.model)
  assert.deepEqual(
    events.map(([name]) => name),
    ['finish', 'update:open'],
  )
  assert.equal(events[1][1], false)
  assert.equal(form.submitting.value, false)
})

test('validation failure does not save or close', async (t) => {
  const { form, events } = setup(t, { onFinish: () => assert.fail('must not save') }, false)
  assert.equal(await form.submit(), false)
  assert.deepEqual(events, [])
  assert.equal(form.submitting.value, false)
})

test('false result preserves form; rejection emits error and unlocks retry', async (t) => {
  const error = new Error('save failed')
  const { props, form, events } = setup(t, { onFinish: () => false })
  assert.equal(await form.submit(), false)
  assert.deepEqual(events, [])
  props.onFinish = async () => {
    throw error
  }
  assert.equal(await form.submit(), false)
  assert.deepEqual(events, [['finishFailed', error]])
  assert.equal(form.submitting.value, false)
  assert.equal(props.model.name, '测试')
  props.onFinish = () => true
  assert.equal(await form.submit(), true)
})

test('pending save blocks duplicate submissions and cancellation', async (t) => {
  let resolve
  let calls = 0
  const pending = new Promise((done) => {
    resolve = done
  })
  const { form, events } = setup(t, {
    onFinish: () => {
      calls += 1
      return pending
    },
  })
  const submission = form.submit()
  assert.equal(await form.submit(), false)
  form.cancel()
  assert.deepEqual(events, [])
  resolve(true)
  assert.equal(await submission, true)
  assert.equal(calls, 1)
})

test('save completion cannot close a reopened session', async (t) => {
  let resolve
  const pending = new Promise((done) => {
    resolve = done
  })
  const { props, form, events } = setup(t, { onFinish: () => pending })
  const submission = form.submit()
  await Promise.resolve()
  await Promise.resolve()
  props.open = false
  props.open = true
  resolve(true)
  assert.equal(await submission, false)
  assert.deepEqual(events, [])
})

test('cancel emits close, reset only runs when enabled and still closed', (t) => {
  const { props, form, events, resets } = setup(t)
  form.cancel()
  assert.deepEqual(events, [['cancel'], ['update:open', false]])
  props.open = false
  form.closed()
  assert.equal(resets(), 0)
  props.resetOnClose = true
  form.closed()
  assert.equal(resets(), 1)
  props.open = true
  form.closed()
  assert.equal(resets(), 1)
})
