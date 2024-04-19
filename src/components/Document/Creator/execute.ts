import { TransformHandler } from "@/transform/handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Action } from "@/context/tool";
import { CreatorApiCaller, ShapeView } from "@kcdesign/data";

export class CreatorExecute extends TransformHandler {
    readonly fixedPoint: XY;
    private livingPoint: XY;

    private action: Action = Action.AutoV;

    private isCustomFrame: boolean = false;

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = 0;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = 0;

    private downEnv: ShapeView;

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.livingPoint = this.workspace.getRootXY(event);
        this.fixedPoint = { ...this.livingPoint };

        this.downEnv = context.selection.getClosestContainer(this.fixedPoint);
    }

    createApiCaller() {
        this.asyncApiCaller = new CreatorApiCaller(this.context.coopRepo, this.context.data, this.page);
    }

    private modifyFrame(e: MouseEvent) {
        this.isCustomFrame = true;
        this.__modifyFrame();
    }

    private __wheel_timer: any = null;
    readonly __wheel_step: number = 3;
    readonly __wheel_frame: number = 40;
    private __direction: number = 0b0000; // 上 下 左 右

    private getDeltaByDirection() {
        const d = this.__direction;
        let deltaX = this.__wheel_step; // 往右边走
        let deltaY = this.__wheel_step; // 往下边走

        if (d & 0b1000) {
            deltaY = -deltaY; // 往上边走
        }
        if (d & 0b0010) {
            deltaX = -deltaX; // 往左边走
        }

        return { deltaX, deltaY };
    }

    private modifyDirection(e: MouseEvent) {
        const padding = 5;
        this.__direction = 0b0000;
        const xy = this.workspace.getContentXY(e);
        const root = this.workspace.root;
        if (xy.x < (root.x + padding)) {
            this.__direction = this.__direction | 0b0010;
        }
        if (xy.x > (root.right - padding)) {
            this.__direction = this.__direction | 0b0001;
        }
        if (xy.y < padding) {
            // continue...
        }
    }

    private fixLivingPointByWheel(e: MouseEvent) {

    }

    private passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        this.__modifyFrame();
    }

    private __modifyFrame() {

    }

    fulfil() {
        if (this.isCustomFrame) {
            // 自定义frame

        } else {
            // 点击建图

        }
        super.fulfil();
    }


    protected keydown(event: KeyboardEvent) {
        if (event.repeat) {
            return;
        }
        if (event.shiftKey) {
            this.shiftStatus = true;
            this.passiveExecute();
        }
        if (event.altKey) {
            this.altStatus = true;
            this.passiveExecute();
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === "ShiftLeft") {
            this.shiftStatus = false;
            this.passiveExecute();
        }
        if (event.code === "AltLeft") {
            this.altStatus = false;
            this.passiveExecute();
        }
    }
}