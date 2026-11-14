import type Artplayer from 'artplayer'
import type { Setting, SettingOption } from 'artplayer'
import { packageName } from '../constant'
import { builtinPlugins } from '../plugins'
import { createCssFilterStack } from './cssFilter'
import { createFrameRenderer } from './frame'
import type { FrameRenderer } from '../types/frame'
import type {
  BuiltinPluginKey,
  CssFilterStack,
  PluginConfig,
  PluginConfigMap,
  PluginContext,
  PluginDefinition,
  PluginEntry,
  PluginInput,
  PluginSetting,
  ResolvedPlugin,
} from '../types/plugin'

/** 注册表：内置插件在模块初始化时播种，避免依赖副作用导入（包是 sideEffects: false） */
const registry = new Map<string, PluginDefinition>(builtinPlugins.map((plugin) => [plugin.key, plugin]))

/** 注册插件；同 key 覆盖已有定义 */
export const registerPlugin = (definition: PluginDefinition) => {
  registry.set(definition.key, definition)

  return definition
}

/** 声明插件，仅做类型推导，运行时原样返回 */
export const definePlugin = <T extends PluginConfig>(definition: PluginDefinition<T>) => definition

/**
 * 生成插件条目。
 * `key` 命中内置插件时，`setting` 的入参带该插件的完整配置类型，可以直接读字段。
 */
export const pluginEntry = <K extends BuiltinPluginKey>(
  key: K,
  setting?: PluginSetting<PluginConfigMap[K]>,
): PluginEntry => ({ key, setting: setting as unknown as PluginSetting })

/** 按 key 取插件定义 */
export const getPlugin = (key: string) => registry.get(key)

/** 当前已注册的插件列表 */
export const listPlugins = () => [...registry.values()]

const normalizeEntry = (input: PluginInput): PluginEntry => (typeof input === 'string' ? { key: input } : input)

/**
 * 把 `plugins` 入参解析成待安装列表。
 * 同一个 key 只保留一份，后出现的配置覆盖先出现的；未知 key 警告后跳过。
 */
export const resolvePlugins = (inputs: PluginInput[] = []): ResolvedPlugin[] => {
  const resolved = new Map<string, ResolvedPlugin>()

  inputs.forEach((input) => {
    const entry = normalizeEntry(input)
    const definition = registry.get(entry.key)

    if (!definition) {
      console.warn(`[${packageName}] 未注册的插件：${entry.key}`)
      return
    }

    // 条目上的 setting 入参是各插件的具体配置，注册表里统一按通用配置处理
    const setting = entry.setting
    // 浅拷贝一份，避免插件改到注册表里的默认配置
    const config = setting
      ? { ...definition.defaultConfig, ...setting({ ...definition.defaultConfig }) }
      : { ...definition.defaultConfig }

    resolved.set(entry.key, { definition, config })
  })

  return [...resolved.values()]
}

/**
 * 生成可以交给 `option.plugins` 的函数列表，以及统一的清理函数。
 * artplayer 只在构造时读一次 `plugins`，运行期没有卸载能力，所以清理交给这里。
 */
export const createPluginRunner = (plugins: ResolvedPlugin[]) => {
  const cleanups: Array<() => void> = []

  // 帧渲染器与 filter 合成栈按实例共享，多个插件读写的是同一份
  let frameRenderer: FrameRenderer | undefined
  let cssFilter: CssFilterStack | undefined

  const sharedFrame = (art: Artplayer) => {
    frameRenderer ??= createFrameRenderer(art)

    return frameRenderer
  }

  const sharedCssFilter = (art: Artplayer) => {
    cssFilter ??= createCssFilterStack(art)

    return cssFilter
  }

  const runners = plugins.map(({ definition, config }) => (art: Artplayer) => {
    const context: PluginContext = {
      art,
      // artplayer 的 setting.add 运行时返回菜单项，类型声明却写成了 setting 组件本身
      setting: (option: Setting) => art.setting.add(option) as unknown as SettingOption,
      onCleanup: (cleanup) => {
        cleanups.push(cleanup)
      },
      get frame() {
        return sharedFrame(art)
      },
      get cssFilter() {
        return sharedCssFilter(art)
      },
    }

    definition.install(context, config)
  })

  const dispose = () => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
    frameRenderer?.dispose()
    frameRenderer = undefined
    cssFilter?.clear()
    cssFilter = undefined
  }

  return { plugins: runners, dispose }
}
