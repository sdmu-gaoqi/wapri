---
title: createWorker
toc: false
group:
  title: 通用
---

# createWorker

### 如何使用

```ts
import { CreateWorker } from '@catech-front-end-private-npm/cartech-utils'

const youngGirlWorker = () => {
  self.onmessage = (event: MessageEvent<string>) => {
    const data = event.data
    const xiaoshuai = 'youdianxiaoshuai'
    self.postMessage(data === xiaoshuai ? 'ok' : 'Get out!')
  }
}

const zhinan = new CreateWorker(youngGirlWorker)

zhinan.postMessage('Beauty, add a WeChat account')

zhinan.onMessage = (e) => {
  console.log(e)
}
```

<code src="./demo/index.vue" iframe></code>
