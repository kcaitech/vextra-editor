import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { ArtboradView, AutoLayoutModify, GroupShapeView, PaddingDir, ShapeView } from "@kcdesign/data";

export class AutoLayoutHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller() {
        this.asyncApiCaller = new AutoLayoutModify(this.context.coopRepo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }

    executePadding(padding: number, direction: PaddingDir, padding2 = 0) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0];
        if (!(shape instanceof GroupShapeView)) return;
        if(direction === 'hor') {
            (this.asyncApiCaller as AutoLayoutModify).executeHorPadding(shape, padding, padding2);
        } else if (direction === 'ver') {
            (this.asyncApiCaller as AutoLayoutModify).executeVerPadding(shape, padding, padding2);
        } else {
            (this.asyncApiCaller as AutoLayoutModify).executePadding(shape, padding, direction);
        }
    }

    executeSpace(space: number, direction: PaddingDir) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0] as ArtboradView;
        if (!(shape instanceof GroupShapeView)) return;
        (this.asyncApiCaller as AutoLayoutModify).executeSpace(shape, space, direction);
    }

    executeSwap(shape: ShapeView, target: ShapeView[], x: number, y: number) {
        if (!(shape instanceof GroupShapeView)) return;
        (this.asyncApiCaller as AutoLayoutModify).swapShapeLayout(shape, target, x, y);
    }

}