import { Watchable } from "@kcdesign/data"
import { DocUpload } from "./doc_upload"
import { ResourceUpload } from "./resource_upload"
import { Comment } from "./comment"

export class Communication extends Watchable(Object) {
    public docUpload = new DocUpload()
    public resourceUpload = new ResourceUpload()
    public comment = new Comment()
}