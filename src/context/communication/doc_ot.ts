import { Watchable, Document, CoopRepository } from "@kcdesign/data"
import { Options, Ot } from "@/communication/modules/ot"

export class DocOt extends Watchable(Object) {
    private ot?: Ot
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(token: string, documentId: string, document: Document, repo: CoopRepository, versionId: string, options?: Options): Promise<boolean> {
        if (this.ot) return true;
        if (this.startPromise) return await this.startPromise;
        const ot = Ot.Make(documentId, token, document, repo, versionId, options)
        const startParams = [token, documentId, document, repo, versionId]
        ot.setOnClose((options?: Options) => {
            if (this.isClosed) return;
            this.ot = undefined
            this.start.apply(this, [...startParams.slice(0, 5), options] as any) // eslint-disable-line prefer-spread
        })
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await ot.start()) {
                console.log("Ot start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("Ot start失败", e)
            this.startResolve!(false)
            return false
        }
        this.ot = ot
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public hasPendingSyncCmd(): boolean {
        return this.ot?.hasPendingSyncCmd?.() ?? false
    }

    public available(): boolean {
        return this.ot !== undefined
    }

    public close() {
        if (!this.ot || this.isClosed) return;
        this.isClosed = true
        this.ot.close()
        this.ot = undefined
        this.startPromise = undefined
    }
}