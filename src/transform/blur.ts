import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { Blur, BlurMask, blurModifyHandler, ShapeView } from "@kcdesign/data";
import { getShapesForStyle } from "@/utils/style";

export class BlurHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = getShapesForStyle(context.selection.selectedShapes);
    }

    createApiCaller() {
        this.asyncApiCaller = new blurModifyHandler(this.context.coopRepo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }

    executeSaturation(blur: Blur, value: number) {
        const actions: { blur: Blur, value: number }[] = [];
        if (blur!.parent instanceof BlurMask) {
            actions.push({ blur: blur!, value });
        } else {
            for (let i = 0; i < this.shapes.length; i++) {
                const shape = this.shapes[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value });
            }
        }
        (this.asyncApiCaller as blurModifyHandler).executeSaturation(actions);
    }

    executeBlurMaskSaturation(sheetid: string, maskid: string, s: number) {
    }
}