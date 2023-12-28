import { WatchableObject } from "@kcdesign/data"
import { DocCommentOp as _DocCommentOp, DocCommentOpData } from "@/communication/modules/doc_comment_op"

export class DocCommentOp extends WatchableObject {
    private docCommentOp?: _DocCommentOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private updateHandlerSet = new Set<(data: DocCommentOpData) => void>()
    private isClosed: boolean = false

    public async start(getToken: getTokenFuncAsync, documentId: string, options?: StartOptions): Promise<boolean> {
        if (this.docCommentOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docCommentOp = _DocCommentOp.Make(await getToken(), documentId)
        const startParams = [getToken, documentId]
        docCommentOp.setOnClose(async () => {
            const diff_time = 1000 - (Date.now() - (Number.isInteger(options?.last_time) ? options!.last_time! : 0))
            if (diff_time > 0) await new Promise(resolve => setTimeout(resolve, diff_time));
            this.docCommentOp = undefined
            if (!this.isClosed) await this.start.apply(this, [...startParams, { last_time: Date.now() }] as any); // eslint-disable-line prefer-spread
        });
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