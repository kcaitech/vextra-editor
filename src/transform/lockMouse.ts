import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { LockMouseHandler, ShapeView } from "@kcdesign/data";
import { hidden_selection } from "@/utils/content";

export class LockMouse extends TransformHandler {
    private transType: 'scaling' | 'translating' | 'rotating' = 'translating';
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller(transType: 'scaling' | 'translating' | 'rotating') {
        this.asyncApiCaller = new LockMouseHandler(this.context.coopRepo, this.context.data, this.page);
        this.workspace[transType](true);
        this.workspace.setSelectionViewUpdater(false);

        this.transType = transType;
        this.workspace.translating(true);
    }

    fulfil() {
        this.workspace[this.transType](false);
        this.workspace.translating(false);

        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }

    executeX(dx: number) {
        (this.asyncApiCaller as LockMouseHandler).executeX(this.shapes, dx);
    }

    executeY(dy: number) {
        (this.asyncApiCaller as LockMouseHandler).executeY(this.shapes, dy);
    }
    executeW(dw: number) {
        (this.asyncApiCaller as LockMouseHandler).executeW(this.shapes, dw);
    }

    executeH(dh: number) {
        (this.asyncApiCaller as LockMouseHandler).executeH(this.shapes, dh);
    }

    executeRotate(deg: number) {
        (this.asyncApiCaller as LockMouseHandler).executeRotate(this.shapes, deg);

        hidden_selection(this.context);
    }
}