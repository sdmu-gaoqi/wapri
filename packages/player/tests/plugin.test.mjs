import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const require = createRequire(import.meta.url)

// 插件与注册表是纯 TS，不需要 SFC；artplayer 走真实依赖，gbase 只用到 downloadBlob
const bundle = await build({
  configFile: false,
  logLevel: 'silent',
  resolve: {
    alias: {
      '@wapri/gbase': fileURLToPath(new URL('../../@base/src/download.ts', import.meta.url)),
    },
  },
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/core/registry.ts', import.meta.url)), formats: ['es'] },
    rollupOptions: {
      external: ['artplayer'],
      output: { paths: (id) => pathToFileURL(require.resolve(id)).href },
    },
  },
})

const entry = bundle[0].output.find((item) => item.type === 'chunk').code
const { createPluginRunner, getPlugin, listPlugins, pluginEntry, registerPlugin, resolvePlugins } = await import(
  `data:text/javascript;base64,${Buffer.from(entry).toString('base64')}`
)

// 插件在浏览器里才会碰 document，这里给一个最小桩
globalThis.document = {
  pictureInPictureEnabled: true,
  visibilityState: 'visible',
  addEventListener: () => {},
  removeEventListener: () => {},
}

const createElement = () => ({ cloneNode: () => ({}) })

/** 只实现插件用到的那部分 Artplayer 接口 */
const createMockArt = () => {
  const settings = []
  const listeners = {}

  const art = {
    currentTime: 0,
    playbackRate: 1,
    aspectRatio: 'default',
    flip: 'normal',
    pip: false,
    playing: false,
    video: { style: {}, loop: false },
    icons: {
      playbackRate: createElement(),
      aspectRatio: createElement(),
      flip: createElement(),
      screenshot: createElement(),
      pip: createElement(),
      config: createElement(),
    },
    i18n: { get: (key) => key },
    notice: { show: '' },
    layers: { add: () => undefined, remove: () => undefined },
    setting: {
      add: (option) => {
        const item = { ...option }
        settings.push(item)
        return item
      },
    },
    on: (name, fn) => {
      listeners[name] = [...(listeners[name] ?? []), fn]
    },
    off: (name, fn) => {
      listeners[name] = (listeners[name] ?? []).filter((item) => item !== fn)
    },
    emit: () => {},
  }

  return { art, settings, listeners }
}

/** 安装单个插件，返回上下文里的 mock 与清理函数 */
const install = (key, plugins = [key]) => {
  const { art, settings, listeners } = createMockArt()
  const runner = createPluginRunner(resolvePlugins(plugins))

  runner.plugins.forEach((plugin) => plugin(art))

  return { art, settings, listeners, dispose: runner.dispose }
}

test('内置插件一共 7 个，key 与右侧菜单一一对应', () => {
  assert.equal(listPlugins().length, 7)
  assert.deepEqual(
    listPlugins()
      .map((plugin) => plugin.key)
      .sort(),
    ['abLoop', 'aspectRatio', 'filter', 'flip', 'pip', 'playbackRate', 'screenshot'],
  )
})

test('字符串写法走默认配置，对象写法覆盖默认配置', () => {
  const [byString] = resolvePlugins(['screenshot'])

  assert.equal(byString.definition.key, 'screenshot')
  assert.deepEqual(byString.config, getPlugin('screenshot').defaultConfig)

  const [byObject] = resolvePlugins([{ key: 'playbackRate', setting: () => ({ rates: [1, 2] }) }])

  assert.deepEqual(byObject.config.rates, [1, 2])
  // 未覆盖的字段沿用默认值
  assert.equal(byObject.config.defaultRate, getPlugin('playbackRate').defaultConfig.defaultRate)
})

test('setting 收到的是完整默认配置', () => {
  let received

  resolvePlugins([
    {
      key: 'filter',
      setting: (config) => {
        received = config
        return {}
      },
    },
  ])

  assert.equal(received.min, getPlugin('filter').defaultConfig.min)
  assert.equal(received.max, getPlugin('filter').defaultConfig.max)
})

test('同一个 key 只安装一次，后出现的配置生效', () => {
  const resolved = resolvePlugins(['flip', { key: 'flip', setting: () => ({ modes: ['normal'] }) }])

  assert.equal(resolved.length, 1)
  assert.deepEqual(resolved[0].config.modes, ['normal'])
})

test('未注册的 key 跳过并给警告', () => {
  const original = console.warn
  const warns = []

  console.warn = (message) => warns.push(message)

  try {
    const resolved = resolvePlugins(['not-exists', 'pip'])

    assert.equal(resolved.length, 1)
    assert.equal(resolved[0].definition.key, 'pip')
    assert.equal(warns.length, 1)
    assert.match(warns[0], /not-exists/)
  } finally {
    console.warn = original
  }
})

test('pluginEntry 生成的条目同样能被解析', () => {
  const [resolved] = resolvePlugins([pluginEntry('playbackRate', (config) => ({ rates: config.rates.slice(0, 2) }))])

  assert.equal(resolved.config.rates.length, 2)
})

test('自定义插件注册后可被 key 启用', () => {
  const definition = {
    key: 'watermark',
    label: '水印',
    defaultConfig: { text: 'wapri' },
    install({ setting }) {
      setting({ html: '水印' })
    },
  }

  registerPlugin(definition)

  assert.equal(getPlugin('watermark'), definition)

  const { settings } = install('watermark')

  assert.equal(settings.length, 1)
  assert.equal(settings[0].html, '水印')
})

test('倍速插件写入 playbackRate 并回写副标题', () => {
  const { art, settings } = install('playbackRate')
  const [menu] = settings

  assert.equal(menu.selector.length, 6)
  assert.equal(menu.selector.filter((item) => item.default).length, 1)

  const subtitle = menu.onSelect({ value: 1.5 })

  assert.equal(art.playbackRate, 1.5)
  assert.equal(subtitle, '1.5x')
})

test('画面比例与翻转写入对应属性', () => {
  assert.equal(install('aspectRatio').art.aspectRatio, 'default')
  assert.equal(install('flip').art.flip, 'normal')

  const ratio = install('aspectRatio')
  ratio.settings[0].onSelect({ value: '4:3' })
  assert.equal(ratio.art.aspectRatio, '4:3')

  const flip = install('flip')
  const subtitle = flip.settings[0].onSelect({ value: 'horizontal' })
  assert.equal(flip.art.flip, 'horizontal')
  assert.equal(subtitle, 'Horizontal')
})

test('画中画开关返回真实状态并同步浏览器侧变化', () => {
  const { art, settings, listeners } = install('pip')
  const [menu] = settings

  assert.equal(menu.switch, false)
  assert.equal(menu.onSwitch(menu), true)
  assert.equal(art.pip, true)

  // 用户从浏览器原生控件退出画中画
  art.pip = false
  listeners.pip.forEach((fn) => fn(false))
  assert.equal(menu.switch, false)
})

test('AB 循环按 A-B 区间回跳，清除后不再回跳', () => {
  const { art, settings, listeners } = install('abLoop')
  const [menu] = settings

  art.currentTime = 3
  const startTip = menu.onSelect({ value: 'start' })

  art.currentTime = 6
  const endTip = menu.onSelect({ value: 'end' })

  assert.equal(startTip, '00:03 - --:--')
  assert.equal(endTip, '00:03 - 00:06')

  art.currentTime = 6
  listeners['video:timeupdate'].forEach((fn) => fn())
  assert.equal(art.currentTime, 3)

  menu.onSelect({ value: 'clear' })
  art.currentTime = 8
  listeners['video:timeupdate'].forEach((fn) => fn())
  assert.equal(art.currentTime, 8)
})

test('画面调节写入 filter，重置与卸载都会还原', () => {
  const { art, settings, dispose } = install('filter')
  const [brightness] = settings

  assert.match(art.video.style.filter, /brightness\(100%\)/)

  brightness.onChange({ $range: { value: '150' } })
  assert.match(art.video.style.filter, /brightness\(150%\)/)

  const reset = settings[settings.length - 1]
  reset.onClick()
  assert.match(art.video.style.filter, /brightness\(100%\)/)

  dispose()
  assert.equal(art.video.style.filter, '')
})

test('清理回调在 dispose 时统一执行', () => {
  const { listeners, dispose } = install('abLoop')

  assert.equal(listeners['video:timeupdate'].length, 1)

  dispose()

  assert.equal(listeners['video:timeupdate'].length, 0)
})
