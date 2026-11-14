<script setup lang="ts">
import { definePlugin, registerPlugin, VideoPlayer } from '@wapri/gplayer'
import type { PluginInput } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

type WatermarkConfig = {
  text: string
  opacity: number
}

const layerName = 'demo-watermark'

/** 自定义插件：叠加一层水印，并在右侧菜单里放一个开关 */
registerPlugin(
  definePlugin<WatermarkConfig>({
    key: 'watermark',
    label: '水印',
    defaultConfig: { text: 'wapri player', opacity: 0.35 },
    install({ art, setting }, config) {
      const mount = () => {
        art.layers.add({
          name: layerName,
          html: `<span style="padding: 2px 8px; border-radius: 4px; background: rgba(0, 0, 0, 0.35); color: #fff; font-size: 12px">${config.text}</span>`,
          style: { right: '16px', bottom: '64px', opacity: String(config.opacity) },
        })
      }

      mount()

      setting({
        html: '水印',
        icon: art.icons.config,
        switch: true,
        onSwitch: (item) => {
          const next = !item.switch

          if (next) mount()
          else art.layers.remove(layerName)

          return next
        },
      })
    },
  }),
)

/** 注册之后就能按 key 启用，setting 用来覆盖默认配置 */
const plugins: PluginInput[] = [{ key: 'watermark', setting: () => ({ text: 'wapri · 自定义插件' }) }]
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      右侧菜单里的「水印」来自 registerPlugin，设置里的文案用 setting 改成了自定义内容。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
