import { Communication } from "../index"
import { TunnelType } from "@/communication/types"

type ResourceHeader = {
    name: string,
}

export class DocResourceUpload extends Communication {
    private token: string = ""

    private constructor(documentId: string) {
        super(TunnelType.DocResourceUpload, {
            document_id: documentId,
        })
    }

    public static Make(documentId: string, token: string): DocResourceUpload {
        const docResourceUpload = new DocResourceUpload(documentId)
        docResourceUpload.token = token
        docResourceUpload.onMessage = docResourceUpload._onMessage.bind(docResourceUpload)
        return docResourceUpload
    }

    private _onMessage(data: any) {
        console.log("document resource upload receive", data)
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }

    public async uploadResource(name: string, data: ArrayBuffer) {
        await this.send({
            name: name,
        } as ResourceHeader)
        return await this.send(data, true, 10000)
    }

    public setOnClose(onClose: () => void) {
        this.onClose = onClose
    }
}