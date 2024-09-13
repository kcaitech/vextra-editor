import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import {
    adapt2Shape, ColVector3D,
    GroupShape, makeShapeTransform1By2, makeShapeTransform2By1,
    ShapeType,
    ShapeView,
    Transform, TransformRaw,
    TranslateUnit,
    Transporter
} from "@kcdesign/data";
import { Selection, XY } from "@/context/selection";
import { Assist } from "@/context/assist";
import { paster_short } from "@/utils/clipboard";
import { debounce } from "lodash";
import { find_except_envs, record_origin_env } from "@/utils/migrate";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { Tool } from "@/context/tool";

type BaseFrame4Trans = {
    originTransform: Transform
}

export class TranslateHandler extends TransformHandler {
    shapes: ShapeView[];

    livingPoint: XY;
    fixedPoint: XY;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    boxOffsetLivingPointX: number = 0;
    boxOffsetLivingPointY: number = 0;

    livingBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };

    baseFrames4trans: Map<string, BaseFrame4Trans> = new Map();

    offsetX: number = 0;
    offsetY: number = 0;

    shapesSet: Set<string> = new Set();

    shapesBackup: ShapeView[] = [];
    coping: boolean = false; // 数据拷贝中

    noMigrate: boolean = false;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);

        this.shapes = shapes;

        this.livingPoint = this.workspace.getRootXY(event);

        this.fixedPoint = { ...this.livingPoint };

        context.assist.set_collect_target(shapes);
        context.assist.set_trans_target(shapes);

        this.getFrames();

        this.beforeTransform();
    }

    beforeTransform() {
        this.workspace.setCtrl('controller');
    }

    async createApiCaller() {
        if (this.context.readonly) return;
        this.context.cursor.reset();
        this.context.cursor.cursor_freeze(true);
        this.context.selection.unHoverShape();

        this.workspace.translating(true);
        this.workspace.setSelectionViewUpdater(false);

        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page, this.shapes);

        if (this.altStatus) {
            this.coping = true;
            this.shapesBackup = this.shapes.map(s => s);
            this.shapes = await paster_short(this.context, this.shapes, this.asyncApiCaller as Transporter);
            this.coping = false;

            const assist = this.context.assist;
            assist.set_collect_target(this.shapes);
            assist.set_trans_target(this.shapes);

            const selection = this.context.selection;

            selection.setLabelFixedGroup(this.shapesBackup);
            selection.setLabelLivingGroup(this.shapes);
            selection.setShowInterval(true);

            this.getFrames();
        }

        this.context.selection.setShapesSet(this.shapes);

        const t = this.asyncApiCaller as Transporter;
        t.setEnv(record_origin_env(this.shapes));
        const except_envs = find_except_envs(this.context, this.shapes, this.fixedPoint);
        t.setExceptEnvs(except_envs);
        t.setCurrentEnv(except_envs[0] as any);
    }

    private getFrames() {
        const matrixParent2rootCache = new Map<string, Transform>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.shapesSet.clear();

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const parent = shape.parent!;
            if (!parent) continue;
            const { x, y, width, height } = shape.frame;
            if (!matrixParent2rootCache.has(parent.id)) {
                matrixParent2rootCache.set(parent.id, parent.transform2FromRoot)
            }

            this.shapesSet.add(shape.id)

            const m = makeShapeTransform2By1(shape.transform).clone();
            m.addTransform(matrixParent2rootCache.get(parent.id)!);

            const { col0: LT, col1: RT, col2: RB, col3: LB } = m.transform([
                ColVector3D.FromXY(x, y),
                ColVector3D.FromXY(x + width, y),
                ColVector3D.FromXY(x + width, y + height),
                ColVector3D.FromXY(x, y + height),
            ])

            this.baseFrames4trans.set(shape.id, {
                originTransform: m
            });

            if (LT.x < left) {
                left = LT.x;
            }
            if (LT.x > right) {
                right = LT.x;
            }
            if (LT.y < top) {
                top = LT.y;
            }
            if (LT.y > bottom) {
                bottom = LT.y;
            }

            const points = [RT, RB, LB];

            for (let i = 0; i < 3; i++) {
                const p = points[i];

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

        const box = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };

        if (this.alignPixel) { // 给影子数据取整
            box.x = Math.round(box.x);
            box.y = Math.round(box.y);
            box.right = Math.round(box.right);
            box.bottom = Math.round(box.bottom);
            box.width = Math.round(box.width);
            box.height = Math.round(box.height);
        }

        this.originSelectionBox = box;

        this.livingBox = { ...this.originSelectionBox };

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

        if (this.shiftStatus) {
            const dx = Math.abs(this.livingPoint.x - this.fixedPoint.x);
            const dy = Math.abs(this.livingPoint.y - this.fixedPoint.y);

            if (dx > dy) {
                this.livingBox.y = this.originSelectionBox.y;
            } else {
                this.livingBox.x = this.originSelectionBox.x;
            }
        }

        const width = this.livingBox.width;
        const height = this.livingBox.height;

        this.livingBox.right = this.livingBox.x + width;
        this.livingBox.bottom = this.livingBox.y + height;

        let l = this.livingBox.x;
        let t = this.livingBox.y;
        let r = this.livingBox.right;
        let b = this.livingBox.bottom;

        if (this.alignPixel) {
            l = Math.round(l);
            t = Math.round(t);
            r = Math.round(r);
            b = Math.round(b);
        }

        let livingXs = [l, (l + r) / 2, r];
        let livingYs = [t, (t + b) / 2, b]

        const assist = this.context.assist;

        const assistResult = assist.alignPoints(livingXs, livingYs);
        assist.notify(Assist.CLEAR);

        if (!assistResult) {
            return;
        }

        let assistXWork = false;
        let assistYWork = false;

        if (assistResult.sticked_by_x) {
            this.livingBox.x += assistResult.dx;
            l += assistResult.dx;
            r = l + width;
            assistXWork = true;
        }

        if (assistResult.sticked_by_y) {
            this.livingBox.y += assistResult.dy;
            t += assistResult.dy;
            b = t + height;

            assistYWork = true;
        }

        const cx = (l + r) / 2;
        const cy = (t + b) / 2;

        const fixedTarget = assist.fixedTarget;

        if (assistXWork) {
            assist.multi_line_x = [
                {
                    x: l,
                    pre: [
                        { x: l, y: t },
                        { x: l, y: b }
                    ]
                },
                {
                    x: r,
                    pre: [
                        { x: r, y: t },
                        { x: r, y: b }
                    ]
                },
                {
                    x: cx,
                    pre: [
                        { x: cx, y: cy }
                    ]
                }
            ]
            if (assistResult.sparkX && fixedTarget) {
                // 高亮参考线
                const boxXs = new Set<number>([l, r, cx]);
                const lines = assist.m_guides_x.filter(i => boxXs.has(i.offsetRoot));
                const paths = assist.highlight_guide_x;
                paths.length = 0;

                if (fixedTarget.type === ShapeType.Page) {
                    const matrix = this.context.workspace.matrix;
                    const height = this.context.workspace.root.height;

                    for (let i = 0; i < lines.length; i++) {
                        const x = matrix.computeCoord2(lines[i].offsetFix, 0).x;
                        paths.push(`M${x} 0 L${x} ${height}`);
                    }
                } else {
                    const matrix = fixedTarget.matrix2Root();
                    matrix.multiAtLeft(this.context.workspace.matrix);
                    const height = fixedTarget.frame.height;

                    for (let i = 0; i < lines.length; i++) {
                        const offset = lines[i].offsetFix;
                        const start = matrix.computeCoord2(offset, 0);
                        const end = matrix.computeCoord2(offset, height);
                        paths.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                    }
                }
            } else {
                assist.highlight_guide_x = [];
            }
        } else {
            assist.multi_line_x = [];
            assist.highlight_guide_x = []
        }

        if (assistYWork) {
            assist.multi_line_y = [
                {
                    y: t,
                    pre: [
                        { x: l, y: t },
                        { x: r, y: t }
                    ]
                },
                {
                    y: b,
                    pre: [
                        { x: l, y: b },
                        { x: r, y: b }

                    ]
                },
                {
                    y: cy,
                    pre: [
                        { x: cx, y: cy }
                    ]
                }
            ]
            if (assistResult.sparkY && fixedTarget) {
                // 高亮参考线
                const boxYs = new Set<number>([t, b, cy]);
                const lines = assist.m_guides_y.filter(i => boxYs.has(i.offsetRoot));
                const paths = assist.highlight_guide_y;
                paths.length = 0;

                if (fixedTarget.type === ShapeType.Page) {
                    const matrix = this.context.workspace.matrix;
                    const width = this.context.workspace.root.width;

                    for (let i = 0; i < lines.length; i++) {
                        const y = matrix.computeCoord2(0, lines[i].offsetFix).y;
                        paths.push(`M0 ${y} L${width} ${y}`);
                    }
                } else {
                    const matrix = fixedTarget.matrix2Root();
                    matrix.multiAtLeft(this.context.workspace.matrix);
                    const width = fixedTarget.frame.width;

                    for (let i = 0; i < lines.length; i++) {
                        const offset = lines[i].offsetFix;
                        const start = matrix.computeCoord2(0, offset);
                        const end = matrix.computeCoord2(width, offset);
                        paths.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                    }
                }
            } else {
                assist.highlight_guide_y = [];
            }
        } else {
            assist.multi_line_y = [];
            assist.highlight_guide_y = [];
        }

        if (assistXWork || assistYWork) {
            assist.notify(Assist.MULTI_LINE_ASSIST);
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
        if (this.coping || this.context.readonly) return;

        const { x: originX, y: originY } = this.originSelectionBox;
        const livingX = this.livingBox.x;
        const livingY = this.livingBox.y;
        const deltaX = livingX - originX;
        const deltaY = livingY - originY;

        const transformUnits: TranslateUnit[] = [];
        const PIC = new Map<string, Transform>();
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const base = this.baseFrames4trans.get(shape.id);
            if (!base) continue;

            const parent = shape.parent;
            if (!parent) continue;

            let PI = PIC.get(parent.id);
            if (!PI) {
                const __p = parent.transform2FromRoot.getInverse();

                PIC.set(parent.id, __p);
                PI = __p;
            }

            const __t = base.originTransform
                .clone()
                .translate(ColVector3D.FromXY(deltaX, deltaY))

            if (this.alignPixel) {
                const decompose = __t.clone().decomposeTranslate();
                const intX = Math.round(decompose.x);
                const intY = Math.round(decompose.y);
                const offsetX = intX - decompose.x;
                const offsetY = intY - decompose.y;

                if (offsetX || offsetY) {
                    __t.translate(ColVector3D.FromXY(offsetX, offsetY));
                }
            }

            __t.addTransform(PI);

            const transform = makeShapeTransform1By2(__t) as TransformRaw;

            transformUnits.push({ shape, transform });
        }

        (this.asyncApiCaller as Transporter).execute(transformUnits);

        const ctx = this.context;

        ctx.nextTick(this.page, () => {
            ctx.tool.notify(Tool.RULE_RENDER_SIM);
        });

        if (this.altStatus) {
            ctx.nextTick(this.page, () => {
                ctx.selection.notify(Selection.PASSIVE_CONTOUR);
            })
        }
    }

    private __migrate(tailCollect = true) {
        if (this.noMigrate) return;

        const t = this.asyncApiCaller as Transporter;
        if (!t) return;

        const ctx = this.context;

        const pe = this.livingPoint;
        const target_parent = ctx.selection.getEnvForMigrate(pe);

        if (target_parent.id === t.current_env_id) return;

        const except = t.getExceptEnvs();

        const o_env = except.find(v => v.id === target_parent.id);

        if (o_env) {
            t.backToStartEnv(o_env.data, ctx.workspace.t('compos.dlt'));
        } else {
            const tp = adapt2Shape(target_parent) as GroupShape;
            const _shapes = compare_layer_3(this.shapes, -1).map((s) => adapt2Shape(s));
            t.migrate(tp, _shapes, ctx.workspace.t('compos.dlt'));
        }

        ctx.nextTick(ctx.selection.selectedPage!, () => {
            ctx.tool.notify(Tool.RULE_RENDER);

            if (tailCollect) {
                ctx.assist.set_collect_target(this.shapes, true);
            }
        })
    }

    migrateOnce = debounce(this.__migrate, 160);

    migrate() {
        if (this.coping) {
            return;
        }
        this.migrateOnce();
    }

    fulfil() {
        this.__migrate(false);
        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);

        if (this.altStatus) {
            this.context.selection.setLabelLivingGroup([]);
            this.context.selection.setLabelFixedGroup([]);
            this.context.selection.setShowInterval(false);
        }

        super.fulfil();
    }

    protected keydown(event: KeyboardEvent) {
        if (event.repeat) return;
        if (event.shiftKey) {
            this.shiftStatus = true;
            this.passiveExecute();
        }
        if (event.altKey) {
            this.altStatus = true;
            if (this.shapesBackup.length) {
                this.context.selection.setLabelLivingGroup(this.shapes);
                this.context.selection.setLabelFixedGroup(this.shapesBackup);
                this.context.selection.setShowInterval(true);
                this.passiveExecute();
                this.context.selection.notify(Selection.PASSIVE_CONTOUR);
            }
        }
        if (event.code === 'Space') {
            this.noMigrate = true;
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'ShiftLeft') {
            this.shiftStatus = false;
            this.passiveExecute();
        }
        if (event.code === "AltLeft") {
            this.altStatus = false;
            this.context.selection.setLabelLivingGroup([]);
            this.context.selection.setLabelFixedGroup([]);
            this.context.selection.setShowInterval(false);
        }
        if (event.code === "Space") {
            this.noMigrate = false;
        }
    }
}