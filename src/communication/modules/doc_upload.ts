import { Communication } from "../index"
import { TunnelType } from "@/communication/types"
import { Document } from "@kcdesign/data"
import { exportExForm } from "@kcdesign/data"

export enum ResponseStatus {
    Success = "success",
    Fail = "fail",
}

export type Response = {
    status?: ResponseStatus,
    message?: string,
    data?: any,
}

export class DocUpload extends Communication {
    private token: string = ""
    private promise?: Promise<Response>
    private resolve?: (value: Response) => void

    private constructor() {
        super(TunnelType.DocUpload)
    }

    public static Make(token: string): DocUpload {
        const docUpload = new DocUpload()
        docUpload.token = token
        docUpload.setOnMessage(docUpload.onmessage.bind(docUpload))
        return docUpload
    }

    private onmessage(data: Response) {
        console.log("document upload receive", data)
        this.resolve?.(data)
        this.close()
        this.promise = this.resolve = undefined
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }

    public async upload(document: Document): Promise<Response> {
        let data
        try {
            data = await exportExForm(document)
            await this.send(data)
        } catch (e) {
            console.log(e)
            return {
                status: ResponseStatus.Fail,
                message: "文档导出失败",
            }
        }
        for (let i = 0, len = data.media_names.length; i < len; i++) {
            const buffer = await document.mediasMgr.get(data.media_names[i])
            if (buffer !== undefined) await this.send(buffer.buff.buffer.slice(0));
        }
        return this.promise = new Promise<Response>(resolve => this.resolve = resolve)
    }
}