const Host = "protodesign.cn"
const basePath = `${Host}/api_test/v1`
const apiUrl = `wss://${basePath}/communication`

export interface Server {
    send(data: any): void
}

export class ServerSession implements Server {
    token: string
    ws: WebSocket | undefined = undefined
    onmessage: (event: MessageEvent) => any

    constructor(token: string, onmessage: (event: MessageEvent) => any) {
        this.token = token
        this.onmessage = onmessage
    }

    connect() {
        this.ws = new WebSocket(apiUrl)
        this.ws.onopen = () => {
            this.ws?.send(JSON.stringify({
                token: this.token,
            }))
        }
        this.ws.onmessage = this.onmessage.bind(this)
    }

    send(data: any) {
        if (this.ws === undefined) {
            // todo
            console.log("ws未开启")
            return
        }
        this.ws.send(data)
    }
}