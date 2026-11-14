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

// 默认插件列表是组件的默认值来源，单独打一份出来断言
const constantBundle = await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    write: false,
    minify: false,
    lib: { entry: fileURLToPath(new URL('../src/constant/index.ts', import.meta.url)), formats: ['es'] },
  },
})

const constantEntry = constantBundle[0].output.find((item) => item.type === 'chunk').code
const { defaultPlayerPlugins } = await import(
  `data:text/javascript;base64,${Buffer.from(constantEntry).toString('base64')}`
)

const createElementStub = () => ({
  style: {},
  className: '',
  textContent: '',
  src: '',
  alt: '',
  muted: false,
  loop: false,
  autoplay: false,
  playsInline: false,
  classList: { add: () => undefined },
  appendChild: () => undefined,
  remove: () => undefined,
  setAttribute: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 }),
  play: () => Promise.resolve(),
})

// 插件在浏览器里才会碰 document / window，这里给一个最小桩
globalThis.document = {
  pictureInPictureEnabled: true,
  visibilityState: 'visible',
  head: { querySelector: () => null, appendChild: () => undefined },
  createElement: createElementStub,
  addEventListener: () => {},
  removeEventListener: () => {},
}

globalThis.window = {
  devicePixelRatio: 1,
  setTimeout: (...args) => setTimeout(...args),
  clearTimeout: (...args) => clearTimeout(...args),
  addEventListener: () => {},
  removeEventListener: () => {},
}

const createElement = () => ({ cloneNode: () => ({}) })

/** 只实现插件用到的那部分 Artplayer 接口 */
const createMockArt = () => {
  const settings = []
  const listeners = {}

  const player = createElementStub()

  const art = {
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    aspectRatio: 'default',
    flip: 'normal',
    pip: false,
    fullscreenWeb: false,
    playing: false,
    video: { style: {}, loop: false, getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 }) },
    icons: {
      playbackRate: createElement(),
      aspectRatio: createElement(),
      flip: createElement(),
      screenshot: createElement(),
      pip: createElement(),
      config: createElement(),
      fullscreenWebOff: createElement(),
    },
    i18n: { get: (key) => key },
    notice: { show: '' },
    template: { $player: player },
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
    once: (name, fn) => {
      listeners[name] = [...(listeners[name] ?? []), fn]
    },
    emit: () => {},
    pause: () => undefined,
    play: () => Promise.resolve(),
  }

  return { art, settings, listeners }
}

/** 安装插件，返回上下文里的 mock 与清理函数 */
const install = (key, plugins = [key]) => {
  const { art, settings, listeners } = createMockArt()
  const runner = createPluginRunner(resolvePlugins(plugins))

  runner.plugins.forEach((plugin) => plugin(art))

  return { art, settings, listeners, dispose: runner.dispose }
}

test('内置插件一共 18 个，key 与右侧菜单一一对应', () => {
  assert.equal(listPlugins().length, 18)
  assert.deepEqual(
    listPlugins()
      .map((plugin) => plugin.key)
      .sort(),
    [
      'abLoop',
      'aspectRatio',
      'backgroundBlur',
      'blur',
      'chromaKey',
      'filter',
      'flip',
      'intro',
      'mosaic',
      'overlay',
      'pip',
      'playbackRate',
      'reverse',
      'screenshot',
      'stabilizer',
      'vertical',
      'videoFilter',
      'webFullscreen',
    ],
  )
})

test('默认插件为画面调节、截图、网页全屏、马赛克、模糊、绿幕', () => {
  assert.deepEqual(defaultPlayerPlugins, ['filter', 'screenshot', 'webFullscreen', 'mosaic', 'blur', 'chromaKey'])
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

test('画面调节与视频滤镜共用 filter 合成栈，互不覆盖', () => {
  const { art, settings, dispose } = install('filter-video-filter', ['filter', 'videoFilter'])

  const brightness = settings[0]

  brightness.onChange({ $range: { value: '120' } })
  assert.match(art.video.style.filter, /brightness\(120%\)/)

  // 预设选择行的 selector 有 9 项，画面调节的滑杆行没有 selector
  const selectorItem = settings.find((item) => Array.isArray(item.selector) && item.selector.length > 1)
  assert.ok(selectorItem)

  const subtitle = selectorItem.onSelect({ value: 'mono' })
  assert.equal(subtitle, '黑白')
  assert.match(art.video.style.filter, /grayscale\(1\)/)
  assert.match(art.video.style.filter, /brightness\(120%\)/)

  dispose()
  assert.equal(art.video.style.filter, '')
})

test('网页全屏开关切换 fullscreenWeb 并同步状态', () => {
  const { art, settings, listeners } = install('webFullscreen')
  const [menu] = settings

  assert.equal(menu.switch, false)
  assert.equal(menu.onSwitch(menu), true)
  assert.equal(art.fullscreenWeb, true)

  art.fullscreenWeb = false
  listeners.fullscreenWeb.forEach((fn) => fn(false))
  assert.equal(menu.switch, false)
})

test('画面类插件给出开关与滑杆两行', () => {
  const cases = [
    ['mosaic', 2],
    ['blur', 2],
    ['backgroundBlur', 2],
    ['stabilizer', 2],
  ]

  cases.forEach(([key, count]) => {
    const { settings } = install(key)

    assert.equal(settings.length, count, key)
    assert.equal(typeof settings[0].onSwitch, 'function', key)
    assert.equal(typeof settings[1].onChange, 'function', key)
  })
})

test('效果插件拖滑杆会自动打开开关', () => {
  const { settings } = install('mosaic')
  const [menu, range] = settings

  assert.equal(menu.switch, false)
  range.onChange({ $range: { value: '32' } })
  assert.equal(menu.switch, true)
})

test('视频滤镜提供 9 个预设，强度写进副标题', () => {
  const { settings } = install('videoFilter')
  const [preset, intensity] = settings

  assert.equal(preset.selector.length, 9)
  assert.equal(preset.selector.filter((item) => item.default).length, 1)

  const subtitle = intensity.onChange({ $range: { value: '0.5' } })
  assert.equal(subtitle, '50%')
})

test('绿幕提供取色、相似度与羽化，滑杆自动启用', () => {
  const { settings } = install('chromaKey')
  const [menu, pick, similarity] = settings

  assert.equal(menu.switch, false)
  assert.equal(pick.tooltip, '#00ff00')

  similarity.onChange({ $range: { value: '0.5' } })
  assert.equal(menu.switch, true)
})

test('竖屏插件改写画面比例，关闭后还原', () => {
  const { art, settings } = install('vertical')
  const [menu] = settings

  assert.equal(art.aspectRatio, 'default')

  // artplayer 会把返回值写回菜单项的 switch 状态，这里手动同步
  menu.switch = menu.onSwitch(menu)
  assert.equal(art.aspectRatio, '9:16')

  menu.switch = menu.onSwitch(menu)
  assert.equal(art.aspectRatio, 'default')
})

test('倒放注册 play 监听，清理后移除', () => {
  const { listeners, dispose } = install('reverse')

  assert.equal(listeners.play.length, 1)

  dispose()

  assert.equal(listeners.play.length, 0)
})

test('开场动画与视频叠加的菜单可用', () => {
  const intro = install('intro')

  assert.equal(intro.settings.length, 1)
  assert.equal(typeof intro.settings[0].onClick, 'function')

  const overlay = install('overlay')

  // 开关、透明度、大小、重置位置
  assert.equal(overlay.settings.length, 4)
  assert.equal(overlay.settings[0].switch, false)
})

test('清理回调在 dispose 时统一执行', () => {
  const { listeners, dispose } = install('abLoop')

  assert.equal(listeners['video:timeupdate'].length, 1)

  dispose()

  assert.equal(listeners['video:timeupdate'].length, 0)
})
