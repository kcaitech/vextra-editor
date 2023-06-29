import { ServerCmdType, ServerCmdStatus } from "@/communication/types"


const Host = "protodesign.cn"
const basePath = `${Host}/api_test/v1`
const apiUrl = `wss://${basePath}/communication`

export class Server {
    token: string
    ws: WebSocket | undefined = undefined
    isConnecting: boolean = false
    connectPromise: Promise<boolean> | undefined = undefined
    onmessage: (event: MessageEvent) => any
    id: string = ""

    constructor(token: string, onmessage: (event: MessageEvent) => any) {
        this.token = token
        this.onmessage = onmessage
    }

    async connect(): Promise<boolean> {
        if (this.ws !== undefined) return true;
        if (this.isConnecting && this.connectPromise) return await this.connectPromise;
        this.isConnecting = true
        let resolve: (value: boolean) => void = () => {}
        this.connectPromise = new Promise<boolean>(r => resolve = r)
        try {
            this.ws = new WebSocket(apiUrl)
            this.ws.binaryType = 'arraybuffer'
        } catch (e) {
            console.log(e)
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            return false
        }
        await new Promise<void>(resolve => this.ws!.onopen = _ => resolve())
        this.ws.send(JSON.stringify({
            token: this.token,
        }))
        if (!await new Promise(resolve => {
            this.ws!.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.cmd_type !== ServerCmdType.InitResult
                        || typeof data.cmd_id !== "string" || data.cmd_id === ""
                        || data.status !== ServerCmdStatus.Success || !data.data?.communication_id
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
        })) {
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            return false
        }
        this.ws.onmessage = this.onmessage.bind(this)
        resolve(true)
        this.isConnecting = false
        return true
    }

    async send(data: any) {
        if (this.ws === undefined) {
            while (!await this.connect()) {}
        }
        this.ws?.send(data)
    }
}