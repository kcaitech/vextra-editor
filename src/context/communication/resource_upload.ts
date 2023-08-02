import { Watchable } from "@kcdesign/data"
import { DocResourceUpload } from "@/communication/modules/doc_resource_upload"

export class ResourceUpload extends Watchable(Object) {
    private docResourceUpload?: DocResourceUpload
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(documentId: string, token: string): Promise<boolean> {
        if (this.docResourceUpload) return true;
        if (this.startPromise) return await this.startPromise;
        const docResourceUpload = DocResourceUpload.Make(documentId, token)
        const startParams = [token, documentId]
        docResourceUpload.setOnClose(async () => {
            this.docResourceUpload = undefined
            while (!this.isClosed && !await this.start.apply(this, startParams as any)) { // eslint-disable-line prefer-spread
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        })
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
        let count = 0
        while (count++ < 3 && !await this.docResourceUpload.uploadResource(name, data)) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        return true
    }

    public close() {
        if (this.isClosed || !this.docResourceUpload) return;
        this.isClosed = true
        this.docResourceUpload.close()
        this.docResourceUpload = undefined
        this.startPromise = undefined
    }
}