# Spec Delta

## ADDED Requirements

### Requirement: 直接替换当前数据

`ProTable` SHALL 通过 `ActionType.setDataSource(data)` 允许外部直接替换当前页数据，用于拖拽排序等需要即时回写顺序、又不重新请求的场景。

#### Scenario: 回写顺序后立即生效

- **WHEN** 调用 `actionRef.setDataSource(newRows)`
- **THEN** 表格按 `newRows` 的顺序立即重新渲染
- **AND** 不触发新的请求，也不改变当前分页页码与每页条数

#### Scenario: 不影响总数

- **WHEN** `newRows` 的长度与替换前不同
- **THEN** 分页总数保持不变，由调用方通过 `setPageInfo` 自行维护

#### Scenario: 受控选中回放

- **WHEN** 表格存在受控的 `rowSelection.selectedRowKeys`
- **THEN** 替换数据后已选行的选中态按原有逻辑回放
