import { Watchable } from "@kcdesign/data"
import {
    DocSelectionOp as _DocSelectionOp,
    DocSelectionData,
    DocSelectionOpData,
} from "@/communication/modules/doc_selection_op"

export class DocSelectionOp extends Watchable(Object) {
    private docSelectionOp?: _DocSelectionOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(token: string, documentId: string): Promise<boolean> {
        if (this.docSelectionOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docSelectionOp = _DocSelectionOp.Make(token, documentId)
        const startParams = [token, documentId]
        docSelectionOp.setOnClose(async () => {
            this.docSelectionOp = undefined
            while (!this.isClosed && !await this.start.apply(this, startParams as any)) { // eslint-disable-line prefer-spread
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        })
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docSelectionOp.start()) {
                console.log("doc selection op start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("doc selection op start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docSelectionOp = docSelectionOp
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public async update(data: DocSelectionData, timeout?: number): Promise<boolean> {
        if (!this.docSelectionOp) return false;
        return await this.docSelectionOp.send(data, timeout !== undefined, timeout)
    }

    public addOnMessage(onMessage: (docCommentOpData: DocSelectionOpData) => void) {
        this.docSelectionOp?.addOnMessage(onMessage)
    }

    public removeOnMessage(onMessage: (docCommentOpData: DocSelectionOpData) => void) {
        this.docSelectionOp?.removeOnMessage(onMessage)
    }

    public available(): boolean {
        return this.docSelectionOp !== undefined
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docSelectionOp) return;
        this.docSelectionOp.close()
        this.docSelectionOp = undefined
        this.startPromise = undefined
        this.updateHandlerSet.clear()
    }
}