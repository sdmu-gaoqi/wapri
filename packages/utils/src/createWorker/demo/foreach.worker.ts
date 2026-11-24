export const forEachWorker = () => {
  self.onmessage = (event: MessageEvent<number>) => {
    const num = event.data
    let index = 0
    while(index < num) {
      index++
    }
    if(index === num) {
      self.postMessage(Date.now())
    }
  }
}
