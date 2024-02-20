import { Communication } from "@/communication/index"
import { TunnelType } from "@/communication/types"
import { CoopNet } from "@/communication/modules/doc_op/coop_net"
import { Document, CoopRepository, RadixConvert } from "@kcdesign/data"

export type Options = {

}

const radixRevert: RadixConvert = new RadixConvert(62)

export class DocOp extends Communication {
    private token: string = ""
    private document?: Document
    private repo?: CoopRepository
    private versionId: string = ""
    private coopNet?: CoopNet

    private constructor(documentId: string, versionId: string) {
        super(TunnelType.DocOp, {
            document_id: documentId,
            version_id: versionId,
        })
    }

    public static Make(token: string, documentId: string, document: Document, repo: CoopRepository, versionId: string, options?: Options): DocOp {
        const docOp = new DocOp(documentId, versionId)
        docOp.token = token
        docOp.document = document
        docOp.repo = repo
        docOp.versionId = versionId
        docOp.onMessage = docOp._onMessage.bind(docOp)
        docOp.coopNet = new CoopNet()
        docOp.coopNet.setSend(docOp.send.bind(docOp))
        repo.setNet(docOp.coopNet)
        repo.setBaseVer(radixRevert.from(document.lastCmdId))
        return docOp
    }

    public hasPendingSyncCmd(): boolean {
        return false;
    }

    private _onMessage(data: any) {
        // console.log("ot receive", data)
        this.coopNet!.onMessage(data)
    }

    public setOnClose(onClose: (options?: Options) => void) {
        this.onClose = () => {
            onClose({

            })
        }
    }

    public async start(): Promise<boolean> {
        const res = await super.start(this.token)
        this.coopNet?.setConnected(res)
        return res
    }
}