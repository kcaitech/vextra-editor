import { Cmd, ICoopNet, serialCmds, parseCmds, RadixConvert } from "@kcdesign/data"

export class CoopNet implements ICoopNet {

    private versionId: string = ""
    private send?: (data: any, isListened?: boolean, timeout?: number) => Promise<boolean>
    private watcherList: ((cmds: Cmd[]) => void)[] = []
    private onClose?: () => void
    private isConnected = false
    private pullCmdsPromiseList: Record<string, {
        resolve: (value: Cmd[]) => void,
        reject: (reason: any) => void
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
        return new Promise<Cmd[]>((resolve, reject) => {
            const key = `${from}-${to}`
            const promiseList = this.pullCmdsPromiseList[key]
            if (!promiseList) this.pullCmdsPromiseList[key] = [];
            promiseList.push({ resolve: resolve, reject: reject })
        })
    }

    async postCmds(cmds: Cmd[]): Promise<boolean> {
        if (!this.isConnected) return false;
        console.log("postCmds", cmds)
        return this.send?.({
            type: "commit",
            cmds: serialCmds(cmds),
        }) ?? false
    }

    watchCmds(watcher: (cmds: Cmd[]) => void): void {
        this.watcherList.push(watcher)
    }

    onMessage(data: any): void {
        const cmdsData = JSON.parse(data.cmds_data ?? '""') as any[]
        let cmds: Cmd[] | undefined
        if (Array.isArray(cmdsData)) {
            cmds = parseCmds(JSON.stringify(cmdsData.map(item => {
                item.cmd.id = item.cmd_id
                item.cmd.version = this.radixRevert.from(item.id)
                item.cmd.previousVersion = this.radixRevert.from(item.previous_id)
                return item.cmd
            })))
        }
        // pullCmdsResult update errorInvalidParams errorNoPermission errorInsertFailed errorPullCmdsFailed
        if (data.type === "pullCmdsResult" || data.type === "errorPullCmdsFailed") {
            if (data.type === "errorPullCmdsFailed") console.log("拉取数据失败");

            if (typeof data.from !== "string" || typeof data.to !== "string") {
                console.log("服务器数据格式错误")
                return
            }

            const key = `${data.from}-${data.to}`
            if (!this.pullCmdsPromiseList[key]) return;

            if (data.type === "pullCmdsResult") {
                if (!Array.isArray(cmds)) {
                    console.log("返回数据格式错误")
                    for (const item of this.pullCmdsPromiseList[key]) item.reject(new Error("返回数据格式错误"));
                } else {
                    for (const item of this.pullCmdsPromiseList[key]) item.resolve(cmds);
                }
                if (typeof data.previous_id !== "string") {
                    console.log("服务器数据格式错误，缺少previous_id")
                }
            } else {
                for (const item of this.pullCmdsPromiseList[key]) item.reject(new Error("拉取数据失败"));
            }

            delete this.pullCmdsPromiseList[key]
        } else if (data.type === "update") {
            if (!Array.isArray(cmds)) {
                console.log("返回数据格式错误")
                return
            }
            console.log("update", cmds)
            for (const watcher of this.watcherList) watcher(cmds);
        } else if (data.type === "errorInvalidParams") {
            console.log("参数错误")
        } else if (data.type === "errorNoPermission") {
            console.log("无权限")
        } else if (data.type === "errorInsertFailed") {
            console.log("数据插入失败", data.cmd_id_list)
            if (!Array.isArray(data.cmd_id_list)) {
                console.log("服务器数据格式错误")
                return
            }
        } else {
            console.log("未知的数据类型", data.type)
        }
    }
}
