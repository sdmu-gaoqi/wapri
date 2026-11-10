import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const require = createRequire(import.meta.url)

/** `@wapri/gutils` 从 workspace 源码导出，测试里用等价的最小实现代替。 */
const gutilsStubSource = `
export const toPath = (value) => (Array.isArray(value) ? value.map(String) : String(value).split('.').filter(Boolean))
export function get(target, path, fallback) {
  let current = target
  for (const key of toPath(path)) {
    if (current === null || current === undefined) return fallback
    current = current[key]
  }
  return current === undefined ? fallback : current
}
export function set(target, path, value) {
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
// 必须与测试文件共用同一个 Vue 实例（ESM 入口），否则 provide / inject 会分裂成两套运行时。
const vuePath = import.meta.resolve('vue')
const elementPlus = await import(elementPlusPath)
const { ElForm, ID_INJECTION_KEY } = elementPlus

async function bundleEntry(relativePath) {
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

const fields = await bundleEntry('../src/ProFormFields/index.ts')
const fieldUtils = await bundleEntry('../src/ProFormFields/utils.ts')
const sharedFieldUtils = await bundleEntry('../src/shared/field/utils.ts')

async function render(renderer) {
  const app = createSSRApp({ render: renderer })
  app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
  return renderToString(app)
}

function form(model, children) {
  return () => h(ElForm, { model }, { default: () => children() })
}

test('reads its value from the ElForm model by name', async () => {
  // ElInput 在 SSR 里不输出 value 属性，因此用只读态断言取值结果。
  const html = await render(
    form({ username: 'alice' }, () => [h(fields.ProFormText, { name: 'username', readonly: true })]),
  )
  assert.match(html, /class="wa-ui-pro-form-field__readonly">alice</)
})

test('reads nested model paths', async () => {
  const html = await render(
    form({ profile: { nickname: 'carol' } }, () => [
      h(fields.ProFormText, { name: 'profile.nickname', readonly: true }),
    ]),
  )
  assert.match(html, /class="wa-ui-pro-form-field__readonly">carol</)
})

test('readonly renders enum text, joined range and the default placeholder', async () => {
  const model = { status: 'open', period: ['2024-03-01', '2024-03-31'], empty: undefined }
  const html = await render(
    form(model, () => [
      h(fields.ProFormSelect, { name: 'status', readonly: true, valueEnum: { open: '进行中' } }),
      h(fields.ProFormDateRangePicker, { name: 'period', readonly: true }),
      h(fields.ProFormText, { name: 'empty', readonly: true }),
    ]),
  )
  assert.match(html, /进行中/)
  assert.match(html, /2024-03-01 ~ 2024-03-31/)
  assert.match(html, /class="wa-ui-pro-form-field__readonly">-</)
})

test('readonly placeholder can be overridden with emptyText', async () => {
  const html = await render(
    form({ empty: undefined }, () => [h(fields.ProFormText, { name: 'empty', readonly: true, emptyText: '暂无' })]),
  )
  assert.match(html, /暂无/)
})

test('readonly renders booleans as 是 / 否', async () => {
  const html = await render(
    form({ enabled: true, disabledFlag: false }, () => [
      h(fields.ProFormSwitch, { name: 'enabled', readonly: true }),
      h(fields.ProFormSwitch, { name: 'disabledFlag', readonly: true }),
    ]),
  )
  assert.match(html, /class="wa-ui-pro-form-field__readonly">是</)
  assert.match(html, /class="wa-ui-pro-form-field__readonly">否</)
})

test('options win over valueEnum for readonly text', async () => {
  const html = await render(
    form({ level: 'b' }, () => [
      h(fields.ProFormSelect, {
        name: 'level',
        readonly: true,
        valueEnum: { a: '枚举 A', b: '枚举 B' },
        options: [
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
        ],
      }),
    ]),
  )
  assert.match(html, /选项 B/)
  assert.doesNotMatch(html, /枚举 B/)
})

test('renders without a form context instead of throwing', async () => {
  const html = await render(() => h(fields.ProFormText, { name: 'username', label: '用户名' }))
  assert.match(html, /el-input/)
  assert.match(html, /用户名/)
})

test('ProFormText exposes Password as a sub component', () => {
  assert.equal(typeof fields.ProFormText.Password, 'object')
  assert.equal(fields.ProFormText.Password.name, 'ProFormPassword')
  assert.equal(typeof fields.ProFormText.Password.install, 'function')
})

test('password fields render an input of type password', async () => {
  const html = await render(form({ password: 'secret' }, () => [h(fields.ProFormText.Password, { name: 'password' })]))
  assert.match(html, /type="password"/)
})

test('colProps defaults to a full row and forwards span', async () => {
  const html = await render(
    form({ a: '', b: '' }, () => [
      h(fields.ProFormText, { name: 'a' }),
      h(fields.ProFormText, { name: 'b', colProps: { span: 8 } }),
    ]),
  )
  assert.match(html, /el-col-24/)
  assert.match(html, /el-col-8/)
})

test('date value types map to the expected ElDatePicker types', async () => {
  const model = { d: '2024-03-01', dr: ['2024-03-01', '2024-03-02'] }
  const html = await render(
    form(model, () => [
      h(fields.ProFormDatePicker, { name: 'd', placeholder: '选择日期' }),
      h(fields.ProFormDateRangePicker, { name: 'dr', placeholder: '选择区间' }),
    ]),
  )
  assert.match(html, /选择日期/)
  assert.match(html, /选择区间/)
})

test('width presets become inline pixel widths', () => {
  assert.deepEqual(fieldUtils.getFieldWidthStyle('xs'), { width: '104px' })
  assert.deepEqual(fieldUtils.getFieldWidthStyle('sm'), { width: '216px' })
  assert.deepEqual(fieldUtils.getFieldWidthStyle('md'), { width: '328px' })
  assert.deepEqual(fieldUtils.getFieldWidthStyle('lg'), { width: '440px' })
  assert.deepEqual(fieldUtils.getFieldWidthStyle('xl'), { width: '552px' })
  assert.deepEqual(fieldUtils.getFieldWidthStyle(160), { width: '160px' })
  assert.equal(fieldUtils.getFieldWidthStyle(undefined), undefined)
})

test('placeholder derivation follows the value type', () => {
  assert.equal(fieldUtils.getFieldPlaceholder('select', '状态'), '请选择')
  assert.equal(fieldUtils.getFieldPlaceholder('treeSelect', '团队'), '请选择')
  assert.equal(fieldUtils.getFieldPlaceholder('cascader', '地区'), '请选择')
  assert.equal(fieldUtils.getFieldPlaceholder('date', '日期'), '请选择日期')
  assert.equal(fieldUtils.getFieldPlaceholder('dateRange', '周期'), '请选择日期')
  assert.equal(fieldUtils.getFieldPlaceholder('time', '时间'), '请选择日期时间')
  assert.equal(fieldUtils.getFieldPlaceholder('timeRange', '时段'), '请选择日期时间')
  assert.equal(fieldUtils.getFieldPlaceholder('text', '用户名'), '请输入用户名')
  assert.equal(fieldUtils.getFieldPlaceholder('text'), '请输入')
  assert.equal(fieldUtils.getFieldPlaceholder('switch', '启用'), undefined)
  assert.equal(fieldUtils.getFieldPlaceholder('text', '用户名', '自定义'), '自定义')
})

test('date value types map to picker types and value formats', () => {
  assert.equal(fieldUtils.getDatePickerType('date'), 'date')
  assert.equal(fieldUtils.getDatePickerType('dateRange'), 'daterange')
  assert.equal(fieldUtils.getDatePickerType('time'), 'datetime')
  assert.equal(fieldUtils.getDatePickerType('timeRange'), 'datetimerange')
  assert.equal(fieldUtils.getDatePickerType('text'), undefined)
  assert.equal(fieldUtils.getDateValueFormat('date'), 'YYYY-MM-DD')
  assert.equal(fieldUtils.getDateValueFormat('time'), 'YYYY-MM-DD HH:mm:ss')
  assert.equal(fieldUtils.isDateValueType('dateRange'), true)
  assert.equal(fieldUtils.isDateValueType('select'), false)
})

test('options convert into the shared value enum shape', () => {
  assert.equal(fieldUtils.optionsToValueEnum([]), undefined)
  assert.deepEqual(
    fieldUtils.optionsToValueEnum([
      { label: '选项 A', value: 'a', disabled: true },
      { label: '父级', value: 'p', children: [{ label: '子级', value: 'c' }] },
    ]),
    [
      { text: '选项 A', value: 'a', disabled: true, children: undefined },
      {
        text: '父级',
        value: 'p',
        disabled: undefined,
        children: [{ text: '子级', value: 'c', disabled: undefined, children: undefined }],
      },
    ],
  )
})

test('value enum parsing keeps the ProTable behaviour', () => {
  assert.deepEqual(sharedFieldUtils.getValueEnumOptions({ open: '未解决' }), [{ value: 'open', text: '未解决' }])
  assert.deepEqual(sharedFieldUtils.getValueEnumOptions({ 1: '一' }), [{ value: 1, text: '一' }])
  assert.deepEqual(
    sharedFieldUtils.toTreeOptions([{ text: '父', value: 'p', children: [{ text: '子', value: 'c' }] }]),
    [
      {
        label: '父',
        value: 'p',
        disabled: undefined,
        children: [{ label: '子', value: 'c', disabled: undefined, children: undefined }],
      },
    ],
  )
  assert.deepEqual(
    sharedFieldUtils
      .findEnumPath([{ text: '父', value: 'p', children: [{ text: '子', value: 'c' }] }], 'c')
      .map((item) => item.value),
    ['p', 'c'],
  )
})

test('required rules reach ElFormItem so validate() can cover the field', async () => {
  const html = await render(
    form({ username: '' }, () => [
      h(fields.ProFormText, {
        name: 'username',
        label: '用户名',
        rules: [{ required: true, message: '请输入用户名' }],
      }),
    ]),
  )
  assert.match(html, /is-required/)
  assert.match(html, /aria-required="true"|required/)
})

test('the required prop also marks the form item', async () => {
  const html = await render(
    form({ username: '' }, () => [h(fields.ProFormText, { name: 'username', label: '用户名', required: true })]),
  )
  assert.match(html, /is-required/)
})

test('form level rules reach the field through its prop', async () => {
  const app = createSSRApp({
    render: () =>
      h(
        ElForm,
        { model: { username: '' }, rules: { username: [{ required: true, message: '请输入用户名' }] } },
        { default: () => [h(fields.ProFormText, { name: 'username', label: '用户名' })] },
      ),
  })
  app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
  const html = await renderToString(app)
  assert.match(html, /is-required/)
})

test('formatCellValue covers empty, enum depth, ranges and booleans', () => {
  assert.equal(sharedFieldUtils.formatCellValue(undefined), '-')
  assert.equal(sharedFieldUtils.formatCellValue(undefined, false), '')
  assert.equal(sharedFieldUtils.formatCellValue(undefined, '暂无'), '暂无')
  assert.equal(
    sharedFieldUtils.formatCellValue('c', '-', [{ text: '父', value: 'p', children: [{ text: '子', value: 'c' }] }]),
    '父 / 子',
  )
  assert.equal(sharedFieldUtils.formatCellValue(['a', 'b'], '-'), 'a ~ b')
  assert.equal(sharedFieldUtils.formatCellValue(true), '是')
  assert.equal(sharedFieldUtils.formatCellValue(false), '否')
})
