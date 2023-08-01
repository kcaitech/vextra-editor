import { Watchable, Document, CoopRepository } from "@kcdesign/data"
import { Ot } from "@/communication/modules/ot";

export class DocOt extends Watchable(Object) {
    private ot?: Ot
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void

    public async start(token: string, documentId: string, document: Document, repo: CoopRepository, versionId: string): Promise<boolean> {
        if (this.ot) return true;
        if (this.startPromise) return await this.startPromise;
        const ot = Ot.Make(documentId, token, document, repo, versionId)
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await ot.start()) {
                console.log("DocUpload start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("DocUpload start失败", e)
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
        if (!this.ot) return;
        this.ot.close()
        this.ot = undefined
        this.startPromise = undefined
    }
}