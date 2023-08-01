import { Communication } from "../index"
import { NetworkStatusType, TunnelType } from "@/communication/types"

export class NetworkStatus extends Communication {
    private token: string = ""
    public onChange: (networkStatus: NetworkStatusType) => void = _ => {}

    private constructor() {
        super(TunnelType.NetworkStatus)
    }

    public static Make(token: string): NetworkStatus {
        const networkStatus = new NetworkStatus()
        networkStatus.token = token
        networkStatus.onMessage = networkStatus._onMessage.bind(networkStatus)
        return networkStatus
    }

    private _onMessage(data: any) {
        console.log("network status receive", data)
        this.onChange(data as NetworkStatusType)
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }
}