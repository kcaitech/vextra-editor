import { Watchable } from "@kcdesign/data";
import { DocCommentOp, DocCommentOpData } from "@/communication/modules/doc_comment_op";

export class Comment extends Watchable(Object) {
    private docCommentOp?: DocCommentOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void

    public async start(documentId: string, token: string): Promise<boolean> {
        if (this.docCommentOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docCommentOp = DocCommentOp.Make(documentId, token)
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
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public set onUpdated(onUpdated: (docCommentOpData: DocCommentOpData) => void) {
        if (!this.docCommentOp) return
        this.docCommentOp.onUpdated = onUpdated
    }

    public available(): boolean {
        return this.docCommentOp !== undefined
    }

    public close() {
        if (!this.docCommentOp) return
        this.docCommentOp.close()
        this.docCommentOp = undefined
        this.startPromise = undefined
    }
}