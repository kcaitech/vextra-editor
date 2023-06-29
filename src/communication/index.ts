import { v4 as uuid } from "uuid"
import { ClientPostData, CommunicationInfo, DataType, TunnelType } from "./types"

class Communication {
    private info: CommunicationInfo
    private worker: SharedWorker | undefined = undefined
    private onmessage: (data: any) => void
    private pendingCmdList = new Map<string, {
        cmd: any,
        promise: Promise<any>,
        resolve: (value: any) => void,
    }>()

    constructor(tunnelType: TunnelType, onmessage: (data: any) => void) {
        this.info = {
            name: "",
            id: "",
            token: "",
            tunnelType: tunnelType,
        }
        this.onmessage = onmessage
    }

    public async start(token: string): Promise<boolean> {
        // todo 关闭已开启的连接
        this.worker = new SharedWorker("worker.js")
        const port = this.worker.port
        this.info.name = uuid()
        this.info.id = ""
        this.info.token = token
        port.postMessage(this.info)
        port.start()
        return await new Promise<boolean>(resolve => {
            port.onmessage = (event) => {
                const data = event.data as CommunicationInfo
                if (data.name !== this.info.name) {
                    console.log("worker：name参数错误 - ", this.info.name, data.name)
                    resolve(false)
                    return
                }
                if (!data.id) {
                    console.log("worker：id参数错误", data.id)
                    resolve(false)
                    return
                }
                this.info.name = data.name
                this.info.id = data.id
                port.onmessage = (event: MessageEvent) => {
                    this.onmessage(event.data)
                }
                resolve(true)
            }
        })
    }

    public async send(data: any, isListened?: boolean) {
        if (this.worker === undefined) {
            // todo
            console.log("worker未开启")
            return
        }
        let postData: ClientPostData = {
            cmdId: uuid(),
            isListened: isListened ?? false,
            dataType: data instanceof ArrayBuffer ? DataType.Binary : DataType.Text,
        }
        if (!(data instanceof ArrayBuffer)) postData.data = data;
        this.worker.port.postMessage(postData)
        if (data instanceof ArrayBuffer) this.worker.port.postMessage(data, [data]);
        if (isListened) {

        }
    }

    async getCmdResult(cmdId: string): Promise<any> {
        if (!this.pendingCmdList.has(cmdId)) return;
        const cmd = this.pendingCmdList.get(cmdId)
        this.pendingCmdList.delete(cmdId)
        return await cmd!.promise
    }

    public close() {
        // todo
    }
}

const communication = new Communication(TunnelType.DocOp, data => {
    console.log(data)
})
communication.start(localStorage.getItem("token") ?? "")