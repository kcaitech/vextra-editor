import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { ColorPicker, ShapeView } from "@kcdesign/data";

export class ColorHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller() {
        this.asyncApiCaller = new ColorPicker(this.context.coopRepo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }

    executeScale(s: number, index: number) {
        (this.asyncApiCaller as ColorPicker).executeImageScale(this.shapes, s, index);
    }
}