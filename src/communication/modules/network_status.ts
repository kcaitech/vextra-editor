import { Communication } from "../index"
import { NetworkStatusType, TunnelType } from "@/communication/types"

class _NetworkStatus extends Communication {
    private token: string = ""
    public onChange: (networkStatus: NetworkStatusType) => void = _ => {}

    private constructor() {
        super(TunnelType.NetworkStatus)
    }

    public static Make(token: string): _NetworkStatus {
        const _networkStatus = new _NetworkStatus()
        _networkStatus.token = token
        _networkStatus.onMessage = _networkStatus._onMessage.bind(_networkStatus)
        return _networkStatus
    }

    private _onMessage(data: any) {
        console.log("network status receive", data)
        this.onChange(data as NetworkStatusType)
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }

    public setOnClose(onClose: () => void) {
        this.onClose = onClose
    }
}

export class NetworkStatus {
    private token: string
    private onChangeList: ((networkStatus: NetworkStatusType) => void)[] = []
    private isClosed: boolean = false
    private _networkStatus: _NetworkStatus | undefined

    private constructor(token: string) {
        this.token = token
    }

    private create() {
        const _networkStatus = _NetworkStatus.Make(this.token)
        _networkStatus.onChange = this._onChange.bind(this)
        _networkStatus.setOnClose(() => {
            if (!this.isClosed) this.create();
        })
        _networkStatus.start()
        this._networkStatus = _networkStatus
    }

    public static Make(token: string): NetworkStatus {
        const networkStatus = new NetworkStatus(token)
        networkStatus.create()
        return networkStatus
    }

    private _onChange(networkStatus: NetworkStatusType) {
        for (const onChange of this.onChangeList) onChange(networkStatus);
    }

    public addOnChange(onChange: (networkStatus: NetworkStatusType) => void) {
        this.onChangeList.push(onChange)
    }

    public removeOnChange(onChange: (networkStatus: NetworkStatusType) => void) {
        const index = this.onChangeList.indexOf(onChange)
        if (index >= 0) this.onChangeList.splice(index, 1);
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        this._networkStatus?.close(false)
    }
}