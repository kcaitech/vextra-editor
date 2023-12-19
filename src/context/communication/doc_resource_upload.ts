import { WatchableObject } from "@kcdesign/data"
import { DocResourceUpload as _DocResourceUpload } from "@/communication/modules/doc_resource_upload"

export class DocResourceUpload extends WatchableObject {
    private docResourceUpload?: _DocResourceUpload
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false

    public async start(token: string, documentId: string, options?: StartOptions): Promise<boolean> {
        if (this.docResourceUpload) return true;
        if (this.startPromise) return await this.startPromise;
        const docResourceUpload = _DocResourceUpload.Make(token, documentId)
        const startParams = [token, documentId]
        docResourceUpload.setOnClose(async () => {
            const diff_time = 1000 - (Date.now() - (Number.isInteger(options?.last_time) ? options!.last_time! : 0))
            if (diff_time > 0) await new Promise(resolve => setTimeout(resolve, diff_time));
            this.docResourceUpload = undefined
            if (!this.isClosed) await this.start.apply(this, [...startParams, { last_time: Date.now() }] as any); // eslint-disable-line prefer-spread
        });
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
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docResourceUpload) return;
        this.docResourceUpload.close()
        this.docResourceUpload = undefined
        this.startPromise = undefined
    }
}