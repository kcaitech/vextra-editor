import { ServerCmdType, CmdStatus } from "@/communication/types"
import { COMMUNICATION_URL } from "@/utils/setting"

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export class Server {
    token: string
    ws: WebSocket | undefined = undefined
    isConnected: boolean = false
    isConnecting: boolean = false
    connectPromise: Promise<boolean> | undefined = undefined
    onmessage: (event: MessageEvent) => any
    id: string = ""

    constructor(token: string, onmessage: (event: MessageEvent) => any) {
        this.token = token
        this.onmessage = onmessage
    }

    async connect(): Promise<boolean> {
        if (this.isConnected) return true;
        if (this.isConnecting && this.connectPromise) return await this.connectPromise;
        this.isConnecting = true
        let resolve: (value: boolean) => void = () => {}
        this.connectPromise = new Promise<boolean>(r => resolve = r)
        try {
            this.ws = new WebSocket(COMMUNICATION_URL)
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
        })) {
            this.ws = undefined
            resolve(false)
            this.isConnecting = false
            return false
        }
        this.ws.onmessage = this.onmessage.bind(this)
        resolve(true)
        this.isConnecting = false
        this.isConnected = true
        this.ws.onclose = event => {
            this.isConnected = false
        }
        return true
    }

    async send(data: any) {
        if (!this.isConnected) {
            while (!await this.connect()) await sleep(1000);
        }
        this.ws!.send(data)
    }
}