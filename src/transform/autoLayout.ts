import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import {
    ArtboardView,
    AutoLayoutModify,
    PaddingDir,
    ShapeView,
    Transporter
} from "@kcdesign/data";
import { XY } from "@/context/selection";

export class AutoLayoutHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];
    isTransApi: boolean = false;
    fixedPoint: XY = { x: 0, y: 0 };

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller(downXY?: XY) {
        this.asyncApiCaller = new AutoLayoutModify(this.context.coopRepo, this.context.data, this.page);
        this.isTransApi = false;
        this.fixedPoint = downXY || { x: 0, y: 0 };
    }

    createTransApiCaller() {
        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page, this.shapes);
        this.isTransApi = true;
    }

    get transApi() {
        return this.isTransApi;
    }

    fulfil() {
        super.fulfil();
    }

    executePadding(padding: number, direction: PaddingDir, padding2 = 0) {
        if (direction === 'hor') {
            (this.asyncApiCaller as AutoLayoutModify).executeHorPadding(this.shapes as ArtboardView[], padding, padding2);
        } else if (direction === 'ver') {
            (this.asyncApiCaller as AutoLayoutModify).executeVerPadding(this.shapes as ArtboardView[], padding, padding2);
        } else {
            (this.asyncApiCaller as AutoLayoutModify).executePadding(this.shapes as ArtboardView[], padding, direction);
        }
    }

    executeSpace(space: number, direction: PaddingDir) {
        (this.asyncApiCaller as AutoLayoutModify).executeSpace(this.shapes as ArtboardView[], space, direction);
    }
}