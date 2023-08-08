import { Watchable } from "@kcdesign/data"
import { DocCommentOp as _DocCommentOp, DocCommentOpData } from "@/communication/modules/doc_comment_op"

export class DocCommentOp extends Watchable(Object) {
    private docCommentOp?: _DocCommentOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private updateHandlerSet = new Set<(data: DocCommentOpData) => void>()
    private isClosed: boolean = false

    public async start(token: string, documentId: string): Promise<boolean> {
        if (this.docCommentOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docCommentOp = _DocCommentOp.Make(token, documentId)
        const startParams = [token, documentId]
        docCommentOp.setOnClose(async () => {
            this.docCommentOp = undefined
            while (!this.isClosed && !await this.start.apply(this, startParams as any)) { // eslint-disable-line prefer-spread
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        })
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docCommentOp.start()) {
                console.log("Doc_comment_op start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("Doc_comment_op start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docCommentOp = docCommentOp
        this.docCommentOp.onUpdated = this._onUpdated.bind(this)
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    private _onUpdated(docCommentOpData: DocCommentOpData) {
        for (const handler of this.updateHandlerSet) handler(docCommentOpData);
    }

    public addUpdatedHandler(onUpdated: (docCommentOpData: DocCommentOpData) => void) {
        this.updateHandlerSet.add(onUpdated)
    }

    public removeUpdatedHandler(onUpdated: (docCommentOpData: DocCommentOpData) => void) {
        this.updateHandlerSet.delete(onUpdated)
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docCommentOp) return;
        this.docCommentOp.close()
        this.docCommentOp = undefined
        this.startPromise = undefined
        this.updateHandlerSet.clear()
    }
}