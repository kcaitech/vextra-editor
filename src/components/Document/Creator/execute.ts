import { TransformHandler } from "@/transform/handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Action, ResultByAction, Tool } from "@/context/tool";
import {
    Color,
    ColVector3D,
    ContactForm,
    ContactLineView,
    CreatorApiCaller,
    Fill,
    FillType,
    GeneratorParams,
    GroupShapeView,
    Matrix,
    ShapeFrame,
    ShapeType,
    ShapeView,
    Transform
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { v4 } from "uuid";
import { collect } from "@/utils/artboardFn";
import { round2half } from "@/transform/line";
import { getHorizontalAngle } from "@/utils/common";
import { get_contact_environment } from "@/utils/contact";
import { debounce } from "lodash";
import { ContextEvents } from "@/openapi";
import { CursorType } from "@/utils/cursor2";
import { compare_layer_3, filter_for_group1 } from "@/utils/group_ungroup";

export function __add_status_for_create(context: Context) {
    context.menu.menuMount();

    context.cursor.setType(CursorType.Create, 0);
    context.notify(ContextEvents.action_change);

    context.escstack.save('tool-action', () => {
        context.cursor.reset();
        return context.tool.reset();
    });
}

export function useAuto(context: Context) {
    const tool = context.tool;
    tool.setAction(Action.AutoV);
    tool.notify(Tool.CHANGE_ACTION);

    context.menu.menuMount();

    context.cursor.setType(CursorType.Auto, 0);
    context.notify(ContextEvents.action_change);
}

/**
 * @description 使用容器工具
 */
export function useFrame(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddFrame);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用矩形工具
 */
export function useRect(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddRect);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用圆形工具
 */
export function useEllipse(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddEllipse);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用直线工具
 */
export function useLine(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddLine);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用等比缩放工具
 */
export function useAutoK(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AutoK);
    tool.notify(Tool.CHANGE_ACTION);

    context.menu.menuMount();
    context.notify(ContextEvents.action_change);

    context.escstack.save('tool-action', () => {
        context.cursor.reset();
        return context.tool.reset();
    });
}

/**
 * @description 使用箭头工具
 */
export function useArrow(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddArrow);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用多边形工具
 */
export function usePolygon(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.Polygon);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用星形工具
 */
export function useStar(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.Star);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用钢笔工具
 */
export function usePen(context: Context) {
    const tool = context.tool;
    tool.setAction(Action.Pen);
    tool.notify(Tool.CHANGE_ACTION);
    context.menu.menuMount();
    context.escstack.save('tool-action', context.tool.reset.bind(context.tool));
    context.cursor.setType(CursorType.Pen, 0);
    context.notify(ContextEvents.action_change);
}

/**
 * @description 使用文本工具
 */
export function useText(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddText);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用切图工具
 */
export function useCutout(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddCutout);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

export function useMask(context: Context) {
    const page = context.selection.selectedPage!
    const shapes = compare_layer_3(filter_for_group1(context.selection.selectedShapes));
    const editor = context.editor4Page(page);
    editor.makeMask(shapes, context.workspace.t('system.mask_group'));
}

/**
 * @description 使用连接线工具
 */
export function useContact(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    const tool = context.tool;
    tool.setAction(Action.AddContact);
    tool.notify(Tool.CHANGE_ACTION);

    __add_status_for_create(context);
}

/**
 * @description 使用图片工具
 */
export function useImage(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    context.tool.notify(Tool.SELECT_IMAGE);
}

export function useComment(context: Context) {
    if (context.workspace.is_path_edit_mode) return;
    context.cursor.setType(CursorType.Comment, 0);
    context.escstack.save('tool-action', () => {
        context.cursor.reset();
        return context.tool.reset();
    });
}

export class CreatorExecute extends TransformHandler {
    readonly fixedPoint: XY;
    private livingPoint: XY;

    readonly action: string = Action.AutoV;

    private isCustomFrame: boolean = false;

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = Infinity;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = Infinity;

    readonly downEnv: ShapeView;
    private frame: ShapeFrame = new ShapeFrame(0, 0, 100, 100);

    private shape: ShapeView | undefined;

    readonly shapeType: ShapeType;
    private namePrefix: string | undefined;

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.livingPoint = this.workspace.getRootXY(event);
        this.fixedPoint = { ...this.livingPoint };

        const fixed = this.fixedPoint;
        const assist = this.context.assist.alignXY2(fixed);

        if (assist.sticked_by_x) {
            fixed.x = assist.x;
        }
        if (assist.sticked_by_y) {
            fixed.y = assist.y;
        }

        if (context.user.isPixelAlignMent) {
            fixed.x = Math.round(fixed.x);
            fixed.y = Math.round(fixed.y);
        }

        this.downEnv = context.selection.getClosestContainer(fixed); // 确认落点环境

        this.action = context.tool.action; // 记录点击时的动作类型，避免中途切换动作类型造成的影响

        this.shapeType = ResultByAction(this.action) || ShapeType.Rectangle;
    }

    createApiCaller() {
        this.asyncApiCaller = new CreatorApiCaller(this.context.coopRepo, this.context.data, this.page);
    }

    modifyFrame(e: MouseEvent) {
        this.isCustomFrame = true;

        this.livingPoint = this.workspace.getRootXY(e); // 底版livingPoint

        // 修正livingPoint
        // 1. 滚轮修正
        this.fixLivingPointByWheel(e);

        // 2. 动态辅助修正
        const at = this.context.assist;
        const __living = { ...this.livingPoint };
        if (this.alignPixel) {
            if (this.action === Action.AddArrow || this.action === Action.AddLine) {
                __living.x = round2half(__living.x);
                __living.y = round2half(__living.y);
            } else {
                __living.x = Math.round(__living.x);
                __living.y = Math.round(__living.y);
            }
        }
        const assist = at.alignXY(__living);
        if (assist) {
            this.updateHorFixedStatus(__living.x, assist);
            this.updateVerFixedStatus(__living.y, assist);
        }
        if (this.horFixedStatus) {
            this.livingPoint.x = this.horFixedValue;
        }
        if (this.verFixedStatus) {
            this.livingPoint.y = this.verFixedValue;
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

    // 滚轮
    private __wheel_timer: any = null;
    readonly __wheel_step: number = 10;
    readonly __wheel_frame: number = 16;
    private __direction: number = 0b0000; // 上 下 左 右

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
    }

    private fixLivingPointByWheel(e: MouseEvent) {
        this.modifyDirection(e);
        const delta = this.getDeltaByDirection();

        if (!delta) {
            if (this.__wheel_timer) {
                clearInterval(this.__wheel_timer);
                this.__wheel_timer = null;
            }
            return false;
        }

        this.fixLivingPointByDelta(delta, e);

        const that = this;

        if (this.__wheel_timer) {
            clearInterval(this.__wheel_timer);
        }

        this.__wheel_timer = setInterval(function () {
            that.fixLivingPointByDelta(delta, e);
        }, this.__wheel_frame);

        return true;
    }

    private fixLivingPointByDelta(delta: { deltaX: number, deltaY: number }, e: MouseEvent) {
        const ws = this.workspace;

        ws.matrix.trans(-delta.deltaX, -delta.deltaY);
        ws.notify(WorkSpace.MATRIX_TRANSFORMATION);

        this.livingPoint = ws.getRootXY(e);

        this.__modifyFrame();
    }

    private passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        this.__modifyFrame();
    }

    private __modifyFrame() {
        const action = this.action;
        if (action === Action.AddContact) {
            this.__searchContact()
        } else if (action === Action.AddArrow || action === Action.AddLine) {
            this.__extendLine();
        } else {
            this.__extendFrame();
        }
        this.context.nextTick(this.page, () => {
            this.context.tool.notify(Tool.RULE_RENDER);
        });
    }

    initContact(apex?: ContactForm) {
        const frame = this.frame;
        const fixedPoint = { ...this.fixedPoint };

        frame.x = fixedPoint.x;
        frame.y = fixedPoint.y;

        frame.width = 1;
        frame.height = 1;

        const namePrefix = this.workspace.t(`shape.${ShapeType.Contact}`);

        const targetTransform = this.getTargetTransform(this.downEnv, frame);

        const params: GeneratorParams = {
            parent: this.downEnv as GroupShapeView,
            frame: new ShapeFrame(frame.x, frame.y, frame.width, frame.height),
            type: ShapeType.Contact,
            namePrefix,
            isFixedRatio: this.shiftStatus,
            shape: this.shape,
            transform2: targetTransform
        };

        params.apex = apex;

        if (!this.asyncApiCaller) {
            this.createApiCaller();
        }

        const shape = (this.asyncApiCaller as CreatorApiCaller).generator(params);

        if (shape) {
            const selection = this.context.selection;
            this.context.nextTick(
                selection.selectedPage!,
                () => {
                    this.shape = selection.selectedPage!.getShape(shape.id);
                    if (!this.shape) {
                        return;
                    }
                    this.context.assist.set_trans_target([(this.shape)]);
                    selection.selectShape(this.shape);
                }
            );
        }

    }

    contactTo(to: ContactForm, point: XY) {
        if (!(this.shape instanceof ContactLineView)) {
            return;
        }

        let m = this.shape.matrix2Root();
        m.preScale(1, 1);
        m = new Matrix(m.inverse);

        (this.asyncApiCaller as CreatorApiCaller).contactTo(m.computeCoord3(this.livingPoint), to);
    }

    private __migrate(targetEnv: GroupShapeView) {
        (this.asyncApiCaller as CreatorApiCaller).migrate(targetEnv)
    }

    private migrate = debounce(this.__migrate, 200);

    private __searchContact() {
        if (!(this.shape instanceof ContactLineView)) {
            return;
        }

        let m = this.shape.matrix2Root();
        m.preScale(1, 1);
        m = new Matrix(m.inverse);

        (this.asyncApiCaller as CreatorApiCaller).contactTo(m.computeCoord3(this.livingPoint));

        const points = this.shape.getPoints();

        const environment = get_contact_environment(this.context, this.shape, points)!;

        if (this.shape.parent?.id !== environment.id) {
            this.migrate(environment as GroupShapeView);
        }
    }

    private __extendLine() {
        const type = this.shapeType;

        if (!this.shape) {
            const frame = this.frame;
            const fixedPoint = { ...this.fixedPoint };

            frame.x = fixedPoint.x;
            frame.y = fixedPoint.y;

            frame.width = 1;
            frame.height = 1;


            if (!this.namePrefix) {
                this.namePrefix = this.workspace.t(`shape.${type}`);
            }
            const namePrefix = this.namePrefix!;

            const targetTransform = this.getTargetTransform(this.downEnv, frame);

            const params: GeneratorParams = {
                parent: this.downEnv as GroupShapeView,
                frame: new ShapeFrame(frame.x, frame.y, frame.width, frame.height),
                type,
                namePrefix,
                isFixedRatio: false,
                shape: this.shape,
                transform2: targetTransform
            };

            if (this.action === Action.AddArrow) {
                params.mark = true;
            }

            const shape = (this.asyncApiCaller as CreatorApiCaller).generator(params);

            if (!shape) {
                return;
            }

            const selection = this.context.selection;
            this.context.nextTick(selection.selectedPage!, () => {
                    this.shape = selection.selectedPage!.getShape(shape.id);
                    if (!this.shape) {
                        return;
                    }
                    this.context.assist.set_trans_target([(this.shape)]);
                    selection.selectShape(this.shape);
                }
            );
        } else {
            const _start = { x: this.fixedPoint.x, y: this.fixedPoint.y + 0.5 };

            let m = new Matrix(this.shape.matrix2Root());
            m.preScale(this.frame.width, this.frame.height); // 可有可无

            m = new Matrix(m.inverse);

            const living = { ...this.livingPoint };
            if (this.alignPixel) {
                living.x = round2half(living.x);
                living.y = round2half(living.y);
            }

            const start = m.computeCoord3(_start);
            const end = m.computeCoord3(living);

            if (this.shiftStatus) {
                const angle = getHorizontalAngle(_start, living);
                if (angle >= 0 && angle < 22.5) {
                    end.y = start.y;
                } else if (angle >= 22.5 && angle < 67.5) {
                    const a = angle / 180;
                    const __m = new Matrix();
                    __m.rotate((0.25 - a) * Math.PI, start.x, start.y);
                    const __end = __m.computeCoord3(end);

                    end.x = __end.x;
                    end.y = __end.y;
                } else if (angle >= 67.5 && angle < 112.5) {
                    end.x = start.x;
                } else if (angle >= 112.5 && angle < 157.5) {
                    const a = angle / 180;
                    const __m = new Matrix();
                    __m.rotate((0.75 - a) * Math.PI, start.x, start.y);
                    const __end = __m.computeCoord3(end);

                    end.x = __end.x;
                    end.y = __end.y;
                } else if (angle >= 157.5 && angle < 202.5) {
                    end.y = start.y;
                } else if (angle >= 202.5 && angle < 247.5) {
                    const a = angle / 180;
                    const __m = new Matrix();
                    __m.rotate((1.25 - a) * Math.PI, start.x, start.y);
                    const __end = __m.computeCoord3(end);

                    end.x = __end.x;
                    end.y = __end.y;
                } else if (angle >= 247.5 && angle < 292.5) {
                    const a = angle / 180;
                    const __m = new Matrix();
                    __m.rotate((1.5 - a) * Math.PI, start.x, start.y);
                    const __end = __m.computeCoord3(end);

                    end.x = __end.x;
                    end.y = __end.y;
                } else if (angle >= 292.5 && angle < 337.5) {
                    const a = angle / 180;
                    const __m = new Matrix();
                    __m.rotate((1.75 - a) * Math.PI, start.x, start.y);
                    const __end = __m.computeCoord3(end);

                    end.x = __end.x;
                    end.y = __end.y;
                } else {
                    end.y = start.y;
                }
            }

            if (this.altStatus) {
                start.x = 2 * start.x - end.x;
                start.y = 2 * start.y - end.y;
            }

            (this.asyncApiCaller as CreatorApiCaller).extendLine(start, end);
        }
    }

    private __extendFrame() {
        const frame = this.frame;

        const fixedPoint = { ...this.fixedPoint };
        const livingPoint = { ...this.livingPoint };

        if (this.shiftStatus) {
            const h = Math.abs(livingPoint.y - fixedPoint.y);
            const w = Math.abs(livingPoint.x - fixedPoint.x);

            if (h > w) {
                livingPoint.x = livingPoint.x + ((h - w) * ((livingPoint.x - fixedPoint.x) / w));
            } else {
                livingPoint.y = livingPoint.y + ((w - h) * ((livingPoint.y - fixedPoint.y) / h));
            }
        }

        if (this.altStatus) {
            const __x = livingPoint.x - fixedPoint.x;
            const __y = livingPoint.y - fixedPoint.y;

            fixedPoint.x = fixedPoint.x - __x;
            fixedPoint.y = fixedPoint.y - __y;
        }

        const cx = fixedPoint.x < livingPoint.x; // 是否为往右拓展
        const cy = fixedPoint.y < livingPoint.y;

        const left = cx ? fixedPoint.x : livingPoint.x;
        const right = cx ? livingPoint.x : fixedPoint.x;
        const top = cy ? fixedPoint.y : livingPoint.y;
        const bottom = cy ? livingPoint.y : fixedPoint.y;

        frame.x = left;
        frame.y = top;
        frame.width = right - left;
        frame.height = bottom - top;

        const targetTransform = this.getTargetTransform(this.downEnv, frame);

        this.fixedByUserConfig();

        const type = ResultByAction(this.action);

        if (!type) {
            return;
        }

        const namePrefix = this.workspace.t(`shape.${type}`);

        if (frame.width === 0 || frame.height === 0 || isNaN(frame.x) || isNaN(frame.y) || isNaN(frame.width) || isNaN(frame.height)) {
            return;
        }

        const params: GeneratorParams = {
            parent: this.downEnv as GroupShapeView,
            frame: new ShapeFrame(frame.x, frame.y, frame.width, frame.height),
            type,
            namePrefix,
            isFixedRatio: this.shiftStatus,
            shape: this.shape,
            transform2: targetTransform
        };

        if (type === ShapeType.Text) {
            params.textFormat = this.context.textSelection.getTextAttr;
        }

        const shape = (this.asyncApiCaller as CreatorApiCaller).generator(params);

        if (shape && !this.shape) {
            const selection = this.context.selection;
            this.context.nextTick(
                selection.selectedPage!,
                () => {
                    this.shape = selection.selectedPage!.getShape(shape.id);
                    if (this.shape) {
                        this.context.assist.set_trans_target([(this.shape)]);
                        selection.selectShape(this.shape);
                    }
                }
            );
        }
    }

    private getTargetTransform(env: ShapeView, frame: ShapeFrame) {
        const envFromRoot = env.transform2FromRoot.clone();

        const selectionTransform = new Transform()
            .setTranslate(ColVector3D.FromXY(frame.x, frame.y));

        const targetTransform = selectionTransform
            .addTransform(envFromRoot.getInverse());

        const scale = targetTransform.decomposeScale();

        frame.width = frame.width * Math.abs(scale.x);
        frame.height = frame.height * Math.abs(scale.y);

        return targetTransform.clearScaleSize();
    }

    private fixedByUserConfig() {
        const align = this.alignPixel;

        const f = this.frame;

        if (align) {
            f.x = Math.round(f.x);
            f.y = Math.round(f.y);
            f.width = Math.round(f.width);
            f.height = Math.round(f.height);

            if (f.width < 1) {
                f.width = 1;
            }
            if (f.height < 1) {
                f.height = 1;
            }
        }
    }

    private createImmediate() {
        const action = this.action;

        if (!this.asyncApiCaller) {
            this.createApiCaller();
        }

        const env = this.downEnv as GroupShapeView;
        const frame = this.frame;

        const xy = { ...this.livingPoint };

        const type = ResultByAction(action);

        if (!type) {
            return;
        }

        frame.x = xy.x - 50;
        frame.y = xy.y - 50;

        if (type === ShapeType.Text) {
            frame.x = xy.x;
            frame.y = xy.y - 10;
        }

        const targetTransform = this.getTargetTransform(env, frame);

        this.fixedByUserConfig();

        const namePrefix = this.workspace.t(`shape.${type}`);

        const params: GeneratorParams = {
            parent: env,
            frame: new ShapeFrame(frame.x, frame.y, frame.width, frame.height),
            type,
            namePrefix,
            isFixedRatio: this.shiftStatus,
            shape: this.shape,
            transform2: targetTransform
        };

        if (type === ShapeType.Text) {
            params.frame.x += 50;
            params.frame.y += 38;
            params.frame.width = 20;
            params.frame.height = 24;
            params.textFormat = this.context.textSelection.getTextAttr;
        }

        if (action === Action.AddLine || action === Action.AddArrow) {
            params.frame.x += 50;
            params.frame.y += 49.5;
            params.frame.width = 100;
            params.frame.height = 1;
        }

        if (type === ShapeType.Artboard && this.downEnv.type === ShapeType.Page) {
            params.fill = new Fill([0] as any, v4(), true, FillType.SolidColor, new Color(1, 255, 255, 255));
        }

        const shape = (this.asyncApiCaller as CreatorApiCaller).generator(params);

        if (shape) {
            const selection = this.context.selection;
            this.context.nextTick(
                selection.selectedPage!,
                () => {
                    const __s = selection.selectedPage!.getShape(shape.id);
                    if (!__s) {
                        return;
                    }
                    selection.selectShape(__s);
                }
            );
        }
    }

    fulfil() {
        const context = this.context;
        const action = this.action;
        if (this.isCustomFrame) {
            // 自定义frame
        } else {
            // 点击建图
            this.createImmediate();
        }

        if (action === Action.AddText) {
            context.selection.setSelectionNewShapeStatus(true);
            context.workspace.notify(WorkSpace.INIT_EDITOR, 0);
        } else if (action === Action.AddFrame) {
            if (this.isCustomFrame) {
                const children = collect(this.context);
                (this.asyncApiCaller as CreatorApiCaller).collect(children);
            }
        }

        context.tool.setAction(Action.AutoV);

        if (this.__wheel_timer) {
            clearInterval(this.__wheel_timer);
            this.__wheel_timer = null;
        }

        super.fulfil();
        context.cursor.reset();
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
        const code = event.code;
        if (code === "ShiftLeft") {
            this.shiftStatus = false;
            this.passiveExecute();
        }
        if (code === "AltLeft" || code === "AltRight") {
            this.altStatus = false;
            this.passiveExecute();
        }
    }
}