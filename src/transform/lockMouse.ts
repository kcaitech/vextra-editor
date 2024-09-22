import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { LockMouseHandler, ShapeView } from "@kcdesign/data";
import { UniformScaleUnit } from "../../../kcdesign-data/src";

export class LockMouse extends TransformHandler {
    private transType: 'scaling' | 'translating' | 'rotating' = 'translating';
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent, shapes?: ShapeView[]) {
        super(context, event);

        this.shapes = shapes || context.selection.selectedShapes;
    }

    createApiCaller(transType: 'scaling' | 'translating' | 'rotating') {
        this.asyncApiCaller = new LockMouseHandler(this.context.coopRepo, this.context.data, this.page);
        this.workspace[transType](true);
        this.workspace.setSelectionViewUpdater(false);

        this.transType = transType;
        this.workspace.translating(true); // 借用一下translating的特性
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
        this.updateCtrlView(1);
    }

    executeCounts(count: number) {
        (this.asyncApiCaller as LockMouseHandler).executeCounts(this.shapes, count);
    }

    executeInnerAngle(offset: number) {
        (this.asyncApiCaller as LockMouseHandler).executeInnerAngle(this.shapes, offset);
    }

    executeRadius(values: number[]) {
        (this.asyncApiCaller as LockMouseHandler).executeRadius(this.shapes, values);
    }

    executeShadowX(idx: number, x: number) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowX(this.shapes, idx, x);
    }

    executeShadowY(idx: number, y: number) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowY(this.shapes, idx, y);
    }

    executeShadowB(idx: number, b: number) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowB(this.shapes, idx, b);
    }

    executeShadowS(idx: number, s: number) {
        (this.asyncApiCaller as LockMouseHandler).executeShadowS(this.shapes, idx, s);
    }

    executeUniformScale(units: UniformScaleUnit[], ratio: number) {

    }

    modifyStartingAngleBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifyStartingAngleBy(shapes, delta);
    }

    modifySweepBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifySweepBy(shapes, delta);
    }
    modifyInnerRadiusBy(shapes: ShapeView[], delta: number) {
        (this.asyncApiCaller as LockMouseHandler).modifyInnerRadiusBy(shapes, delta);
    }
}