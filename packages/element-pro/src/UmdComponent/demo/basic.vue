<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as Vue from 'vue'
import { UmdComponent } from '@wapri/element-pro'

/** React / ReactDOM 运行时从公共 CDN 加载；换成自己的 CDN 地址同样可用 */
const REACT_RUNTIME = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'
const REACT_DOM_RUNTIME = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'

/**
 * 下面两段是手写的 UMD 产物，运行时用 Blob 地址喂给组件，
 * 这样 demo 不依赖任何业务 CDN，接入时把 url 换成真实地址即可。
 */
const VUE_WIDGET = `
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(require('vue'))
  } else if (typeof define === 'function' && define.amd) {
    define(['vue'], factory)
  } else {
    global.WaUmdDemo = global.WaUmdDemo || {}
    global.WaUmdDemo.VueCounter = factory(global.Vue)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Vue) {
  var runtime = Vue || (typeof globalThis !== 'undefined' ? globalThis.Vue : undefined)
  var box = {
    display: 'grid',
    gap: '8px',
    padding: '16px',
    border: '1px solid #dcdfe6',
    borderRadius: '8px'
  }

  return {
    name: 'WaUmdVueCounter',
    props: {
      title: { type: String, default: 'Vue UMD 计数器' },
      step: { type: Number, default: 1 }
    },
    setup: function (props) {
      var count = runtime.ref(0)

      return function () {
        return runtime.h('div', { style: box }, [
          runtime.h('strong', null, props.title),
          runtime.h('span', null, '当前值：' + count.value),
          runtime.h(
            'button',
            { type: 'button', onClick: function () { count.value = count.value + props.step } },
            '加 ' + props.step
          )
        ])
      }
    }
  }
})
`

const REACT_WIDGET = `
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(require('react'))
  } else if (typeof define === 'function' && define.amd) {
    define(['react'], factory)
  } else {
    global.WaUmdDemo = global.WaUmdDemo || {}
    global.WaUmdDemo.ReactCounter = factory(global.React)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (React) {
  var box = {
    display: 'grid',
    gap: '8px',
    padding: '16px',
    border: '1px solid #dcdfe6',
    borderRadius: '8px'
  }

  function ReactCounter(props) {
    var state = React.useState(0)
    var count = state[0]
    var setCount = state[1]

    return React.createElement('div', { style: box }, [
      React.createElement('strong', { key: 'title' }, props.title),
      React.createElement('span', { key: 'value' }, '当前值：' + count),
      React.createElement(
        'button',
        { key: 'action', type: 'button', onClick: function () { setCount(count + props.step) } },
        '加 ' + props.step
      )
    ])
  }

  return ReactCounter
})
`

const createScriptUrl = (source: string): string => URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))

const ready = ref(false)
const vueUrls = ref<string[]>([])
const reactUrls = ref<string[]>([])
const vueStep = ref(1)
const reactStep = ref(1)
const objectUrls: string[] = []

onMounted(() => {
  // Vue 3 的 UMD 组件把 vue 声明成 external，运行时会读全局 Vue；由宿主提前挂好
  if (!('Vue' in window)) Object.assign(window, { Vue })

  const vueWidgetUrl = createScriptUrl(VUE_WIDGET)
  const reactWidgetUrl = createScriptUrl(REACT_WIDGET)

  objectUrls.push(vueWidgetUrl, reactWidgetUrl)
  vueUrls.value = [vueWidgetUrl]
  reactUrls.value = [REACT_RUNTIME, REACT_DOM_RUNTIME, reactWidgetUrl]
  ready.value = true
})

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="umd-demo">
    <section class="umd-demo__block">
      <header>
        <h4>Vue UMD</h4>
        <label>
          step
          <input
            v-model.number="vueStep"
            type="number"
            min="1"
            max="10"
          />
        </label>
      </header>
      <UmdComponent
        v-if="ready"
        :url="vueUrls"
        name="WaUmdDemo.VueCounter"
        framework="vue"
        :component-props="{ title: 'Vue UMD 计数器', step: vueStep }"
      >
        <template #loading>正在加载 Vue UMD 组件…</template>
        <template #error="{ error }">加载失败：{{ error.message }}</template>
      </UmdComponent>
    </section>

    <section class="umd-demo__block">
      <header>
        <h4>React UMD</h4>
        <label>
          step
          <input
            v-model.number="reactStep"
            type="number"
            min="1"
            max="10"
          />
        </label>
      </header>
      <UmdComponent
        v-if="ready"
        :url="reactUrls"
        name="WaUmdDemo.ReactCounter"
        framework="react"
        :timeout="30000"
        :component-props="{ title: 'React UMD 计数器', step: reactStep }"
      >
        <template #loading>正在从 CDN 加载 React 运行时…</template>
        <template #error="{ error }">加载失败：{{ error.message }}</template>
      </UmdComponent>
    </section>
  </div>
</template>

<style>
.umd-demo {
  display: grid;
  gap: 16px;
  max-width: 560px;
}

.umd-demo__block header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.umd-demo__block h4 {
  margin: 0;
  font-size: 14px;
}

.umd-demo__block input {
  width: 64px;
  margin-left: 4px;
}
</style>
