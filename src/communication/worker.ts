import { v4 as uuid } from "uuid"
import { ClientInfo } from "@/communication/types"
import { ClientSession } from "@/communication/clientSession"
import { ServerSession } from "@/communication/serverSession"

let serverSession: ServerSession | undefined = undefined
const clientMap = new Map<string, ClientSession>()
let clientToken: string = ""
const ctx: SharedWorkerGlobalScope = self as any

function receiveFromServer(event: MessageEvent) {
    console.log("receiveFromServer", event.data)
}

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
        if (serverSession === undefined) {
            serverSession = new ServerSession(data.token, receiveFromServer)
            serverSession.connect()
        }
        data.id = uuid()
        sendData.id = data.id
        clientPort.postMessage(sendData)
        const client = new ClientSession(clientPort, serverSession, data)
        clientMap.set(data.id, client)
        clientPort.onmessage = client.receiveFromClient.bind(client)
        client.sendToClient("hello client")
    }
}
