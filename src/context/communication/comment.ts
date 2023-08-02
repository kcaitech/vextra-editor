import { Watchable } from "@kcdesign/data"
import { DocCommentOp, DocCommentOpData } from "@/communication/modules/doc_comment_op"

export class Comment extends Watchable(Object) {
    private docCommentOp?: DocCommentOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private updateHandlerSet = new Set<(data: DocCommentOpData) => void>()
    private isClosed: boolean = false

    public async start(documentId: string, token: string): Promise<boolean> {
        if (this.docCommentOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docCommentOp = DocCommentOp.Make(documentId, token)
        const startParams = [token, documentId]
        docCommentOp.setOnClose(async () => {
            this.docCommentOp = undefined
            while (!this.isClosed && !await this.start.apply(this, startParams as any)) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        })
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docCommentOp.start()) {
                console.log("DocCommentOp start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("DocCommentOp start失败", e)
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

    public available(): boolean {
        return this.docCommentOp !== undefined
    }

    public close() {
        if (this.isClosed || !this.docCommentOp) return;
        this.isClosed = true
        this.docCommentOp.close()
        this.docCommentOp = undefined
        this.startPromise = undefined
        this.updateHandlerSet.clear()
    }
}