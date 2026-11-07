import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
  type VNodeChild,
} from 'vue'
import { useConfig } from '../ConfigProvider/context'
import { loadAssets, normalizeUrls, withTimeout } from './loader'
import { assertReactRuntime, mountReactComponent, type ReactMountHandle } from './react'
import { detectFramework, isVuePlugin, resolveComponent } from './resolve'
import type {
  UmdComponentErrorPayload,
  UmdComponentLoadPayload,
  UmdComponentPropValues,
  UmdComponentStatus,
  UmdFramework,
  UmdFrameworkOption,
} from './types'
import './styles/index.scss'

interface UmdResolved {
  framework: UmdFramework
  component: unknown
}

export default defineComponent({
  name: 'UmdComponent',
  props: {
    url: { type: [String, Array] as PropType<string | string[]>, required: true },
    name: { type: String, required: true },
    framework: { type: String as PropType<UmdFrameworkOption>, default: 'auto' },
    componentProps: { type: Object as PropType<UmdComponentPropValues>, default: () => ({}) },
    css: { type: [String, Array] as PropType<string | string[]>, default: () => [] },
    timeout: { type: Number, default: 15000 },
    tag: { type: String, default: 'div' },
  },
  emits: {
    load: (_payload: UmdComponentLoadPayload): boolean => true,
    error: (_payload: UmdComponentErrorPayload): boolean => true,
  },
  setup(props, { emit, slots, expose }) {
    const { prefix } = useConfig()
    const base = computed(() => `${prefix.value}-umd-component`)
    const urls = computed(() => normalizeUrls(props.url))
    const styles = computed(() => normalizeUrls(props.css))
    /** 样式表在前、脚本在后，统一交给 loadResource 按后缀分流 */
    const assets = computed(() => [...styles.value, ...urls.value])
    const remoteProps = computed<UmdComponentPropValues>(() => props.componentProps ?? {})

    const status = ref<UmdComponentStatus>('idle')
    const error = ref<Error>()
    const resolved = shallowRef<UmdResolved>()
    const reactTarget = ref<HTMLElement>()

    let reactHandle: ReactMountHandle | undefined
    let loadToken = 0

    function fail(reason: unknown): void {
      const failure = reason instanceof Error ? reason : new Error(String(reason))
      error.value = failure
      status.value = 'error'
      resolved.value = undefined
      emit('error', { error: failure, url: assets.value })
    }

    function destroyReact(): void {
      reactHandle?.destroy()
      reactHandle = undefined
    }

    /** React 由自己管理容器，Vue 组件直接进 render 函数，这里只同步 React 侧。 */
    function syncReact(): void {
      const target = reactTarget.value
      const current = resolved.value

      if (!target || !current || current.framework !== 'react') {
        destroyReact()
        return
      }

      if (reactHandle && reactHandle.target === target && reactHandle.component === current.component) {
        reactHandle.update(remoteProps.value)
        return
      }

      destroyReact()
      try {
        reactHandle = mountReactComponent(target, current.component, remoteProps.value)
      } catch (reason) {
        reactHandle = undefined
        fail(reason)
      }
    }

    async function load(): Promise<void> {
      const token = (loadToken += 1)
      destroyReact()
      resolved.value = undefined
      error.value = undefined
      status.value = 'loading'

      try {
        await withTimeout(
          loadAssets(assets.value),
          props.timeout,
          `[element-pro] UMD 资源加载超时：${assets.value.join('、')}`,
        )
        if (token !== loadToken) return

        const component = resolveComponent(props.name)
        if (component === undefined || component === null) {
          throw new Error(`[element-pro] 未找到 UMD 全局变量：${props.name}`)
        }

        const framework = props.framework === 'auto' ? detectFramework(component) : props.framework
        if (framework === 'react') assertReactRuntime()
        if (framework === 'vue' && isVuePlugin(component)) {
          throw new Error(`[element-pro] ${props.name} 是 Vue 插件而不是组件，请用点号指向具体组件`)
        }

        resolved.value = { framework, component }
        status.value = 'ready'
        emit('load', { framework, component })
      } catch (reason) {
        if (token !== loadToken) return
        fail(reason)
      }
    }

    // 用内容做 key：宿主每次渲染都传新数组时不会无谓地重新加载
    const assetKey = computed(() => assets.value.join('\n'))

    watch([assetKey, () => props.name, () => props.framework], () => {
      void load()
    })
    watch([resolved, reactTarget], syncReact, { flush: 'post' })
    watch(remoteProps, syncReact, { flush: 'post', deep: true })

    onMounted(() => {
      void load()
    })
    onBeforeUnmount(() => {
      loadToken += 1
      destroyReact()
    })

    const currentFramework = computed(() => resolved.value?.framework)
    const currentComponent = computed(() => resolved.value?.component)

    expose({ reload: load, framework: currentFramework, component: currentComponent })

    return () => {
      const className = base.value
      const current = resolved.value
      const children: VNodeChild[] = []

      if (status.value === 'ready' && current) {
        children.push(
          current.framework === 'vue'
            ? h(current.component as Component, remoteProps.value)
            : h('div', { ref: reactTarget, class: `${className}__react` }),
        )
      } else if (status.value === 'error') {
        const payload: UmdComponentErrorPayload = {
          error: error.value ?? new Error('[element-pro] UMD 组件加载失败'),
          url: assets.value,
        }
        children.push(slots.error?.(payload) ?? h('div', { class: `${className}__error` }, payload.error.message))
      } else {
        children.push(slots.loading?.() ?? h('div', { class: `${className}__loading` }, '加载中…'))
      }

      return h(props.tag, { class: className }, children)
    }
  },
})
