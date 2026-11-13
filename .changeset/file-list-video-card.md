---
'@wapri/element-pro': minor
---

`FileList` 卡片识别为视频时改用 `<video>` 展示 `previewUrl` 首帧，`abbreviateUrl` 作为封面（`poster`）；首帧失败退回封面，封面失败降级为文件图标。
