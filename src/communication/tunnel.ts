import { v4 as uuid } from "uuid"
import {
    ClientCmdType,
    ClientPostData,
    CommunicationInfo,
    DataType,
    ServerCmd,
    ServerCmdStatus,
    ServerCmdType,
    WorkerPostData
} from "@/communication/types"
import { Server } from "@/communication/server"

type CmdResult = {
    status: ServerCmdStatus,
    message?: string,
    data?: any,
}

export class Tunnel implements CommunicationInfo {
    port: MessagePort
    server: Server
    name: string
    id: string
    token: string
    tunnelId: string = ""
    tunnelType: number
    pendingCmdList = new Map<string, {
        cmd: any,
        promise: Promise<CmdResult>,
        resolve: (value: CmdResult) => void,
    }>()
    sendToServerHandler?: (cmdId: string, cmd: any) => void
    receivingData: ClientPostData | undefined = undefined

    constructor(port: MessagePort, server: Server, info: CommunicationInfo) {
        this.port = port
        this.server = server
        this.name = info.name
        this.id = info.id
        this.token = info.token
        this.tunnelType = info.tunnelType
    }

    async start(): Promise<boolean> {
        const cmdId = await this._sendToServer(ClientCmdType.TunnelData, true)
        const cmdResult = await this.getCmdResult(cmdId)
        if (!cmdResult || typeof cmdResult.data.tunnel_id !== "string" || cmdResult.data.tunnel_id === "") return false;
        this.tunnelId = cmdResult.data.tunnel_id
        return true
    }

    receiveFromClient(event: MessageEvent) {
        const data = event.data
        const isBinary = data instanceof ArrayBuffer
        if (isBinary && this.receivingData === undefined) {
            console.log("数据传输错误：缺少数据头")
            return
        }
        if (!isBinary && this.receivingData !== undefined) {
            console.log("数据传输错误：缺少数据段")
            this.receivingData = undefined
        }
        if (isBinary) {
            this._sendToServer(ClientCmdType.TunnelData, data, this.receivingData?.isListened, this.receivingData?.cmdId)
            this.receivingData = undefined
            return
        }
        console.log(this.id, data)
        this.server.send(JSON.stringify({
            cmd_type: ServerCmdType.TunnelData,
        }))
    }

    sendToClient(data: WorkerPostData) {
        if (data.isListened && !data.cmdId) {
            console.log("数据传输错误：data.isListened=false时cmdId不能为空")
            return
        }
        const dataData = data.data
        const isBinary = dataData instanceof ArrayBuffer
        if (isBinary) data.data = undefined;
        data.dataType = isBinary ? DataType.Binary : DataType.Text
        this.port.postMessage(data)
        if (isBinary) this.port.postMessage(dataData, [dataData]);
    }

    receiveFromServer(cmdData: ServerCmd) {
        const cmdId = cmdData.data?.cmd_id
        if (typeof cmdId !== "string" || cmdId === "") return;
        switch (cmdData.cmd_type) {
            case ServerCmdType.CmdReturn:
                if (!this.pendingCmdList.has(cmdId)) return;
                const cmd = this.pendingCmdList.get(cmdId)
                cmd!.resolve({
                    status: cmdData.status ?? ServerCmdStatus.Fail,
                    message: cmdData.message,
                    data: cmdData.data,
                })
                break
            case ServerCmdType.CloseTunnel:
                this.close()
                break
            case ServerCmdType.TunnelData:
                const dataType = cmdData.data?.data_type
                if (dataType !== DataType.Text || dataType !== DataType.Binary) {
                    console.log("不支持的数据类型", dataType)
                    break
                }
                if (dataType === DataType.Binary && !(cmdData.data.data instanceof ArrayBuffer)) {
                    console.log("数据类型错误：非二进制数据")
                    break
                }
                this.sendToClient({
                    data: cmdData.data.data,
                })
                break
            default:
                console.log("不支持的cmd_type", cmdData.cmd_type)
        }
    }

    async _sendToServer(cmdType: ClientCmdType, data?: any, isListened: boolean = false, cmdId?: string) {
        if (typeof cmdId !== "string" || cmdId === "") cmdId = uuid();
        const cmd = {
            cmd_type: cmdType,
            cmd_id: cmdId,
            tunnel_type: this.tunnelType,
            data: data,
        }
        if (isListened) {
            let resolve: (value: CmdResult) => void = () => {}
            const promise: Promise<CmdResult> = new Promise(r => resolve = r)
            this.pendingCmdList.set(cmdId, {
                cmd: cmd,
                promise: promise,
                resolve: resolve,
            })
            this.sendToServerHandler?.(cmdId, cmd)
        }
        await this.server.send(JSON.stringify(cmd))
        return cmdId
    }

    async sendToServer(data: any, isListened: boolean = false) {
        return await this._sendToServer(ClientCmdType.TunnelData, {
            tunnel_id: this.id,
            data_type: DataType.Text,
            data: data,
        }, isListened)
    }

    async sendToServerBlock(data: any) {
        const cmdId = await this._sendToServer(ClientCmdType.TunnelData, {
            tunnel_id: this.id,
            data_type: DataType.Text,
            data: data,
        }, true)
        return await this.getCmdResult(cmdId)
    }

    async getCmdResult(cmdId: string): Promise<undefined | CmdResult> {
        if (!this.pendingCmdList.has(cmdId)) return;
        const cmd = this.pendingCmdList.get(cmdId)
        this.pendingCmdList.delete(cmdId)
        return await cmd!.promise
    }

    setSendToServerHandler(handler: (cmdId: string, cmd: any) => void) {
        this.sendToServerHandler = handler
    }

    close(closeServerPeer: boolean = false) {
        if (closeServerPeer) {
            this._sendToServer(ClientCmdType.CloseTunnel, {
                tunnel_id: this.id,
            })
        }
        this.port.close()
    }
}