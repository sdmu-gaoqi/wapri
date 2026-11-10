# Spec Delta

## ADDED Requirements

### Requirement: 比例按钮文案可覆盖

`CropperUpload` / `CropperDialog` SHALL 允许调用方用 `ratioLabels` 覆盖比例按钮的默认文案，与 `ratios` 按下标一一对应。

#### Scenario: 覆盖自由比例文案

- **WHEN** 传入 `ratios: [1, 0]` 与 `ratioLabels: ['1:1', '自定义']`
- **THEN** 比例按钮依次显示「1:1」与「自定义」
- **AND** 选中的是第二项时，尺寸提示展示「自由比例」

#### Scenario: 不传 ratioLabels

- **WHEN** 只传 `ratios: [1, 4/3, 0]`
- **THEN** 按钮依次显示「1:1」「4:3」「自由」
- **AND** 与既有行为一致

#### Scenario: 文案少于比例项

- **WHEN** 传入 `ratios: [1, 4/3]` 与 `ratioLabels: ['正方形']`
- **THEN** 第一项显示「正方形」
- **AND** 第二项回退为自动生成的「4:3」
