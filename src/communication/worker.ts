import { v4 as uuid } from "uuid"
import { CommunicationInfo, ServerCmdType, DataType, ServerCmd } from "@/communication/types"
import { Tunnel } from "@/communication/tunnel"
import { Server } from "@/communication/server"

const ctx: SharedWorkerGlobalScope = self as any
let server: Server | undefined = undefined
const tunnelMap = new Map<string, Tunnel>()
const cmdIdToTunnel = new Map<string, Tunnel>()
let token: string = ""
let receivingTunnel: Tunnel | undefined = undefined
let receivingTunnelCmd: ServerCmd | undefined = undefined

function receiveFromServer(event: MessageEvent) {
    const isBinary = event.data instanceof ArrayBuffer
    const data = (isBinary ? event.data : JSON.parse(event.data)) as ServerCmd
    if (isBinary && (receivingTunnel === undefined || receivingTunnelCmd === undefined)) {
        console.log("数据传输错误：缺少数据头")
        return
    }
    if (!isBinary && (receivingTunnel !== undefined || receivingTunnelCmd !== undefined)) {
        console.log("数据传输错误：缺少数据段")
        receivingTunnel = undefined
        receivingTunnelCmd = undefined
    }
    if (isBinary) {
        receivingTunnelCmd!.data.data = data
        receivingTunnel!.receiveFromServer(receivingTunnelCmd!)
        receivingTunnel = undefined
        receivingTunnelCmd = undefined
        return
    }
    const cmdId = data.cmd_id
    if (typeof cmdId !== "string" || cmdId === "") {
        console.log("cmd_id参数错误", cmdId)
        return
    }
    const originCmdId = data.data?.cmd_id
    const tunnelId = data.data?.tunnel_id
    const isTunnelDataCmd = data.cmd_type === ServerCmdType.TunnelData
    const tunnel = isTunnelDataCmd ? tunnelMap.get(tunnelId): cmdIdToTunnel.get(originCmdId)
    if (!tunnel) return;
    if (isTunnelDataCmd && data.data?.data_type === DataType.Binary) {
        receivingTunnel = tunnel
        receivingTunnelCmd = data
        return
    }
    tunnel.receiveFromServer(data)
    console.log("receiveFromServer", data)
}

ctx.onconnect = (event) => {
    const port = event.ports[0]
    port.onmessage = async (messageEvent) => {
        const data = messageEvent.data as CommunicationInfo
        if (token !== "" && data.token !== token) {
            // todo 当有第二个用户连接时，关闭前面用户的连接
        }
        const sendData = {
            name: data.name,
            id: "",
        }
        if (!data.name) {
            console.log("name参数错误", data.name)
            port.postMessage(sendData)
            return
        }
        if (server === undefined) {
            server = new Server(data.token, receiveFromServer)
            server.connect()
        }
        data.id = uuid()
        const tunnel = new Tunnel(port, server, data)
        tunnel.setSendToServerHandler((cmdId, cmd) => cmdIdToTunnel.set(cmdId, tunnel))
        if (await tunnel.start()) {
            console.log("tunnel创建成功", tunnel.tunnelId)
            sendData.id = tunnel.tunnelId
            tunnelMap.set(tunnel.tunnelId, tunnel)
            port.onmessage = tunnel.receiveFromClient.bind(tunnel)
        }
        port.postMessage(sendData)
    }
}
