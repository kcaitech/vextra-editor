import { Communication } from "../index"
import { TunnelType } from "@/communication/types"
import { Document, CoopLocal, CoopRepository, Cmd } from "@kcdesign/data"

export type Options = {
    coopLocal: CoopLocal,
    pendingSend: any[],
}

export class DocOp extends Communication {
    private token: string = ""
    private document?: Document
    private repo?: CoopRepository
    private versionId: string = ""
    private coopLocal?: CoopLocal
    private pendingSend: any[] = []
    private needStartOt: boolean = true

    private constructor(documentId: string, versionId: string, previousCmdId?: string) {
        super(TunnelType.DocOp, {
            document_id: documentId,
            version_id: versionId,
            previous_cmd_id: previousCmdId,
        })
    }

    public static Make(token: string, documentId: string, document: Document, repo: CoopRepository, versionId: string, options?: Options): DocOp {
        const docOp = new DocOp(documentId, versionId, options?.coopLocal?.lastServerCmdId)
        docOp.token = token
        docOp.document = document
        docOp.repo = repo
        docOp.versionId = versionId
        docOp.onMessage = docOp._onMessage.bind(docOp)
        if (!options?.coopLocal) {
            docOp.coopLocal = new CoopLocal(document, repo, versionId, docOp.send.bind(docOp))
        } else {
            docOp.coopLocal = options.coopLocal
            if (options.pendingSend) docOp.pendingSend = options.pendingSend;
            docOp.needStartOt = false
        }
        docOp.coopLocal.setOnClose(() => docOp.close())
        return docOp
    }

    public hasPendingSyncCmd(): boolean {
        return this.coopLocal?.hasPendingSyncCmd?.() ?? false
    }

    public get lastServerCmdId(): string | undefined {
        return this.coopLocal?.lastServerCmdId
    }

    private _onMessage(data: any) {
        console.log("ot receive", data)
        this.coopLocal!.onMessage(data)
    }

    public setOnClose(onClose: (options?: Options) => void) {
        this.onClose = () => {
            if (this.coopLocal === undefined || this.coopLocal?.isClosed) {
                onClose()
                return
            }
            const pendingSend: any[] = []
            this.coopLocal.setSend(async (data, isListen) => {
                pendingSend.push(data)
                return true
            })
            onClose({
                coopLocal: this.coopLocal,
                pendingSend: pendingSend,
            })
        }
    }

    public async start(): Promise<boolean> {
        if (!await super.start(this.token)) return false;
        if (this.needStartOt) await this.coopLocal!.start();
        else this.coopLocal!.setSend(this.send.bind(this));
        if (this.pendingSend.length > 0) {
            for (const data of this.pendingSend) await this.send(data);
            this.pendingSend.length = 0
        }
        this.coopLocal!.commitToServer()
        return true
    }

    public addOnLocalUpdateAsync(onUpdate: (cmd: Cmd) => void) {
        this.coopLocal?.addOnLocalUpdateAsync(onUpdate)
    }

    public removeOnLocalUpdateAsync(onUpdate: (cmd: Cmd) => void) {
        this.coopLocal?.removeOnLocalUpdateAsync(onUpdate)
    }
}