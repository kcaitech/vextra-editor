import { Communication } from "../index"
import { TunnelType } from "@/communication/types"
import { Document, CoopLocal, CoopRepository } from "@kcdesign/data"

export class Ot extends Communication {
    private token: string = ""
    private document?: Document
    private repo?: CoopRepository
    private versionId: string = ""
    private coopLocal?: CoopLocal

    private constructor(documentId: string, versionId: string) {
        super(TunnelType.DocOp, {
            document_id: documentId,
            version_id: versionId,
        })
    }

    public static Make(documentId: string, token: string, document: Document, repo: CoopRepository, versionId: string): Ot {
        const ot = new Ot(documentId, versionId)
        ot.token = token
        ot.document = document
        ot.repo = repo
        ot.versionId = versionId
        ot.onMessage = ot._onMessage.bind(ot)
        ot.coopLocal = new CoopLocal(document, repo, versionId, ot.send.bind(ot))
        ot.coopLocal.setOnClose(() => ot.close())
        return ot
    }

    public hasPendingSyncCmd(): boolean {
        return this.coopLocal?.hasPendingSyncCmd?.() ?? false
    }

    private _onMessage(data: any) {
        console.log("ot receive", data)
        this.coopLocal!.onmessage(data)
    }

    public setOnClose(onClose: () => void) {
        this.onClose = onClose
    }

    public async start(): Promise<boolean> {
        if (!await super.start(this.token)) return false;
        await this.coopLocal!.start()
        return true
    }
}