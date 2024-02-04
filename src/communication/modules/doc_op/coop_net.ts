import { Cmd, ICoopNet, serialCmds, parseCmds, RadixConvert } from "@kcdesign/data"

export class CoopNet implements ICoopNet {

    private versionId: string = ""
    private send?: (data: any, isListened?: boolean, timeout?: number) => Promise<boolean>
    private watcherList: ((cmds: Cmd[]) => void)[] = []
    private onClose?: () => void
    private isConnected = false
    private pullCmdsPromiseList: Record<string, {
        resolve: (value: Cmd[]) => void,
    }[]> = {}
    private radixRevert: RadixConvert = new RadixConvert(62)

    constructor(versionId: string) {
        this.versionId = versionId
    }

    setSend(send: (data: any, isListened?: boolean, timeout?: number) => Promise<boolean>): this {
        this.send = send
        return this
    }

    setConnected(connected: boolean) {
        this.isConnected = connected
    }

    hasConnected(): boolean {
        return this.isConnected
    }

    async pullCmds(from: string, to: string): Promise<Cmd[]> {
        if (!this.isConnected) return [];
        this.send?.({
            type: "pullCmds",
            from: from,
            to: to,
        })
        return new Promise<Cmd[]>(resolve => {
            const key = `${from}-${to}`
            const promiseList = this.pullCmdsPromiseList[key]
            if (!promiseList) this.pullCmdsPromiseList[key] = [];
            promiseList.push({ resolve: resolve })
        })
    }

    async postCmds(cmds: Cmd[]): Promise<boolean> {
        if (!this.isConnected) return false;
        return this.send?.({
            type: "commit",
            cmds: serialCmds(cmds),
        }) ?? false
    }

    watchCmds(watcher: (cmds: Cmd[]) => void): void {
        this.watcherList.push(watcher)
    }

    getWatcherList(): ((cmds: Cmd[]) => void)[] {
        return this.watcherList
    }

    onMessage(data: any): void {
        const cmdsData = JSON.parse(data.cmds_data) as any[]
        let cmds: Cmd[] | undefined
        if (Array.isArray(cmdsData)) {
            cmds = parseCmds(JSON.stringify(cmdsData.map(item => {
                item.cmd.version = this.radixRevert.from(item.id)
                item.cmd.previousVersion = this.radixRevert.from(item.previous_id)
                return item.cmd
            })))
        }
        if (data.type === "commitResult") { // 本地上传到服务器的返回结果
            if (data.status !== "success") {

            }
        } else if (data.type === "update") { // 服务器推送的cmd
            if (!Array.isArray(cmds)) {
                console.log("服务器数据格式错误")
                return
            }
            for (const watcher of this.watcherList) watcher(cmds);
        } else if (data.type === "pullCmdsResult") { // 服务器返回的pullCmds结果
            if (!Array.isArray(cmds) || typeof data.from !== "string" || typeof data.to !== "string") {
                console.log("服务器数据格式错误")
                return
            }
            const key = `${data.from}-${data.to}`
            if (!this.pullCmdsPromiseList[key]) return;
            for (const item of this.pullCmdsPromiseList[key]) item.resolve(cmds);
            delete this.pullCmdsPromiseList[key]
        }
    }
}
