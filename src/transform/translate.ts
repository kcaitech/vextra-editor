import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { FrameLike, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";

class TranslateHandler extends TransformHandler {
    livingPoint: XY;
    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };

    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        super(context, shapes, event);

        this.livingPoint = this.workspace.getRootXY(event);

        this.context.assist.set_trans_target(shapes);

        
    }
}