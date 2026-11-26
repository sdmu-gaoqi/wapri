declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

/** 组件里的样式是副作用导入，这里声明一下让 TS 认这条路 */
declare module '*.css'
