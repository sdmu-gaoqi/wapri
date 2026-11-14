/**
 * 复制 artplayer 的内置图标。
 * 直接把 `art.icons.xxx` 塞进菜单项会把这个元素从控制条上「搬走」，所以统一先克隆。
 */
export const cloneIcon = (icon: HTMLElement) => icon.cloneNode(true) as HTMLElement
