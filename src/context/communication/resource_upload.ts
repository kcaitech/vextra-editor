import { Watchable } from "@kcdesign/data"
import { DocResourceUpload } from "@/communication/modules/doc_resource_upload"

export class ResourceUpload extends Watchable(Object) {
    private docResourceUpload?: DocResourceUpload
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void

    public async start(documentId: string, token: string): Promise<boolean> {
        if (this.docResourceUpload) return true;
        if (this.startPromise) return await this.startPromise;
        const docResourceUpload = DocResourceUpload.Make(documentId, token)
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docResourceUpload.start()) {
                console.log("DocResourceUpload start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("DocResourceUpload start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docResourceUpload = docResourceUpload
        this.startResolve!(true)
        this.startPromise = undefined
        return true
    }

    public available(): boolean {
        return this.docResourceUpload !== undefined
    }

    public async upload(name: string, data: ArrayBuffer): Promise<boolean> {
        if (!this.docResourceUpload) {
            console.error("DocResourceUpload未启动")
            return false
        }
        await this.docResourceUpload.uploadResource(name, data)
        return true
    }

    public close() {
        if (!this.docResourceUpload) return;
        this.docResourceUpload.close()
        this.docResourceUpload = undefined
        this.startPromise = undefined
    }
}