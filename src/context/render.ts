import { WatchableObject } from "@kcdesign/data";

export class RenderContext extends WatchableObject {
    private m_ctx: CanvasRenderingContext2D | null = null;

    get renderCtx(): CanvasRenderingContext2D {
        return this.m_ctx!;
    }

    registerRenderCtx(ctx: CanvasRenderingContext2D): void {
        this.m_ctx = ctx;
    }
}