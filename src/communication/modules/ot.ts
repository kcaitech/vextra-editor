import { Communication } from "../index"
import { TunnelType } from "@/communication/types"
import { Document, CoopLocal, CoopRepository } from "@kcdesign/data"

export type Options = {
    coopLocal: CoopLocal,
    pendingSend: any[],
}

export class Ot extends Communication {
    private token: string = ""
    private document?: Document
    private repo?: CoopRepository
    private versionId: string = ""
    private coopLocal?: CoopLocal
    private pendingSend: any[] = []
    private needStartOt: boolean = true

    private constructor(documentId: string, versionId: string, lastCmdId?: string) {
        super(TunnelType.DocOp, {
            document_id: documentId,
            version_id: versionId,
            last_cmd_id: lastCmdId,
        })
    }

    public static Make(documentId: string, token: string, document: Document, repo: CoopRepository, versionId: string, options?: Options): Ot {
        const ot = new Ot(documentId, versionId, options?.coopLocal?.lastServerCmdId)
        ot.token = token
        ot.document = document
        ot.repo = repo
        ot.versionId = versionId
        ot.onMessage = ot._onMessage.bind(ot)
        if (!options?.coopLocal) {
            ot.coopLocal = new CoopLocal(document, repo, versionId, ot.send.bind(ot))
        } else {
            ot.coopLocal = options.coopLocal
            if (options.pendingSend) ot.pendingSend = options.pendingSend;
            ot.needStartOt = false
        }
        ot.coopLocal.setOnClose(() => ot.close())
        return ot
    }

    public hasPendingSyncCmd(): boolean {
        return this.coopLocal?.hasPendingSyncCmd?.() ?? false
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
}