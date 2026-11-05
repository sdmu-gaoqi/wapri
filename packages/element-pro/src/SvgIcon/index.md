---
title: SvgIcon 图标
group:
  title: 基础
  order: 0
---

# SvgIcon 图标

`SvgIcon` 渲染页面里的 SVG `<symbol>` 图标，`name` 既可以是 symbol 的完整名称，也可以省略 `icon-` 前缀。

图标集从哪来由使用方决定：组件不内置任何图标地址，需要时通过 `src` 或 `ConfigProvider` 的 `iconfont` 传入图标集脚本地址（例如 Iconfont 导出的 symbol 集合）；两者都没传时只读取页面里已经存在的 `<symbol>`，不发起任何网络请求。

<code src="./demo/basic.vue" title="基础用法"></code>

点击示例中的任意图标即可复制对应的 `<SvgIcon />` 代码。

## Props

| 属性  | 类型              | 默认值 | 说明                                                                                   |
| ----- | ----------------- | ------ | -------------------------------------------------------------------------------------- |
| name  | string            | —      | 必填。symbol 名，如 `card` 或 `icon-card`。                                            |
| size  | string / number   | `1em`  | 图标宽高；数字按 px 处理。                                                             |
| color | string / string[] | —      | 单个颜色覆盖全部 path；数组按 path 顺序赋色，长度不足时复用最后一个颜色。               |
| src   | string            | —      | 图标集脚本地址；优先于 `ConfigProvider` 的 `iconfont`。不传则不加载任何外部图标源。     |

```vue | pure
<SvgIcon name="card" color="#409eff" />
<SvgIcon
  name="idcard"
  :color="['#409eff', '#67c23a']"
/>
```

全局指定一次图标源：

```vue | pure
<ConfigProvider iconfont="https://cdn.example.com/iconfont.js">
  <SvgIcon name="card" />
</ConfigProvider>
```

未传 `color` 时保留 symbol 原始颜色。可传入原生 SVG 属性，例如 `aria-label="身份证"` 会把图标声明为可访问图片；未传标签时图标默认作为装饰元素对读屏器隐藏。
