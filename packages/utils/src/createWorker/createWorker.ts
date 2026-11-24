export class CreateWorker extends Worker {
  constructor(workerFn: any) {
    const code = workerFn.toString()
    const blob = new Blob([`(${code})()`], { type: 'application/javascript' })
    const blobUrl = URL.createObjectURL(blob)
    super(blobUrl)
    URL.revokeObjectURL(blobUrl)
  }
}