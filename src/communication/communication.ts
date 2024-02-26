import { v4 as uuid } from "uuid"
import {
    CommunicationInfo,
    ServerCmdType,
    DataType,
    TunnelType,
    NetworkStatusType
} from "@/communication/types"
import { Tunnel } from "@/communication/tunnel"
import { Server } from "@/communication/server"

const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope

let server: Server | undefined = undefined
const tunnelMap = new Map<string, Tunnel>()
const cmdIdToTunnel = new Map<string, Tunnel>()
let token: string = ""

const networkStatusTunnelMap = new Map<string, Tunnel>()
function sendNetworkStatusToClient(status: NetworkStatusType) {
    for (const tunnel of networkStatusTunnelMap.values()) {
        tunnel.receiveFromServer({
            cmd_type: ServerCmdType.TunnelData,
            cmd_id: uuid(),
            data: {
                data_type: DataType.Text,
                data: status,
            }
        })
    }
}

export function newConnect(port: MessagePort) {
    port.onmessage = async (messageEvent) => {
        const data = messageEvent.data as CommunicationInfo
        if (server && token !== "" && data.token !== token) { // 当有第二个用户连接时，关闭前面用户的连接
            server.close()
            server = undefined
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
            token = data.token
            server = new Server(token, tunnelMap, cmdIdToTunnel)
            server.onConnected = () => {
                for (const tunnel of tunnelMap.values()) tunnel.close();
                tunnelMap.clear()
                networkStatusTunnelMap.clear()
            }
            server.onNetworkOnline = () => {
                sendNetworkStatusToClient(NetworkStatusType.Online)
            }
            server.onNetworkOffline = () => {
                sendNetworkStatusToClient(NetworkStatusType.Offline)
            }
            server.connect()
        }
        data.id = uuid()
        const tunnel = new Tunnel(port, server, data, () => {
            tunnelMap.delete(tunnel.tunnelId)
            networkStatusTunnelMap.delete(tunnel.tunnelId)
        })
        if (data.tunnelType === TunnelType.NetworkStatus) {
            tunnel.tunnelId = uuid()
            networkStatusTunnelMap.set(tunnel.tunnelId, tunnel)
        }
        tunnel.setSendToServerHandler((cmdId, cmd) => cmdIdToTunnel.set(cmdId, tunnel))
        if (data.tunnelType === TunnelType.NetworkStatus || await tunnel.start()) {
            console.log("tunnel创建成功", tunnel.tunnelId)
            sendData.id = tunnel.tunnelId
            tunnelMap.set(tunnel.tunnelId, tunnel)
            port.onmessage = tunnel.receiveFromClient.bind(tunnel)
        }
        port.postMessage(sendData)
    }
}

if (isWorker) {
    (self as any as SharedWorkerGlobalScope).onconnect = (event) => {
        newConnect(event.ports[0])
    }
}
