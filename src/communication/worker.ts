import { ClientInfo } from "./types"
import { FILE_UPLOAD } from "../utils/setting"

const apiUrl = `${FILE_UPLOAD}/documents/ws`

let ws: WebSocket | undefined = undefined
const clientMap = new Map<string, ClientInfo>()
const clientToken: string = ""
const ctx: SharedWorkerGlobalScope = self as any

ctx.onconnect = (event) => {
    const clientPort = event.ports[0]
    clientPort.onmessage = (messageEvent) => {
        const data = messageEvent.data as ClientInfo
        if (clientToken !== "" && data.token !== clientToken) {
            // todo 当有第二个用户连接时，关闭前面用户的连接
        }
        const sendData = {
            name: data.name,
            id: "",
        }
        if (!data.name) {
            console.log("name参数错误", data.name)
            clientPort.postMessage(sendData)
            return
        }
        // todo 创建websocket
        if (ws === undefined) {
            ws = new WebSocket(apiUrl)
        }
        sendData.id = "123456"
        clientPort.postMessage(sendData)
        clientMap.set(sendData.id, {name: sendData.name, id: sendData.id, token: data.token})
        clientPort.onmessage = (clientId => {
            return (event: MessageEvent) => {
                onClientMessage(clientId, event)
            }
        })(sendData.id)
    }
}

function onClientMessage(clientId: string, event: MessageEvent) {
    console.log(event)
}