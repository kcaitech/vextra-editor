import { WatchableObject, Document, CoopRepository, Cmd } from "@kcdesign/data"
import { Options, DocOp as _DocOp } from "@/communication/modules/doc_op"

export class DocOp extends WatchableObject {
    private docOp?: _DocOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(getToken: getTokenFuncAsync, documentId: string, document: Document, repo: CoopRepository, versionId: string, options?: Options, startOptions?: StartOptions): Promise<boolean> {
        if (this.docOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docOp = _DocOp.Make(await getToken(), documentId, document, repo, versionId, options)
        const startParams = [getToken, documentId, document, repo, versionId]
        docOp.setOnClose(async (options?: Options) => {
            const diff_time = 1000 - (Date.now() - (Number.isInteger(startOptions?.last_time) ? startOptions!.last_time! : 0))
            if (diff_time > 0) await new Promise(resolve => setTimeout(resolve, diff_time));
            this.docOp = undefined
            if (!this.isClosed) await this.start.apply(this, [...startParams, options, { last_time: Date.now() }] as any); // eslint-disable-line prefer-spread
        });
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docOp.start()) {
                console.log("DocOp start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("DocOp start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docOp = docOp
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public hasPendingSyncCmd(): boolean {
        return this.docOp?.hasPendingSyncCmd?.() ?? false
    }

    public get lastServerCmdId(): string | undefined {
        return this.docOp?.lastServerCmdId
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docOp) return;
        this.docOp.close()
        this.docOp = undefined
        this.startPromise = undefined
    }

    public addOnLocalUpdateAsync(onUpdate: (cmd: Cmd) => void) {
        this.docOp?.addOnLocalUpdateAsync(onUpdate)
    }

    public removeOnLocalUpdate(onUpdate: (cmd: Cmd) => void) {
        this.docOp?.removeOnLocalUpdateAsync(onUpdate)
    }
}