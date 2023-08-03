import { Watchable, Document, CoopRepository } from "@kcdesign/data"
import { Options, DocOp as _DocOp } from "@/communication/modules/doc_op"

export class DocOp extends Watchable(Object) {
    private docOp?: _DocOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(token: string, documentId: string, document: Document, repo: CoopRepository, versionId: string, options?: Options): Promise<boolean> {
        if (this.docOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docOp = _DocOp.Make(token, documentId, document, repo, versionId, options)
        const startParams = [token, documentId, document, repo, versionId]
        docOp.setOnClose(async (options?: Options) => {
            this.docOp = undefined
            while (!this.isClosed && !await this.start.apply(this, [...startParams.slice(0, 5), options] as any)) { // eslint-disable-line prefer-spread
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        })
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docOp.start()) {
                console.log("Doc_op start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("Doc_op start失败", e)
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

    public available(): boolean {
        return this.docOp !== undefined
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docOp) return;
        this.docOp.close()
        this.docOp = undefined
        this.startPromise = undefined
    }
}