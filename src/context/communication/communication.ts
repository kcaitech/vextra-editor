import { Watchable } from "@kcdesign/data";
import { Upload } from "./upload";
import { Comment } from "./comment";

export class Communication extends Watchable(Object) {
    public upload = new Upload()
    public comment = new Comment()
}