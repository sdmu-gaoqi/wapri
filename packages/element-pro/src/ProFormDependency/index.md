---
title: ProFormDependency 字段联动
group:
  title: 表单
  order: 3
---

# ProFormDependency 字段联动

字段联动容器。用 `names` 声明要读取的字段，作用域插槽拿到它们的值，用来控制渲染或选项。

```vue | pure
<ProFormDependency
  :names="['type']"
  v-slot="{ type }"
>
  <ProFormText
    v-if="type === 'custom'"
    name="customName"
    label="自定义名称"
  />
</ProFormDependency>
```

插槽参数的键名就是 `names` 里写的字符串，支持 `'profile.level'` 这样的点分路径。

隐藏不清值：依赖值变化导致字段不再渲染时，`model` 中的既有值保持不变。

## 基础用法

`type` 切换时渲染不同字段；`province` 变化时切换城市的可选项。

<code src="./demo/basic.vue" title="基础用法"></code>

## 在数组字段内使用

放在 `ProFormList` 行内时读到的是当前行的值。

<code src="./demo/in-list.vue" title="在数组字段内使用"></code>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `names` | `string[]` | 必填 | 依赖的字段路径列表，每个元素是一个路径。 |

`names` 与字段组件的 `name` 不同：`name` 是一个路径（数组形式是路径分段），`names` 是多个路径。

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `Record<string, unknown>` | 键名与 `names` 中的书写一致。 |

## 相关组件

- 表单容器：[ProForm](/element-pros/pro-form)
- 字段组件：[ProFormFields](/element-pros/pro-form-fields)
- 数组字段：[ProFormList](/element-pros/pro-form-list)
