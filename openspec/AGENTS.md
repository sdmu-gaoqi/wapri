# OpenSpec 工作流（本仓库）

本目录是 OpenSpec 规范驱动工作流。**先写提案，后写代码。** 未归档的 change 是「正在讨论的方案」，`openspec/specs/` 是「已经成立的事实」。

与根目录 `AGENTS.md` 冲突时，以根目录 `AGENTS.md` 为准；本文件只管流程。

## 目录约定

```
openspec/
├── project.md                     # 项目事实：技术栈、约定、约束
├── AGENTS.md                      # 本文件：流程
├── specs/                         # 已生效的能力规范（每个能力一份 spec.md）
│   └── <capability>/spec.md
└── changes/
    ├── <change-id>/               # 一个变更 = 一个目录，kebab-case
    │   ├── proposal.md            # 为什么做、改什么、影响面
    │   ├── tasks.md               # 可勾选的实施清单
    │   ├── design.md              # 可选：技术决策与取舍
    │   └── specs/
    │       └── <capability>/spec.md  # delta：只写本次增删改的需求
    └── archive/                   # 已完成的变更，按日期归档
```

## 一次 change 的生命周期

1. **确定能力名**：能力是「用户可感知的行为边界」，不是包名堆叠。新包一般对应一个能力，例如 `preview`。
2. **写 `proposal.md`**：必须是 `## Why` / `## What Changes` / `## Impact` 三段。Impact 写清 affected specs 与 affected code（真实路径）。
3. **写 delta spec**：`changes/<id>/specs/<capability>/spec.md`，只用四种标题块：`## ADDED Requirements`、`## MODIFIED Requirements`、`## REMOVED Requirements`、`## RENAMED Requirements`。
4. **写 `tasks.md`**：按阶段分节，任务编号 `- [ ] N.M 描述`，一条任务只做一件事，能独立验证。
5. **需要取舍时写 `design.md`**：`## Context`、`## Goals / Non-Goals`、`## Decisions`、`## Risks / Trade-offs`、`## Migration Plan`、`## Open Questions`。
6. **实施时一次只做一个任务**：完成后立刻把 `- [ ]` 改成 `- [x]`，不批量勾选。
7. **校验**：`openspec validate <change-id> --strict`（CLI 可用时）；无 CLI 时人工核对下面的「格式硬要求」。
8. **归档**：实施与校验通过后 `openspec archive <change-id>`，delta 合并进 `openspec/specs/<capability>/spec.md`（ADDED 追加、MODIFIED 替换、REMOVED 删除），目录移入 `changes/archive/YYYY-MM-DD-<change-id>/`。

## 格式硬要求

- Requirement 标题固定 `### Requirement: <名称>`，正文用 `SHALL` / `MUST` 陈述系统行为，一条需求只讲一件事。
- 每条需求至少一个场景：`#### Scenario: <名称>`，场景体只用 `- **WHEN** ...`、`- **THEN** ...`、`- **AND** ...` 三件套，可判定、可复现。
- 不写「实现细节规范」：`design.md` 放方案，`spec.md` 只放外部可观察行为。
- delta 里不复制未改动的既有需求；未改动的内容留在 `openspec/specs/`。
- 场景里出现的命令、路径、包名必须是本仓库真实存在的写法（例如 `pnpm --filter @wapri/preview build`）。

## 与仓库规范的衔接

- 新增包 → `openspec/project.md` 的包表、根 `AGENTS.md` 的 Repository Map、`docs/guide.md`、`.dumirc.ts`、`docs/changelog/<pkg>.md`、changeset，六处都要登记。
- 文档路由按 `atomDirs.type` 复数化：`preview` → `/previews`。
- 不在 change 里顺手重构无关代码；范围外的改进另开 change。
- 不提交、不推送、不开 PR。

## CLI

```bash
npx -y openspec@latest list                 # 查看进行中的 change
npx -y openspec@latest validate <change> --strict
npx -y openspec@latest archive <change>
```

CLI 是可选工具，不写入 `package.json` 依赖；仓库内文件结构本身就是可用产物。
