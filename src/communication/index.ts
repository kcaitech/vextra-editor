import { v4 as uuid } from "uuid"
import {
    ClientPostData,
    CmdResult,
    CommunicationInfo,
    DataType,
    CmdStatus,
    TunnelType,
    WorkerPostData
} from "./types"

export class Communication {
    protected info: CommunicationInfo
    protected worker: SharedWorker | undefined = undefined
    protected _onmessage: (data: any) => void = () => {}
    protected pendingCmdList = new Map<string, {
        cmd: any,
        promise: Promise<any>,
        resolve: (value: any) => void,
    }>()
    protected receivingData: WorkerPostData | undefined = undefined

    constructor(tunnelType: TunnelType, firstData?: any) {
        this.info = {
            name: "",
            id: "",
            token: "",
            tunnelType: tunnelType,
            data: firstData,
        }
    }

    protected setOnMessage(onmessage: (data: any) => void) {
        this._onmessage = onmessage
        return this
    }

    public async start(token: string): Promise<boolean> {
        // todo 关闭已开启的连接
        this.worker = new SharedWorker("worker.js")
        const port = this.worker.port
        this.info.name = uuid()
        this.info.id = ""
        this.info.token = token
        return await new Promise<boolean>(resolve => {
            port.onmessage = (event) => {
                const data = event.data as CommunicationInfo
                if (data.name !== this.info.name) {
                    console.log("worker：name参数错误", this.info.name, data.name)
                    resolve(false)
                    return
                }
                if (!data.id) {
                    console.log("worker：返回id为空")
                    resolve(false)
                    return
                }
                this.info.name = data.name
                this.info.id = data.id
                port.onmessage = this.receiveFromWorker.bind(this)
                resolve(true)
                console.log("通道建立", this.info.id)
            }
            port.start()
            port.postMessage(this.info)
        })
    }

    protected receiveFromWorker(event: MessageEvent) {
        const data = event.data as WorkerPostData
        const isBinary = (data as any) instanceof ArrayBuffer
        if (isBinary && this.receivingData === undefined) {
            console.log("数据传输错误：缺少数据头")
            return
        }
        if (!isBinary && this.receivingData !== undefined) {
            console.log("数据传输错误：缺少数据段")
            this.receivingData = undefined
        }
        if (isBinary) {
            this._onmessage(data)
            this.receivingData = undefined
            return
        }
        if (data.isListened) {
            const cmdId = data.cmdId
            if (cmdId === undefined) {
                console.log("isListened为true时，cmdId不能为空")
                return
            }
            if (!this.pendingCmdList.has(cmdId)) return;
            const dataData = data.data as CmdResult
            const cmd = this.pendingCmdList.get(cmdId)
            cmd!.resolve({
                status: dataData.status ?? CmdStatus.Fail,
                message: dataData.message,
                data: dataData.data,
            })
            return
        }
        if (data.dataType === DataType.Text) {
            this._onmessage(data.data)
        } else if (data.dataType === DataType.Binary) {
            this.receivingData = data
        } else {
            console.log("数据类型错误", data.dataType)
        }
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
            let resolve: (value: CmdResult) => void = () => {}
            const promise: Promise<CmdResult> = new Promise(r => resolve = r)
            this.pendingCmdList.set(postData.cmdId!, {
                cmd: postData,
                promise: promise,
                resolve: resolve,
            })
        }
    }

    protected async getCmdResult(cmdId: string): Promise<any> {
        if (!this.pendingCmdList.has(cmdId)) return;
        const cmd = this.pendingCmdList.get(cmdId)
        const result = await cmd!.promise
        this.pendingCmdList.delete(cmdId)
        return result
    }

    public close() {
        console.log("通道关闭", this.info.id)
        this.worker?.port.postMessage({
            dataType: DataType.Text,
            close: true,
        } as ClientPostData)
        this.worker?.port.close()
    }
}