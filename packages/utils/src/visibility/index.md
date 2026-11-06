---
title: visibility
group:
  title: 基础
  order: 1
---

# visibility

可视区域观察。长列表、图片懒加载、预览按页渲染都靠它判断元素是否进入视口。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `observeVisibility(element, callback, options?)` | `(Element, VisibilityCallback, VisibilityOptions?) => () => void` | 观察元素可见性，返回取消函数 |

```ts
type VisibilityCallback = (visible: boolean, entry?: IntersectionObserverEntry) => void

interface VisibilityOptions extends IntersectionObserverInit {
  /** 首次进入视口后自动断开 */
  once?: boolean
}
```

`options` 直接透传给 `IntersectionObserver`，常用 `root`（滚动容器）、`rootMargin`（提前加载边距）、`threshold`。

不支持 `IntersectionObserver` 的环境（部分老 WebView）会立即回调 `visible = true`，由调用方降级成全量渲染。

## 示例

```ts
import { observeVisibility } from '@wapri/gutils'

const stop = observeVisibility(
  image,
  (visible) => {
    if (!visible) return

    image.src = image.dataset.src!
  },
  { rootMargin: '200px 0px', once: true },
)

// 组件卸载
stop()
```

需要共享一个 `IntersectionObserver` 观察大量元素时，建议自己维护观察池，而不是为每个元素各调一次。
