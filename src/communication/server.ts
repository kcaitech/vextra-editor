import { v4 as uuid } from "uuid"
import {
    ClientCmd,
    ClientCmdType,
    CmdMessage,
    CmdStatus,
    DataType,
    NetworkStatusType,
    ServerCmd,
    ServerCmdType
} from "@/communication/types"
import { COMMUNICATION_URL } from "@/utils/setting"
import { Tunnel } from "@/communication/tunnel"

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export class Server {
    token: string
    ws: WebSocket | undefined = undefined
    receivingTunnel: Tunnel | undefined = undefined
    receivingTunnelCmd: ServerCmd | undefined = undefined
    tunnelMap: Map<string, Tunnel>
    cmdIdToTunnel: Map<string, Tunnel>
    isConnected: boolean = false
    isConnecting: boolean = false
    connectPromise: Promise<boolean> | undefined = undefined
    isClosed: boolean = false
    onNetworkOnline: () => void = () => {}
    onNetworkOffline: () => void = () => {}
    isFirstConnect: boolean = true // 首次连接成功后置为false
    id: string = ""
    lastReceiveHeartbeatTime: number = 0
    lastSendHeartbeatTime: number = 0
    sendHeartbeatInterval?: number
    receiveHeartbeatTimer?: number
    offlineTimer?: number
    networkStatus: NetworkStatusType = NetworkStatusType.Offline
    onConnected: () => void = () => {}

    constructor(token: string, tunnelMap: Map<string, Tunnel>, cmdIdToTunnel: Map<string, Tunnel>,) {
        this.token = token
        this.tunnelMap = tunnelMap
        this.cmdIdToTunnel = cmdIdToTunnel
    }

    async connect(): Promise<boolean> {
        console.log("server connect")
        if (this.isClosed) return false;
        if (this.isConnected) return true;
        if (this.isConnecting && this.connectPromise) return await this.connectPromise;
        this.closeWs()
        this.isConnecting = true
        let resolve: (value: boolean) => void = () => {}
        this.connectPromise = new Promise<boolean>(r => resolve = r)
        try {
            this.ws = new WebSocket(COMMUNICATION_URL)
            this.ws.binaryType = "arraybuffer"
        } catch (e) {
            console.log(e)
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            this.connectPromise = undefined
            return false
        }
        try {
            await new Promise<void>((resolve, reject) => {
                this.ws!.onopen = _ => resolve()
                this.ws!.onerror = err => reject(err)
            })
            setTimeout(() => resolve(false), 3000)
        } catch (err) {
            console.log(err)
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            this.connectPromise = undefined
            return false
        }
        this.ws.send(JSON.stringify({
            token: this.token,
        }))
        if (!await new Promise(resolve => {
            this.ws!.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.cmd_type !== ServerCmdType.InitResult
                        || typeof data.cmd_id !== "string" || data.cmd_id === ""
                        || data.status !== CmdStatus.Success || !data.data?.communication_id
                    ) {
                        resolve(false)
                        return
                    }
                    this.id = data.data.communication_id
                    resolve(true)
                } catch (e) {
                    console.log(e)
                    resolve(false)
                }
            }
            setTimeout(() => resolve(false), 3000)
        })) {
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            this.connectPromise = undefined
            return false
        }
        this.ws.onmessage = this.onMessage.bind(this)
        resolve(true)
        this.isConnecting = false
        this.connectPromise = undefined
        this.isConnected = true
        this.ws.onclose = this.closeWs.bind(this)
        if (this.isFirstConnect) {
            this.isFirstConnect = false
            this.networkStatus = NetworkStatusType.Online
            this.sendHeartbeatInterval = setInterval(() => {
                this.sendHeartbeat()
            }, 1000) as any
            this.receiveHeartbeatTimer = setTimeout(this._onNetworkOffline.bind(this), 3000) as any
        } else {
            this._onNetworkOnline()
        }
        this.onConnected()
        console.log("server connect success")
        return true
    }

    async connectLoop() {
        // console.log("server connectLoop")
        if (this.isClosed) return false;
        if (this.isConnected) return true;
        while (!await this.connect()) {
            if (this.isClosed) return false;
            await sleep(1000)
        }
        console.log("server connectLoop success")
        return true
    }

    closeWs() {
        console.log("server closeWs")
        this.isConnected = false
        if (this.ws) {
            this.ws.onopen = null
            this.ws.onerror = null
            this.ws.onmessage = null
            this.ws.onclose = null
            this.ws.close()
            this.ws = undefined
        }
        this._onNetworkOffline()
    }

    async send(data: any): Promise<boolean> {
        if (!await this.connectLoop()) return false;
        this.ws!.send(data)
        return true
    }

    onMessage(event: MessageEvent) {
        const isBinary = event.data instanceof ArrayBuffer
        const data = (isBinary ? event.data : JSON.parse(event.data)) as ServerCmd
        if (isBinary && (this.receivingTunnel === undefined || this.receivingTunnelCmd === undefined)) {
            console.log("数据传输错误：缺少数据头")
            return
        }
        if (!isBinary && (this.receivingTunnel !== undefined || this.receivingTunnelCmd !== undefined)) {
            console.log("数据传输错误：缺少数据段")
            this.receivingTunnel = undefined
            this.receivingTunnelCmd = undefined
        }
        if (isBinary) {
            this.receivingTunnelCmd!.data.data = data
            this.receivingTunnel!.receiveFromServer(this.receivingTunnelCmd!)
            this.receivingTunnel = undefined
            this.receivingTunnelCmd = undefined
            return
        }
        const cmdId = data.cmd_id
        if (typeof (cmdId as any) !== "string" || cmdId === "") {
            console.log("cmd_id参数错误", cmdId)
            return
        }
        const isHeartbeatCmd = data.cmd_type === ServerCmdType.Heartbeat || data.cmd_type === ServerCmdType.HeartbeatResponse
        if (isHeartbeatCmd) {
            this.receiveHeartbeat(data)
            return
        }
        const tunnelId = data.data?.tunnel_id
        const isTunnelDataCmd = data.cmd_type === ServerCmdType.TunnelData
        let tunnel = this.tunnelMap.get(tunnelId)
        if (isTunnelDataCmd && !tunnel) {
            this.send(JSON.stringify({
                cmd_type: ClientCmdType.Return,
                cmd_id: uuid(),
                status: CmdStatus.Fail,
                message: CmdMessage.TunnelIdError,
                data: {
                    cmd_id: cmdId,
                    tunnel_id: tunnelId,
                }
            } as ClientCmd))
            return
        }
        if (isTunnelDataCmd && data.data?.data_type === DataType.Binary) {
            this.receivingTunnel = tunnel
            this.receivingTunnelCmd = data
            return
        }
        if (!tunnel) {
            const originCmdId = data.data?.cmd_id
            tunnel = this.cmdIdToTunnel.get(originCmdId)
            this.cmdIdToTunnel.delete(originCmdId)
        }
        tunnel?.receiveFromServer(data)
        // console.log("receiveFromServer", data)
    }

    sendHeartbeat() {
        // console.log("sendHeartbeat")
        this.lastSendHeartbeatTime = Date.now()
        this.send(JSON.stringify({
            cmd_type: ClientCmdType.Heartbeat,
            cmd_id: uuid(),
            data: {
                time: Date.now(),
            },
        }))
    }

    _onNetworkOffline() {
        if (this.isClosed || this.networkStatus === NetworkStatusType.Offline) return;
        // console.log("_onNetworkOffline")
        this.networkStatus = NetworkStatusType.Offline
        this.onNetworkOffline()
        this.offlineTimer = setTimeout(this.closeWs.bind(this), 60000) as any
    }

    _onNetworkOnline() {
        // console.log("_onNetworkOnline")
        if (this.receiveHeartbeatTimer !== undefined) clearTimeout(this.receiveHeartbeatTimer);
        this.receiveHeartbeatTimer = setTimeout(this._onNetworkOffline.bind(this), 3000) as any
        if (this.networkStatus === NetworkStatusType.Offline) {
            this.networkStatus = NetworkStatusType.Online
            this.onNetworkOnline()
        }
        if (this.offlineTimer !== undefined) clearTimeout(this.offlineTimer);
        this.lastReceiveHeartbeatTime = Date.now()
    }

    receiveHeartbeat(cmd: ServerCmd) {
        // console.log("receiveHeartbeat")
        this._onNetworkOnline()
        if (cmd.cmd_type === ServerCmdType.Heartbeat) {
            this.send(JSON.stringify({
                cmd_type: ClientCmdType.HeartbeatResponse,
                cmd_id: uuid(),
                data: {
                    time: Date.now(),
                    cmd_id: cmd.cmd_id,
                },
            }))
        }
    }

    async close() {
        if (!this.ws && this.isConnecting && this.connectPromise) {
            await this.connectPromise
        }
        if (this.ws !== undefined) {
            this.ws?.close()
            this.ws = undefined
        }
        this.isConnected = false
        this.isConnecting = false
        this.connectPromise = undefined
        if (this.sendHeartbeatInterval !== undefined) {
            clearInterval(this.sendHeartbeatInterval)
            this.sendHeartbeatInterval = undefined
        }
        if (this.receiveHeartbeatTimer !== undefined) {
            clearTimeout(this.receiveHeartbeatTimer)
            this.receiveHeartbeatTimer = undefined
        }
        this.isClosed = true
    }
}