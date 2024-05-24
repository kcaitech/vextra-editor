import { v4 as uuid } from "uuid"
import {
    ClientPostData,
    CmdResult,
    CommunicationInfo,
    DataType,
    CmdStatus,
    TunnelType,
    WorkerPostData,
    TunnelTypeStr
} from "./types"
import * as communication from "./communication"

declare const COMMUNICATION_WORKER_URL: string

// let enabledWorker = typeof SharedWorker !== "undefined"
let enabledWorker = false

export class Communication {
    private info: CommunicationInfo
    private worker: SharedWorker | undefined = undefined
    private channel: MessageChannel | undefined = undefined
    protected onMessage: (data: any) => void = () => {}
    protected onClose: () => void = () => {}
    private isClosed: boolean = false
    private pendingCmdList = new Map<string, {
        cmd: any,
        promise: Promise<any>,
        resolve: (value: any) => void,
    }>()
    private receivingData: WorkerPostData | undefined = undefined
    private isStarted: boolean = false
    private startPromise?: Promise<boolean>

    constructor(tunnelType: TunnelType, firstData?: any) {
        this.info = {
            name: "",
            id: "",
            token: "",
            tunnelType: tunnelType,
            data: firstData,
        }
    }

    public enableWorker() {
        enabledWorker = true
    }

    public disableWorker() {
        enabledWorker = false
    }

    private get port() {
        return enabledWorker ? this.worker?.port : this.channel?.port1
    }

    public async start(token: string, retryCount: number = 0): Promise<boolean> {
        if (this.isStarted) return true;
        if (this.isClosed) return false;
        if (this.startPromise) return this.startPromise;

        // console.log("this.enabledWorker", enabledWorker)
        if (enabledWorker) {
            this.worker = new SharedWorker(COMMUNICATION_WORKER_URL)
            this.channel = undefined
        } else {
            this.channel = new MessageChannel()
            this.worker = undefined
            communication.newConnect(this.channel.port2)
        }

        const port = this.port!
        this.info.name = uuid()
        this.info.id = ""
        this.info.token = token

        console.log("开始建立通道", TunnelTypeStr[this.info.tunnelType], this.info.id)
        this.startPromise = new Promise<boolean>(resolve => {
            port.onmessage = (event) => {
                const data = event.data as CommunicationInfo
                if (data.name !== this.info.name) {
                    console.log("worker：name参数错误", this.info.name, data.name)
                    resolve(false)
                    this.startPromise = undefined
                    return
                }
                if (!data.id) {
                    console.log("worker：返回id为空")
                    resolve(false)
                    this.startPromise = undefined
                    return
                }
                this.info.name = data.name
                this.info.id = data.id
                port.onmessage = this.receiveFromWorker.bind(this)
                this.isStarted = true
                resolve(true)
                this.startPromise = undefined
                console.log("通道建立", TunnelTypeStr[this.info.tunnelType], this.info.id)
            }

            port.start()
            port.postMessage(this.info)

            setTimeout(() => {
                if (!this.startPromise) return;
                console.log("通道建立超时", TunnelTypeStr[this.info.tunnelType], this.info.id)
                resolve(false)
                this.startPromise = undefined
            }, 3000)
        })

        const res = await this.startPromise
        if (res) return true;
        if (retryCount > 0) return false;

        this.disableWorker()
        return this.start(token, retryCount++)
    }

    private receiveFromWorker(event: MessageEvent) {
        const data = event.data as WorkerPostData
        if (data.close) {
            this.close(false)
            return
        }
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
            this.onMessage(data)
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
            this.onMessage(data.data)
        } else if (data.dataType === DataType.Binary) {
            this.receivingData = data
        } else {
            console.log("数据类型错误", data.dataType)
        }
    }

    public async send(data: any, isListened: boolean = false, timeout: number = -1): Promise<boolean> {
        if (this.isClosed) return false;
        if (this.startPromise) await this.startPromise;
        if (!this.isStarted || !this.port) {
            console.log("通道未启动")
            return false
        }
        const postData: ClientPostData = {
            cmdId: uuid(),
            isListened: isListened,
            dataType: data instanceof ArrayBuffer ? DataType.Binary : DataType.Text,
        }
        if (!(data instanceof ArrayBuffer)) postData.data = data;
        this.port.postMessage(postData)
        if (data instanceof ArrayBuffer) this.port.postMessage(data, [data]);
        if (isListened) {
            let resolve: (value: CmdResult) => void = () => {}
            const promise: Promise<CmdResult> = new Promise(r => resolve = r)
            this.pendingCmdList.set(postData.cmdId!, {
                cmd: postData,
                promise: promise,
                resolve: resolve,
            })
            const result: CmdResult | undefined = await this.getCmdResult(postData.cmdId!, timeout)
            return result?.status === CmdStatus.Success
        }
        return true
    }

    private async getCmdResult(cmdId: string, timeout: number): Promise<any> {
        if (!this.pendingCmdList.has(cmdId)) return;
        const cmd = this.pendingCmdList.get(cmdId)
        const task = [cmd!.promise]
        if (timeout > 0) {
            task.push(new Promise<void>(resolve => setTimeout(() => resolve(), timeout)))
        }
        const result = await Promise.any(task)
        this.pendingCmdList.delete(cmdId)
        return result
    }

    public close(closePeer = true) {
        if (this.isClosed) return;
        console.log("通道关闭", TunnelTypeStr[this.info.tunnelType], this.info.id)
        if (closePeer) {
            this.port?.postMessage({
                dataType: DataType.Text,
                close: true,
            } as ClientPostData)
        }
        this.port?.close()
        this.onClose()
        this.isClosed = true
    }
}