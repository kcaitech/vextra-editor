import { TransformHandler } from "@/transform/handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Action } from "@/context/tool";
import { CreatorApiCaller, ShapeView } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { Asssit } from "@/context/assist";

export class CreatorExecute extends TransformHandler {
    readonly fixedPoint: XY;
    private livingPoint: XY;

    private action: Action = Action.AutoV;

    private isCustomFrame: boolean = false;

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = Infinity;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = Infinity;

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

    modifyFrame(e: MouseEvent) {
        this.isCustomFrame = true;

        this.livingPoint = this.workspace.getRootXY(e); // 底版livingPoint

        // 修正livingPoint
        // 1. 滚轮修正 --check
        this.fixLivingPointByWheel(e);
        // 2. 动态辅助修正
        const at = this.context.assist;
        const assist = at.alignXY(this.livingPoint);
        if (assist) {
            this.updateHorFixedStatus(this.livingPoint.x, assist);
            this.updateVerFixedStatus(this.livingPoint.y, assist);
        }
        // 3. 键盘事件修正Shift、Alt


        this.__modifyFrame();
    }

    private updateHorFixedStatus(livingX: number, assistResult: { x: number, sticked_by_x: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.horFixedStatus) {
            if (Math.abs(livingX - this.horFixedValue) >= stickness) {
                this.horFixedStatus = false;
            } else {
                if (this.horFixedValue !== assistResult.x) {
                    this.horFixedValue = assistResult.x;
                }
            }
        } else if (assistResult.sticked_by_x) {
            this.horFixedStatus = true;
            this.horFixedValue = assistResult.x;
        }
    }

    private updateVerFixedStatus(livingY: number, assistResult: { y: number, sticked_by_y: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.verFixedStatus) {
            if (Math.abs(livingY - this.verFixedValue) >= stickness) {
                this.verFixedStatus = false;
            } else {
                if (this.verFixedValue !== assistResult.y) {
                    this.verFixedValue = assistResult.y;
                }
            }
        } else if (assistResult.sticked_by_y) {
            this.verFixedStatus = true;
            this.verFixedValue = assistResult.y;
        }
    }

    private __wheel_timer: any = null;
    readonly __wheel_step: number = 4;
    readonly __wheel_frame: number = 40;
    private __direction: number = 0b0000; // 上 下 左 右
    private __direction_change = false;

    private getDeltaByDirection() {
        const d = this.__direction;

        if (!d) {
            return null;
        }

        let deltaX = 0; // 往右边走
        let deltaY = 0; // 往下边走

        const step = this.__wheel_step;


        if (d & 0b0010) {
            deltaX = -step; // 往左边走
        }
        if (d & 0b1000) {
            deltaY = -step; // 往上边走
        }
        if (d & 0b0001) {
            deltaX = step; // 往右边走
        }
        if (d & 0b0100) {
            deltaY = step; // 往右边走
        }

        return { deltaX, deltaY };
    }

    private modifyDirection(e: MouseEvent) {
        const saveDirection = this.__direction;
        const padding = 5;
        this.__direction = 0b0000;
        const xy = e;
        const root = this.workspace.root;
        if (xy.x < (root.x + padding)) {
            this.__direction = this.__direction | 0b0010;
        }
        if (xy.x > (root.right - padding)) {
            this.__direction = this.__direction | 0b0001;
        }
        if (xy.y < (root.y + padding)) {
            this.__direction = this.__direction | 0b1000;
        }
        if (xy.y > (root.bottom - padding)) {
            this.__direction = this.__direction | 0b0100;
        }

        this.__direction_change = this.__direction !== saveDirection;
    }

    private fixLivingPointByWheel(e: MouseEvent) {
        this.modifyDirection(e);
        const delta = this.getDeltaByDirection();

        if (!delta) {
            if (this.__wheel_timer) {
                clearInterval(this.__wheel_timer);
                this.__wheel_timer = null;
            }
            return;
        }

        if (this.__wheel_timer) {
            if (this.__direction_change) {
                clearInterval(this.__wheel_timer);

                this.__wheel_timer = setInterval(() => {
                    this.fixLivingPointByDelta(delta, e);
                }, this.__wheel_frame);
            }

        } else {
            this.__wheel_timer = setInterval(() => {
                this.fixLivingPointByDelta(delta, e);
            }, this.__wheel_frame);
        }
    }

    private fixLivingPointByDelta(delta: { deltaX: number, deltaY: number }, e: MouseEvent) {
        const ws = this.workspace;

        ws.matrix.trans(-delta.deltaX, -delta.deltaY);
        ws.notify(WorkSpace.MATRIX_TRANSFORMATION);

        this.livingPoint = ws.getRootXY(e);

        console.log('livingPoint', this.livingPoint);
    }

    private passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        this.__modifyFrame();
    }

    private __modifyFrame() {
        if (this.altStatus) {
            // continue;
        }

        if (this.shiftStatus) {

        }
    }

    fulfil() {
        if (this.isCustomFrame) {
            // 自定义frame

        } else {
            // 点击建图

        }

        this.context.cursor.reset();

        if (this.__wheel_timer) {
            clearInterval(this.__wheel_timer);
            this.__wheel_timer = null;
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