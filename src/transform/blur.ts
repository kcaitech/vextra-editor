import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { blurModifyHandler, ShapeView } from "@kcdesign/data";

export class BlurHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller() {
        this.asyncApiCaller = new blurModifyHandler(this.context.coopRepo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }

    executeSaturation(s: number) {
        (this.asyncApiCaller as blurModifyHandler).executeSaturation(this.shapes, s);
    }
}