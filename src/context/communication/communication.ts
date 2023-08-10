import { Watchable } from "@kcdesign/data"
import { DocOp } from "@/context/communication/doc_op"
import { DocUpload } from "./doc_upload"
import { DocResourceUpload } from "./doc_resource_upload"
import { DocCommentOp } from "./doc_comment_op"
import { DocSelectionOp } from "./doc_selection_op"

export class Communication extends Watchable(Object) {
    public docOp = new DocOp()
    public docUpload = new DocUpload()
    public docResourceUpload = new DocResourceUpload()
    public docCommentOp = new DocCommentOp()
    public docSelectionOp = new DocSelectionOp()
}