import { DViewCtx, Shape, ShapeView } from "@kcdesign/data";
import { markRaw } from "vue";

export class DomCtx extends DViewCtx {
    constructor() {
        super()
        this.setMarkRawFun(markRaw)
    }
    private idleCallback?: () => boolean;
    private beforeRender?: () => void;
    getFocusShape(): ShapeView | undefined {
        return this.focusshape as ShapeView;
    }

    // private level1Id: string | undefined;
    // getFocusLevel1Id() {
    //     return this.level1Id;
    // }

    updateFocusShape(shape: ShapeView | undefined) {
        this.focusshape = shape;
        // this.level1Id = undefined;
        // if (shape) {
        //     let p = shape.parent;
        //     while (p) {
        //         this.level1Id = shape.id;
        //         shape = p;
        //         p = shape.parent;
        //     }
        // }
    }

    setBeforeRenderCallback(cb: () => void) {
        this.beforeRender = cb;
    }

    setIdleCallback(cb: () => boolean) {
        this.idleCallback = cb;
    }

    protected onIdle(): boolean {
        const ret = super.onIdle();
        return this.idleCallback?.() ?? ret;
    }

    protected aloop(): boolean {
        if (this.beforeRender) this.beforeRender();
        return super.aloop();
    }
}