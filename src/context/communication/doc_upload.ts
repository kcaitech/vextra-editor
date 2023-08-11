import { Watchable, Document } from "@kcdesign/data"
import {
    DocUpload as _DocUpload,
    Response,
    ResponseStatus
} from "@/communication/modules/doc_upload"

export class DocUpload extends Watchable(Object) {
    private docUpload?: _DocUpload
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(token: string): Promise<boolean> {
        if (this.docUpload) return true;
        if (this.startPromise) return await this.startPromise;
        const documentUpload = _DocUpload.Make(token)
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await documentUpload.start()) {
                console.log("DocUpload start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("DocUpload start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docUpload = documentUpload
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public async upload(document: Document): Promise<Response> {
        if (!this.docUpload) {
            console.error("DocUpload未启动")
            return {
                status: ResponseStatus.Fail,
                message: "DocUpload未启动",
            }
        }
        return this.docUpload.upload(document)
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docUpload) return;
        this.docUpload.close()
        this.docUpload = undefined
        this.startPromise = undefined
    }
}