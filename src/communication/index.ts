import { v4 as uuid } from "uuid"
import { ClientInfo } from "./types"

class Communication {
    private clientInfo: ClientInfo = {
        name: "",
        id: "",
        token: "",
    }
    private worker: SharedWorker | undefined = undefined
    private onmessage: (event: MessageEvent) => void
    constructor(onmessage: (event: MessageEvent) => void) {
        this.onmessage = onmessage
    }

    public start(token: string) {
        // todo 关闭已开启的连接
        this.worker = new SharedWorker("worker.js")
        const port = this.worker.port
        this.clientInfo.name = uuid()
        this.clientInfo.id = ""
        this.clientInfo.token = token
        port.postMessage(this.clientInfo)
        port.onmessage = (event) => {
            const data = event.data as ClientInfo
            if (data.name !== this.clientInfo.name) {
                console.log("worker：name参数错误 - ", this.clientInfo.name, data.name)
                return
            }
            if (!data.id) {
                console.log("worker：id参数错误", data.id)
                return
            }
            this.clientInfo.name = data.name
            this.clientInfo.id = data.id
            console.log(this.clientInfo)
        }
        port.start()
    }

    public send(data: any) {
        if (this.worker === undefined) {
            // todo
            console.log("worker未开启")
            return
        }
        this.worker.port.postMessage(data)
    }

    public close() {
        // todo
    }
}