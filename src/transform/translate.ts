import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { FrameLike, GroupShape, Matrix, ShapeView, TranslateUnit, Transporter, adapt2Shape } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { Asssit } from "@/context/assist";
import { paster_short } from "@/utils/clipboard";
import { debounce } from "lodash";
import { find_except_envs, record_origin_env } from "@/utils/migrate";
import { compare_layer_3 } from "@/utils/group_ungroup";

type OriginEnv = {
    env: ShapeView;
    index: number;
}

type OriginEnvs = Map<string, OriginEnv>;

type BaseFrame4Trans = {
    rootXY: XY;
    x: number;
    y: number;
    width: number;
    height: number;
    rotate: number;
    flipH: boolean;
    flipV: boolean;
    parentId: string;
    rotationMatrix: Matrix;
    offsetLivingPointX: number;
    offsetLivingPointY: number;
}

export class TranslateHandler extends TransformHandler {
    livingPoint: XY;
    fixedPoint: XY;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    boxOffsetLivingPointX: number = 0;
    boxOffsetLivingPointY: number = 0;

    livingBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };

    baseFrames4trans: Map<string, BaseFrame4Trans> = new Map();

    offsetX: number = 0;
    offsetY: number = 0;
    horFixed: boolean = false;
    horFixedValue: number = 0;
    verFixed: boolean = false;
    verFixedValue: number = 0;

    currentEnvId: string = '';
    exceptEnvs: ShapeView[] = [];
    originEnvs: OriginEnvs = new Map();
    shapesSet: Set<string> = new Set();

    shapesCopy: ShapeView[] = [];

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        super(context, shapes, event);

        this.livingPoint = this.workspace.getRootXY(event);

        this.fixedPoint = { ...this.livingPoint };

        this.context.assist.set_collect_target(shapes);
        this.context.assist.set_trans_target(shapes);

        this.getFrames();

        this.beforeTransform()
    }

    beforeTransform() {
        this.context.cursor.cursor_freeze(true);
        this.workspace.setCtrl('controller');
    }

    async createApiCaller() {
        this.context.selection.unHoverShape();

        this.workspace.translating(true);
        this.workspace.setSelectionViewUpdater(false);

        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page, this.shapes);

        if (this.altStatus) {
            this.shapes = await paster_short(this.context, this.shapes, this.asyncApiCaller as Transporter);

            this.context.assist.set_collect_target(this.shapes);
            this.context.assist.set_trans_target(this.shapes);

            this.getFrames();
        }

        const t = this.asyncApiCaller as Transporter;
        t.setEnv(record_origin_env(this.shapes));
        const except_envs = find_except_envs(this.context, this.shapes, this.fixedPoint);
        t.setExceptEnvs(except_envs);
        t.setCurrentEnv(except_envs[0] as any);
    }

    private getFrames() {
        const matrixParent2rootCache = new Map<string, Matrix>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.shapesSet.clear();

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            this.shapesSet.add(shape.id)

            const frame = shape.frame;

            const cx = frame.width / 2;
            const cy = frame.height / 2;

            const rotationMatrix = new Matrix();
            rotationMatrix.trans(-cx, -cy);
            if (shape.rotation) {
                rotationMatrix.rotate(shape.rotation / 180 * Math.PI);
            }
            if (shape.isFlippedHorizontal) {
                rotationMatrix.flipHoriz();
            }
            if (shape.isFlippedVertical) {
                rotationMatrix.flipVert();
            }
            rotationMatrix.trans(cx, cy);

            const m = new Matrix(rotationMatrix);
            m.trans(frame.x, frame.y);

            const parent = shape.parent!;

            let parent2rootMatrix = matrixParent2rootCache.get(parent.id)!;
            if (!parent2rootMatrix) {
                parent2rootMatrix = parent.matrix2Root();
                matrixParent2rootCache.set(parent.id, parent2rootMatrix);
            }

            m.multiAtLeft(parent2rootMatrix);

            const rootXY = m.computeCoord2(0, 0);

            this.baseFrames4trans.set(shape.id, {
                rootXY,
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                rotate: shape.rotation || 0,
                flipH: !!shape.isFlippedHorizontal,
                flipV: !!shape.isFlippedVertical,
                parentId: parent.id,
                rotationMatrix,
                offsetLivingPointX: 0,
                offsetLivingPointY: 0
            });

            if (rootXY.x < left) {
                left = rootXY.x;
            }
            if (rootXY.x > right) {
                right = rootXY.x;
            }
            if (rootXY.y < top) {
                top = rootXY.y;
            }
            if (rootXY.y > bottom) {
                bottom = rootXY.y;
            }

            const points = [{ x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
            for (let i = 0; i < 3; i++) {
                const p = m.computeCoord3(points[i]);
                if (p.x < left) {
                    left = p.x;
                }
                if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                if (p.y > bottom) {
                    bottom = p.y;
                }
            }
        }

        this.originSelectionBox = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };
        this.livingBox = { ...this.originSelectionBox };

        this.baseFrames4trans.forEach(base => {
            base.offsetLivingPointX = base.rootXY.x - left;
            base.offsetLivingPointY = base.rootXY.y - top;
        })

        this.boxOffsetLivingPointX = this.livingPoint.x - left;
        this.boxOffsetLivingPointY = this.livingPoint.y - top;
    }

    execute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);
        this.migrate();

        this.updateBoxByAssist();

        this.__execute();

    }

    private updateBoxByAssist() {
        this.livingBox.x = this.livingPoint.x - this.boxOffsetLivingPointX;
        this.livingBox.y = this.livingPoint.y - this.boxOffsetLivingPointY;
        this.livingBox.right = this.livingBox.x + this.livingBox.width;
        this.livingBox.bottom = this.livingBox.y + this.livingBox.height;

        let l = this.livingBox.x;
        let t = this.livingBox.y;
        let r = this.livingBox.right;
        let b = this.livingBox.bottom;

        const assistResult = this.context.assist.alignPoints(
            [l, (l + r) / 2, r],
            [t, (t + b) / 2, b]
        );

        this.context.assist.notify(Asssit.CLEAR);

        let assistWork = false;
        if (assistResult) {
            this.updateHorFixedStatus(l, assistResult);
            this.updateVerFixedStatus(t, assistResult);

            if (this.horFixed) {
                this.livingBox.x += this.offsetX;
                assistWork = true;
            }
            if (this.verFixed) {
                this.livingBox.y += this.offsetY;
                assistWork = true;
            }
        }
        if (this.shiftStatus) {
            const dx = Math.abs(this.livingPoint.x - this.fixedPoint.x);
            const dy = Math.abs(this.livingPoint.y - this.fixedPoint.y);

            if (dx > dy) {
                this.livingBox.y = this.originSelectionBox.y;
            } else {
                this.livingBox.x = this.originSelectionBox.x;
            }
        }
        if (assistWork) {
            const right = this.livingBox.x + this.livingBox.width;
            const bottom = this.livingBox.y + this.livingBox.height;
            const cx = (this.livingBox.x + right) / 2;
            const cy = (this.livingBox.y + bottom) / 2;
            const xs: { x: number, pre: XY[] }[] = [
                {
                    x: this.livingBox.x,
                    pre: [
                        { x: this.livingBox.x, y: this.livingBox.y },
                        { x: this.livingBox.x, y: bottom }
                    ]
                },
                {
                    x: right,
                    pre: [
                        { x: right, y: this.livingBox.y },
                        { x: right, y: bottom }
                    ]
                },
                {
                    x: cx,
                    pre: [
                        { x: cx, y: cy }
                    ]
                }
            ]

            const ys: { y: number, pre: XY[] }[] = [
                {
                    y: this.livingBox.y,
                    pre: [
                        { x: this.livingBox.x, y: this.livingBox.y },
                        { x: right, y: this.livingBox.y }
                    ]
                },
                {
                    y: bottom,
                    pre: [
                        { x: this.livingBox.x, y: bottom },
                        { x: right, y: bottom }

                    ]
                },
                {
                    y: cy,
                    pre: [
                        { x: cx, y: cy }
                    ]
                },
            ]

            this.context.assist.multi_line_x = xs;
            this.context.assist.multi_line_y = ys;
            this.context.assist.notify(Asssit.MULTI_LINE_ASSIST);
        }
    }

    private updateHorFixedStatus(livingX: number, assistResult: {
        targetX: number,
        sticked_by_x: boolean,
        dx: number
    }) {
        const stickness = this.context.assist.stickness;
        if (this.horFixed) {
            if (Math.abs(livingX - this.horFixedValue) >= stickness) {
                this.horFixed = false;
            } else {
                if (Math.abs(assistResult.dx) < Math.abs(this.offsetX)) {
                    this.horFixedValue = livingX;
                }
                this.offsetX = assistResult.dx;
            }
        } else if (assistResult.sticked_by_x) {
            this.horFixed = true;
            this.horFixedValue = livingX;
            this.offsetX = assistResult.dx;
        }
    }

    private updateVerFixedStatus(livingY: number, assistResult: {
        targetY: number,
        sticked_by_y: boolean,
        dy: number
    }) {
        const stickness = this.context.assist.stickness;
        if (this.verFixed) {
            if (Math.abs(livingY - this.verFixedValue) >= stickness) {
                this.verFixed = false;
            } else {
                if (assistResult.dy < this.offsetY) {
                    this.verFixedValue = livingY;
                }
                this.offsetY = assistResult.dy;
            }
        } else if (assistResult.sticked_by_y) {
            this.verFixed = true;
            this.verFixedValue = livingY;
            this.offsetY = assistResult.dy;
        }
    }

    private passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        this.updateBoxByAssist();

        this.__execute();
    }

    private __execute() {
        const livingX = this.livingBox.x;
        const livingY = this.livingBox.y;

        const __root2parentMatrixCache = new Map<string, Matrix>();

        const isAlign = this.alignPixel;

        const transformUnits: TranslateUnit[] = [];
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const base = this.baseFrames4trans.get(shape.id);

            if (!base) {
                continue;
            }

            const frame = shape.frame;

            const __m = new Matrix();
            const cx = frame.width / 2;
            const cy = frame.height / 2;
            __m.trans(-cx, -cy);
            if (shape.rotation) {
                __m.rotate((shape.rotation || 0) / 180 * Math.PI);
            }
            if (shape.isFlippedHorizontal) {
                __m.flipHoriz();
            }
            if (shape.isFlippedVertical) {
                __m.flipVert();
            }
            __m.trans(cx, cy);
            __m.trans(shape.frame.x, shape.frame.y);

            const _targetXY = __m.computeCoord2(0, 0);

            const parent = shape.parent!;
            let m = __root2parentMatrixCache.get(parent.id)!;
            if (!m) {
                m = new Matrix(parent.matrix2Root().inverse);
                __root2parentMatrixCache.set(parent.id, m);
            }

            const tx = isAlign ? Math.round(base.offsetLivingPointX + livingX) : base.offsetLivingPointX + livingX;
            const ty = isAlign ? Math.round(base.offsetLivingPointY + livingY) : base.offsetLivingPointY + livingY;

            const targetXY = m.computeCoord2(tx, ty);

            const x = shape.frame.x + (targetXY.x - _targetXY.x);
            const y = shape.frame.y + (targetXY.y - _targetXY.y);

            transformUnits.push({ shape, x, y });
        }

        (this.asyncApiCaller as Transporter).excute(transformUnits);
    }

    private __migrate() {
        const t = this.asyncApiCaller as Transporter;
        if (!t) {
            return;
        }

        const pe = this.livingPoint;
        const target_parent = this.context.selection.getEnvForMigrate(pe);
        const except = t.getExceptEnvs();

        const o_env = except.find(v => v.id === target_parent.id);

        if (o_env) {
            t.backToStartEnv(o_env.data, this.context.workspace.t('compos.dlt'));
        } else {
            const tp = adapt2Shape(target_parent) as GroupShape;
            const _shapes = compare_layer_3(this.shapes, -1).map((s) => adapt2Shape(s));
            t.migrate(tp, _shapes, this.context.workspace.t('compos.dlt'));
        }

        this.context.assist.set_collect_target(this.shapes, true);
    }

    migrateOnce = debounce(this.__migrate, 160);

    migrate() {
        this.migrateOnce();
    }

    fulfil() {
        this.__migrate();
        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);
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
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'ShiftLeft') {
            this.shiftStatus = false;
            this.passiveExecute();
        }
    }
}