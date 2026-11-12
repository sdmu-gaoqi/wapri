# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供统一的拖拽排序能力：表格按行排序、上传列表按项排序，两者共用同一套拖拽底座（`@vue-dnd-kit/core`）、同一套手柄与落点回写语义。

## ADDED Requirements

### Requirement: 表格行拖拽排序

`DragSortTable` SHALL 在 `ProTable` 基础上提供行级拖拽排序，且只有 `dragSortKey` 列的手柄能起拖。

#### Scenario: 按 dragSortKey 渲染拖拽手柄

- **WHEN** `columns` 中存在 `dataIndex` 等于 `dragSortKey` 的列
- **THEN** 该列单元格渲染拖拽手柄，默认是 `Sort` 图标
- **AND** 手柄之外的区域不能起拖，行内的按钮、链接、行选中行为保持原样

#### Scenario: 自定义手柄

- **WHEN** 传入 `dragSortHandlerRender(record, index)`
- **THEN** 手柄单元格渲染该函数的返回值
- **AND** 返回值是字符串时按文本渲染，是 VNode 时按节点渲染

#### Scenario: dragSortKey 列不存在

- **WHEN** `columns` 中没有列的 `dataIndex` 等于 `dragSortKey`
- **THEN** 组件在开发环境给出警告
- **AND** 不渲染任何手柄，拖拽不生效，其它功能不受影响

#### Scenario: 拖拽结束后回写顺序

- **WHEN** 用户把第 1 行拖到第 3 行放手
- **THEN** 表格按新顺序立即展示
- **AND** 触发 `onDragSortEnd(0, 2, newDataSource)`
- **AND** `newDataSource` 与表格当前展示顺序一致

#### Scenario: 拖出表格范围

- **WHEN** 拖动过程中指针移出表格并放手
- **THEN** 本次拖拽取消，顺序保持原样
- **AND** 不触发 `onDragSortEnd`

#### Scenario: 不属于自己的 provider

- **WHEN** `DragSortTable` 渲染在已有 `DnDProvider` 的页面中
- **THEN** 表格使用自己的 provider，拖拽不会与页面上其它拖拽区域互相串扰

#### Scenario: 禁用拖拽

- **WHEN** `dragSortDisabled` 为 `true`
- **THEN** 手柄展示为禁用态且不能起拖
- **AND** 键盘与触屏同样不能起拖

### Requirement: 上传列表拖拽排序

`CropperUpload` SHALL 在 `sortable` 为 `true` 时允许拖拽调整上传列表的顺序。

#### Scenario: 拖拽调整图片顺序

- **WHEN** 上传列表中有三张图片，`sortable` 为 `true`，用户拖动第 3 张到第 1 张之前放手
- **THEN** 列表按新顺序展示
- **AND** 受控用法触发 `update:fileList`，非受控用法的内部列表同步更新

#### Scenario: 默认不排序

- **WHEN** 未传 `sortable`
- **THEN** 列表项不可拖拽，行为与之前完全一致

#### Scenario: 排序不影响上传链路

- **WHEN** 用户先调整顺序，再继续上传或删除文件
- **THEN** `beforeUpload`、裁剪、`remove` 等原有链路按上传后的列表正常执行
- **AND** 排序只改变列表项顺序，不重新上传文件

### Requirement: 拖拽底座

两个组件 SHALL 以 `@vue-dnd-kit/core` 为唯一拖拽实现，并对使用方隐藏 provider 细节。

#### Scenario: 开箱即用

- **WHEN** 业务页面没有包 `DnDProvider`
- **THEN** `DragSortTable` 与 `CropperUpload` 仍能正常拖拽

#### Scenario: 触摸与键盘

- **WHEN** 在触屏设备上长按手柄，或用键盘聚焦手柄后按空格再按方向键
- **THEN** 同样可以完成排序
