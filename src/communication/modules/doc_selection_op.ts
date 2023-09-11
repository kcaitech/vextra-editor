import { Communication } from "../index"
import { TunnelType } from "@/communication/types"

export enum DocSelectionOpType {
    Update = 0,
    Exit,
}

export type DocSelectionData = {
    select_page_id: string,
    select_shape_id_list: string[],
    hover_shape_id?: string,
    cursor_start?: number,
    cursor_end?: number,
    cursor_at_before?: boolean,
    previous_cmd_id: string,
    // 以下字段仅读取时有效
    user_id?: string,
    permission?: number,
    avatar?: string,
    nickname?: string,
    enter_time?: number,
}

export type DocSelectionOpData = {
    type: DocSelectionOpType,
    user_id: string,
    data: DocSelectionData,
}

export class DocSelectionOp extends Communication {
    private token: string = ""
    private onMessageList: ((data: DocSelectionOpData) => void)[] = []

    private constructor(documentId: string) {
        super(TunnelType.DocSelectionOp, {
            document_id: documentId,
        })
    }

    public static Make(token: string, documentId: string): DocSelectionOp {
        const docSelectionOp = new DocSelectionOp(documentId)
        docSelectionOp.token = token
        docSelectionOp.onMessage = docSelectionOp._onMessage.bind(docSelectionOp)
        return docSelectionOp
    }

    private _onMessage(data: any) {
        // console.log("document selection op receive", data)
        for (const onMessage of this.onMessageList) onMessage(data);
    }

    public async start(): Promise<boolean> {
        return await super.start(this.token)
    }

    public setOnClose(onClose: () => void) {
        this.onClose = onClose
    }

    public addOnMessage(onMessage: (data: DocSelectionOpData) => void) {
        this.onMessageList.push(onMessage)
    }

    public removeOnMessage(onMessage: (data: DocSelectionOpData) => void) {
        const index = this.onMessageList.indexOf(onMessage)
        if (this.onMessageList.indexOf(onMessage) >= 0) this.onMessageList.splice(index, 1);
    }
}