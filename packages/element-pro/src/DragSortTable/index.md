---
title: DragSortTable 拖拽排序表格
group:
  title: 组件
  order: 2
---

# DragSortTable 拖拽排序表格

在 `ProTable` 上加行拖拽排序：`dragSortKey` 指定哪一列显示把手，拖完把新顺序交给 `onDragSortEnd`。其余 props / 事件 / 插槽与 [ProTable](/element-pros/pro-table) 完全一致。

拖拽基于 [@vue-dnd-kit/core](https://www.npmjs.com/package/@vue-dnd-kit/core)，需要 `vue >= 3.5`；组件自带 `DnDProvider`，业务不用在应用根部再包一层。

## 基础用法

`dragSortKey="sort"` 表示 `dataIndex` 为 `sort` 的那一列换成拖拽把手；松手后表格立即按新顺序展示，业务只需在 `onDragSortEnd` 里把顺序存下来。

<code src="./demo/basic.vue" title="行拖拽排序"></code>

## 自定义把手

`dragSortHandlerRender(record, index)` 的返回值替换默认图标：返回字符串按文本渲染，返回 VNode 按节点渲染。配合 `dragSortDisabled` 可以整体关掉拖拽。

<code src="./demo/custom-handle.vue" title="自定义把手与禁用"></code>

## 数据回写

拖拽只改变顺序、不重新请求：

1. 松手后组件调用 `ProTable` 的 `action.setDataSource(newDataSource)`，表格立刻按新顺序渲染；
2. 紧接着触发 `onDragSortEnd(beforeIndex, afterIndex, newDataSource)`，`newDataSource` 与表格当前顺序一致；
3. 业务在回调里把顺序保存到自己的数据（另存 `sort` 字段或直接落库），需要重新拉数据时再调 `actionRef.reload()`。

拖到表格外松手按取消处理，顺序不变、也不触发 `onDragSortEnd`。

## Props

只列新增的四个，其余同 `ProTable`。

| 属性                    | 说明                                                       | 类型                                                | 默认值 |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------- | ------ |
| `dragSortKey`           | 把手的列 `dataIndex`（单层 key），该列单元格由组件接管渲染 | `string`                                            | -      |
| `dragSortHandlerRender` | 自定义把手内容，返回值是字符串时按文本展示                 | `(record, index) => VNodeChild`                     | -      |
| `onDragSortEnd`         | 顺序变化后触发，参数为拖拽前下标、拖拽后下标、新顺序       | `(beforeIndex, afterIndex, newDataSource) => void`  | -      |
| `dragSortDisabled`      | 关闭拖拽，把手展示为禁用态                                 | `boolean`                                           | `false` |

## 说明

- 只有把手能起拖，行内的按钮、链接、行选中、展开等行为不受影响；触屏长按把手、键盘聚焦把手后按空格 + 方向键同样可以排序。
- 把手列不要设 `fixed`：`ElTable` 的固定列会复制一份行 DOM，拖拽会作用到复制出来的那一份上。
- 排序只在当前页内生效，跨页排序交给业务处理；只排一页数据时建议 `:pagination="false"`。
- 树形数据（`tableProps.treeProps`）与列表模式（`modes` 含 `list`）暂不支持拖拽。
- 给 `dragSortKey` 那一列写了同名列插槽时，插槽优先，把手不会渲染。
