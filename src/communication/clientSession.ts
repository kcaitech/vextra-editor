import { ClientInfo } from "@/communication/types"
import { Server } from "@/communication/serverSession"

export class ClientSession implements ClientInfo {
    port: MessagePort
    server: Server
    name: string
    id: string
    token: string

    constructor(port: MessagePort, server: Server, info: ClientInfo) {
        this.port = port
        this.server = server
        this.name = info.name
        this.id = info.id
        this.token = info.token
    }

    receiveFromClient(event: MessageEvent) {
        const data = event.data
        console.log(this.id, data)
    }

    sendToClient(data: any) {
        this.port.postMessage(data)
    }

    receiveFromServer(data: any) {

    }

    sendToServer(data: any) {
        this.server.send(data)
    }
}