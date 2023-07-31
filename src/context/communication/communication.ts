import { Watchable } from "@kcdesign/data"
import { DocUpload } from "./doc_upload"
import { ResourceUpload } from "./resource_upload"
import { Comment } from "./comment"
import { DocOt } from "@/context/communication/doc_ot"

export class Communication extends Watchable(Object) {
    public docOt = new DocOt()
    public docUpload = new DocUpload()
    public resourceUpload = new ResourceUpload()
    public comment = new Comment()
}