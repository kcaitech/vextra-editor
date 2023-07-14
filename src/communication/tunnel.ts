import { v4 as uuid } from "uuid"
import {
    ClientCmdType,
    ClientPostData,
    CommunicationInfo,
    DataType,
    ServerCmd,
    CmdStatus,
    ServerCmdType,
    WorkerPostData,
    CmdResult,
    TunnelType, SendToServerCmd,
} from "@/communication/types"
import { Server } from "@/communication/server"

export class Tunnel {
    port: MessagePort
    server: Server
    info: CommunicationInfo
    tunnelId: string = ""
    tunnelType: TunnelType
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
        this.info = info
        this.tunnelType = info.tunnelType
    }

    async start(): Promise<boolean> {
        const cmdId = await this.sendToServer(ClientCmdType.OpenTunnel, { data: this.info.data }, true)
        const cmdResult = await this.getCmdResult(cmdId)
        if (!cmdResult || typeof cmdResult.data.tunnel_id !== "string" || cmdResult.data.tunnel_id === "") return false;
        this.tunnelId = cmdResult.data.tunnel_id
        return true
    }

    async receiveFromClient(event: MessageEvent) {
        const data = event.data as ClientPostData
        console.log("receiveFromClient", this.tunnelId, data)
        if (data.close) {
            this.close(true)
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
            this.server.send(data)
            this.receivingData = undefined
            return
        }
        const cmdId = await this.sendToServer(ClientCmdType.TunnelData, data, data.isListened, data.cmdId)
        if (data.isListened) {
            if (!data.cmdId) {
                console.log("数据传输错误：data.isListened=true时cmdId不能为空")
                return
            }
            const cmdResult = await this.getCmdResult(cmdId)
            if (!cmdResult) return;
            this.sendToClient({
                cmdId: data.cmdId,
                isListened: true,
                data: cmdResult,
            })
        }
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
        switch (cmdData.cmd_type) {
            case ServerCmdType.CmdReturn:
                const cmdId = cmdData.data?.cmd_id
                if (typeof cmdId !== "string" || cmdId === "") return;
                if (!this.pendingCmdList.has(cmdId)) return;
                const cmd = this.pendingCmdList.get(cmdId)
                cmd!.resolve({
                    status: cmdData.status ?? CmdStatus.Fail,
                    message: cmdData.message,
                    data: cmdData.data,
                })
                break
            case ServerCmdType.CloseTunnel:
                this.close()
                break
            case ServerCmdType.TunnelData:
                const dataType = cmdData.data?.data_type
                if (dataType !== DataType.Text && dataType !== DataType.Binary) {
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

    async sendToServer(cmdType: ClientCmdType, data?: any, isListened: boolean = false, cmdId?: string) {
        if (typeof cmdId !== "string" || cmdId === "") cmdId = uuid();
        const cmdData: SendToServerCmd = {
            cmd_id: data?.cmdId,
            tunnel_id: this.tunnelId ? this.tunnelId : undefined,
            data_type: data?.dataType,
            data: data?.data,
        }
        const cmd = {
            cmd_type: cmdType,
            cmd_id: cmdId,
            tunnel_type: this.tunnelType,
            data: cmdData,
        }
        if (isListened) {
            let resolve: (value: CmdResult) => void = () => {
            }
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

    async getCmdResult(cmdId: string): Promise<undefined | CmdResult> {
        if (!this.pendingCmdList.has(cmdId)) return;
        const cmd = this.pendingCmdList.get(cmdId)
        const result = await cmd!.promise
        this.pendingCmdList.delete(cmdId)
        return result
    }

    setSendToServerHandler(handler: (cmdId: string, cmd: any) => void) {
        this.sendToServerHandler = handler
    }

    close(closeServerPeer: boolean = false) {
        if (closeServerPeer) {
            this.sendToServer(ClientCmdType.CloseTunnel, {
                tunnel_id: this.tunnelId,
            })
        }
        this.port.close()
    }
}