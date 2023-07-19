import { Communication } from "../index"
import { TunnelType } from "@/communication/types"
import { Document, CoopLocal, CoopRepository } from "@kcdesign/data"

export enum DocCommentOpType {
    Add = 0,
    Del,
    Update,
}

export type DocCommentOpData = {
    type: DocCommentOpType
    comment: any
}

export class DocCommentOp extends Communication {
    private token: string = ""
    public onUpdated: (docCommentOpData: DocCommentOpData) => void = docCommentOpData => {}

    private constructor(documentId: string) {
        super(TunnelType.DocCommentOp, {
            document_id: documentId,
        })
    }

    public static Make(documentId: string, token: string): DocCommentOp {
        const docCommentOp = new DocCommentOp(documentId)
        docCommentOp.token = token
        docCommentOp.setOnMessage(docCommentOp.onmessage.bind(docCommentOp))
        return docCommentOp
    }

    private onmessage(data: any) {
        console.log("document comment op receive", data)
        this.onUpdated(data as DocCommentOpData)
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }
}