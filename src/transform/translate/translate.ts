import { Context } from "@/context";
import { FrameLike, TransformHandler } from "../handler";
import {
    Shape,
    ArtboardView,
    ColVector3D,
    GroupShapeView,
    ShapeType,
    ShapeView,
    StackPositioning,
    TransformRaw,
    TranslateUnit,
    Transporter, AutoLayout,
    BorderPosition, ShapeFrame,
} from "@kcdesign/data";
import { Selection, XY } from "@/context/selection";
import { Assist } from "@/context/assist";
import { debounce, throttle } from "lodash";

import { Tool } from "@/context/tool";
import { message } from "@/utils/message";
import { isTarget } from "@/utils/scout";
import { ShapeDom } from "@/components/Document/Content/vdom/shape";
import { checkTidyUpShapesOrder, getHorShapeOutlineFrame, getShapesColsMapPosition, getShapesRowsMapPosition, getVerShapeOutlineFrame, layoutSpacing } from "@/utils/tidy_up";
import { sort_by_layer } from "@/utils/group_ungroup";

type BaseFrame4Trans = {
    originTransform: TransformRaw
};

type TranslateMode = 'normal' | 'layout' | 'absolute' | 'insert' | 'tidyUp';

interface LayoutForInsert {
    row: {
        grids: {
            start: number;
            end: number;
            anchor: XY;
            shape: Shape;
        }[];
        start: number;
        end: number;
    }[];
    shape: ShapeView;
    layout: AutoLayout;
}

function boundingBox(shape: Shape, includedBorder?: boolean): ShapeFrame {
    let frame = { ...shape.frame };
    if (includedBorder) {
        const border = shape.getBorders();
        let maxtopborder = 0;
        let maxleftborder = 0;
        let maxrightborder = 0;
        let maxbottomborder = 0;
        const isEnabled = border.strokePaints.some(p => p.isEnabled);
        if (isEnabled) {
            const outer = border.position === BorderPosition.Outer;
            maxtopborder = outer ? border.sideSetting.thicknessTop : border.sideSetting.thicknessTop / 2;
            maxleftborder = outer ? border.sideSetting.thicknessLeft : border.sideSetting.thicknessLeft / 2;
            maxrightborder = outer ? border.sideSetting.thicknessRight : border.sideSetting.thicknessRight / 2;
            maxbottomborder = outer ? border.sideSetting.thicknessBottom : border.sideSetting.thicknessBottom / 2;
        }
        frame.x -= maxleftborder;
        frame.y -= maxtopborder;
        frame.width += maxleftborder + maxrightborder;
        frame.height += maxtopborder + maxbottomborder;
    }
    const m = shape.transform;
    const corners = [
        { x: frame.x, y: frame.y },
        { x: frame.x + frame.width, y: frame.y },
        { x: frame.x + frame.width, y: frame.y + frame.height },
        { x: frame.x, y: frame.y + frame.height }]
        .map((p) => m.computeCoord(p));
    const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
    const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
    const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
    const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}

export class TranslateHandler extends TransformHandler {
    shapes: ShapeView[];
    shapes2: ShapeView[]; // 整理拖动时的图形
    shapesIdSet: Set<string>;
    shapesBackup: ShapeView[] = [];

    livingPoint: XY;
    fixedPoint: XY;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    boxOffsetLivingPointX: number = 0;
    boxOffsetLivingPointY: number = 0;

    livingBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };

    baseFrames4trans: Map<string, BaseFrame4Trans> = new Map();

    offsetX: number = 0;
    offsetY: number = 0;

    coping: boolean = false;

    fromMode: TranslateMode = "normal";
    mode: TranslateMode = "normal";

    isKeySPress: boolean = false;
    fulfilled: boolean = false;

    autoLayoutShape: ShapeView | undefined;

    clientXY: XY;
    downXY: XY;

    elementsWithAnimation: Set<Element> = new Set<Element>();

    preInsertLayout: ArtboardView | undefined;
    layoutForInsert: LayoutForInsert | undefined;

    noMigrate: boolean = false;

    m_shapes_map_points: XY[][] = [];
    m_shape_rows: ShapeView[][] = [];
    cur_at_index: { row: number, col: number } = { row: -1, col: -1 }
    m_dir: boolean = false; // 整理水平方向
    tidy_up_space: { hor: number, ver: number } = { hor: 0, ver: 0 } // 整理图形之间的间距
    tidy_up_start: { x: number, y: number } = { x: 0, y: 0 }; //整理开始的左上角位置
    m_adjusted_shape_rows: ShapeView[][] = []; // 拖动完成后用来最后一次整理的图形数据
    outline_frame: { x: number, y: number, height: number, width: number } = { x: 0, y: 0, height: 0, width: 0 }; // 拖动图形的root位置
    outline_index: { i: number, j: number } = { i: -1, j: -1 }// 拖动图形的下标
    moveClientXY: XY;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[], shapes2?: ShapeView[]) {
        super(context, event);
        this.shapes = shapes;
        this.shapes2 = shapes2 || shapes;
        this.shapesIdSet = new Set();
        this.livingPoint = this.workspace.getRootXY(event);
        this.fixedPoint = { ...this.livingPoint };
        context.assist.set_collect_target(shapes);
        context.assist.set_trans_target(shapes);

        this.clientXY = { x: event.clientX, y: event.clientY };
        this.downXY = { x: event.clientX, y: event.clientY };
        this.moveClientXY = { x: event.clientX, y: event.clientY };
        this.m_dir = context.selection.isTidyUpDir;
        this.getFrames();
    }

    private clearAnimation() {
        this.elementsWithAnimation.forEach(element => element.classList.remove('transition-200'));
        this.elementsWithAnimation.clear();
    }

    private setAnimation(el: Element) {
        el.classList.add('transition-200');
        this.elementsWithAnimation.add(el);
    }

    private setAnimations(layoutEnvs: GroupShapeView[]) {
        for (const env of layoutEnvs)
            for (const child of env.childs) {
                const el = (child as ShapeDom).el;
                if (el) {
                    el.classList.add('transition-200');
                    this.elementsWithAnimation.add(el)
                }
            }
    }

    setMode(m?: TranslateMode) {
        if (m) {
            this.mode = m;
            this.getOutlineFrame();
            this.getOrderShapes();
            return;
        }
        const shapes = this.shapes;
        const parents = new Set<ShapeView>();
        let allAbsolute = true;
        for (const shape of shapes) {
            parents.add(shape.parent!);
            if (shape.stackPositioning !== StackPositioning.ABSOLUTE) allAbsolute = false;
        }

        let __mode: TranslateMode;
        if (parents.size > 1) {
            __mode = "normal";
        } else {
            const parent = shapes[0].parent as ArtboardView;
            if (parent.autoLayout) {
                this.autoLayoutShape = parent;
                __mode = allAbsolute ? "absolute" : "layout";
            } else {
                __mode = "normal";
            }
        }

        this.fromMode = this.mode;
        this.mode = __mode;

        if (__mode === "layout") this.setAnimations(Array.from(parents.values()) as GroupShapeView[]);
        else if (__mode === "normal") this.clearAnimation();
    }

    beforeTransform() {
        this.workspace.setCtrl('controller');
    }

    get isLayoutMode() {
        return this.mode === "layout";
    }

    get isAbsoluteMode() {
        return this.mode === "absolute";
    }

    get isNormalMode() {
        return this.mode === "normal";
    }

    async createApiCaller(mode?: 'tidyUp') {
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
            // this.shapes = await paster_short(this.context, this.shapes, this.asyncApiCaller as Transporter);
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

        this.setMode(mode);
        this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE, this.downXY);
    }

    getOutlineFrame() {
        const shapes = this.context.selection.selectedTidyUpShapes;
        if (!shapes.length) return;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            // const matrix = new Matrix();
            // const matrix2 = new Matrix(this.context.workspace.matrix);
            // matrix.reset(matrix2);
            // const shape_root_m = shape.matrix2Root();
            // const m = (shape_root_m).clone();
            // const clientTransform = (matrix2);
            // m.addTransform(clientTransform); //root到视图
            this.outline_frame = { ...shape._p_frame };
            this.context.selection.notify(Selection.CHANGE_TIDY_UP_SHAPE, shape._p_frame);
        }
    }

    private getFrames() {
        const matrixParent2rootCache = new Map<string, TransformRaw>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        const __set = this.shapesIdSet;
        __set.clear();
        const bases = this.baseFrames4trans;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            __set.add(shape.id)

            const parent = shape.parent!;
            if (!parent) continue;
            const { x, y, width, height } = shape.frame;
            if (!matrixParent2rootCache.has(parent.id)) {
                matrixParent2rootCache.set(parent.id, (parent.matrix2Root()))
            }

            const m = (shape.transform).clone();
            m.addTransform(matrixParent2rootCache.get(parent.id)!);

            // const { col0: LT, col1: RT, col2: RB, col3: LB }
            const points = m.transform([
                ColVector3D.FromXY(x, y),
                ColVector3D.FromXY(x + width, y),
                ColVector3D.FromXY(x + width, y + height),
                ColVector3D.FromXY(x, y + height),
            ])

            bases.set(shape.id, { originTransform: m });
            const LT = points[0]
            const RT = points[1]
            const RB = points[2]
            const LB = points[3]

            if (LT.x < left) left = LT.x;
            if (LT.x > right) right = LT.x;
            if (LT.y < top) top = LT.y;
            if (LT.y > bottom) bottom = LT.y;

            // const points = [RT, RB, LB];

            for (let i = 0; i < 3; i++) {
                const p = points[i];
                if (p.x < left) left = p.x;
                if (p.x > right) right = p.x;
                if (p.y < top) top = p.y;
                if (p.y > bottom) bottom = p.y;
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

        if (this.alignPixel) {
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


    __updateLiving(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);
        this.livingBox.x = this.livingPoint.x - this.boxOffsetLivingPointX;
        this.livingBox.y = this.livingPoint.y - this.boxOffsetLivingPointY;
    }
    execute(event: MouseEvent) {
        this.__updateLiving(event);
        this.clientXY = { x: event.clientX, y: event.clientY };
        this.migrate();
        this.__execute();
        const diff = Math.hypot(event.clientX - this.moveClientXY.x, event.clientY - this.moveClientXY.y);
        if (this.mode === 'tidyUp' && diff > 8) {
            this.getMouseAtShapeIndex(event);
            this.moveClientXY = { x: event.clientX, y: event.clientY }
        }
    }

    private updateBoxByAssist() {
        let fixedY = false;
        let fixedX = false;
        if (this.shiftStatus) {
            const dx = Math.abs(this.livingPoint.x - this.fixedPoint.x);
            const dy = Math.abs(this.livingPoint.y - this.fixedPoint.y);

            if (dx > dy) {
                this.livingBox.y = this.originSelectionBox.y;
                fixedY = true;
            } else {
                this.livingBox.x = this.originSelectionBox.x;
                fixedX = true;
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

        if (assistResult.sticked_by_x && !fixedX) {
            this.livingBox.x += assistResult.dx;
            l += assistResult.dx;
            r = l + width;
            assistXWork = true;
        }

        if (assistResult.sticked_by_y && !fixedY) {
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
        if (!this.asyncApiCaller) return;
        this.__execute();
    }

    private __trans() {
        const { x: originX, y: originY } = this.originSelectionBox;
        const livingX = this.livingBox.x;
        const livingY = this.livingBox.y;
        const deltaX = livingX - originX;
        const deltaY = livingY - originY;

        const transformUnits: TranslateUnit[] = [];
        const PIC = new Map<string, TransformRaw>();
        for (let i = 0; i < this.shapes2.length; i++) {
            const shape = this.shapes2[i];

            const base = this.baseFrames4trans.get(shape.id);
            if (!base) continue;

            const parent = shape.parent;
            if (!parent) continue;

            let PI = PIC.get(parent.id);
            if (!PI) {
                const __p = (parent.matrix2Root().getInverse());

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
                if (offsetX || offsetY) __t.translate(ColVector3D.FromXY(offsetX, offsetY));
            }

            __t.addTransform(PI);

            const transform = (__t);

            transformUnits.push({ shape, transform });
        }

        (this.asyncApiCaller as Transporter).execute(transformUnits);

        const ctx = this.context;
        ctx.nextTick(this.page, () => {
            ctx.tool.notify(Tool.RULE_RENDER_SIM);
            if (this.altStatus) ctx.selection.notify(Selection.PASSIVE_CONTOUR);
        });
    }

    /**
     * @description 线性迁移
     */
    private __linear_trans() {
        this.updateBoxByAssist();
        this.__trans()
    }

    /**
     * @description 自动布局下换位
     */
    private __swap() {
        this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE_MOVE, this.clientXY);
        this.swapLayoutShape();
    }

    private __last_hover_grid_id = ''

    /**
     * @description 线性迁移
     */
    private ___pre_insert() {
        this.__trans();
        const layoutEnv = this.preInsertLayout;
        if (!layoutEnv) return;
        const ctx = this.context;
        const living = this.livingPoint;
        const xy = layoutEnv.matrix2Root().getInverse().transform(ColVector3D.FromXY(living.x, living.y));
        const layoutGrid = this.layoutForInsert;
        if (!layoutGrid) return;
        for (let i = 0; i < layoutGrid.row.length; i++) {
            const row = layoutGrid.row[i];
            const grids = row.grids;
            if (xy.y < row.start || xy.y >= row.end) continue;
            for (let j = 0; j < grids.length; j++) {
                const grid = grids[j];
                if (xy.x > grid.start && xy.x < grid.end) {
                    if (this.__last_hover_grid_id !== grid.shape.id) {
                        ctx.selection.notify(Selection.PRE_INSERT, { shape: grid.shape, layout: layoutEnv.autoLayout, env: layoutEnv, isEnd: j === grids.length - 1 });
                    }
                    this.__last_hover_grid_id = grid.shape.id;
                    break;
                }
            }
        }

    }

    private __execute() {
        if (this.coping || this.context.readonly) return;
        if (this.mode === 'normal') {
            this.__linear_trans();
        } else if (this.mode === 'layout') {
            this.__swap();
        } else if (this.mode === 'insert') {
            this.___pre_insert();
        } else if (this.mode === 'tidyUp') {
            this.__trans();
        }
    }

    private _swapLayoutShape() {
        const living = this.livingPoint;
        const shapes = this.shapes;
        const env = this.autoLayoutShape as ArtboardView;
        if (!this.shapesIdSet.size) this.shapesIdSet = new Set(shapes.map(i => i.id));
        const shapesUnderCommonEnv: ShapeView[] = env.childs;
        const __set = this.shapesIdSet;
        const scout = this.context.selection.scout;
        const shape_row: ShapeView[] = env.childs;
        const sort: Map<string, number> = new Map();
        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i];
            const index = shape_row.findIndex(item => s.id === item.id);
            if (index !== -1) sort.set(s.id, index);
        }
        for (const shape of shapesUnderCommonEnv) {
            if (__set.has(shape.id)) continue;
            if (isTarget(scout, shape, living)) {
                const tar_index = shape_row.findIndex(item => item.id === shape.id);
                (this.asyncApiCaller as Transporter).swap(env, sort_by_layer(this.context, shapes, -1), tar_index);
                break;
            }
        }
    }

    swapLayoutShape = throttle(this._swapLayoutShape, 160);

    private __migrate(tailCollect = true) {

    }

    private __tips4absolutePosition() {
        if (!this.fulfilled) message('info', '移动过程中按下S可以使图层脱离自动布局', 5);
    }

    tips4absolutePosition = debounce(this.__tips4absolutePosition, 3000)

    migrateOnce = debounce(this.__migrate, 80);
    getMouseAtShapeIndex = throttle(this._getMouseAtShapeIndex, 160);

    // 获取鼠标所在图形下标位置
    _getMouseAtShapeIndex(e: MouseEvent) {
        const xy = this.context.workspace.getContentXY(e);
        for (let i = 0; i < this.m_shapes_map_points.length; i++) {
            const points = this.m_shapes_map_points[i];
            let exit = false;
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                if (xy.x < point.x && xy.y < point.y) {
                    if ((this.cur_at_index.row !== i || this.cur_at_index.col !== j) && this.cur_at_index.row !== -1) {
                        if (i !== this.outline_index.i || j !== this.outline_index.j) {
                            this.tidyUpAdjustShape(i, j, false);
                        }
                    }
                    this.cur_at_index = { row: i, col: j }
                    exit = true;
                    break;
                } else {
                    if (this.m_dir) {
                        if (xy.y > points[points.length - 1].y && xy.x < point.x) {
                            if (this.cur_at_index.row !== i && this.cur_at_index.row !== -1) {
                                this.tidyUpAdjustShape(i, points.length, true);
                            }
                            this.cur_at_index = { row: i, col: points.length }
                            exit = true;
                            break;
                        }
                    } else {
                        if (xy.x > points[points.length - 1].x && xy.y < point.y) {
                            if (this.cur_at_index.row !== i && this.cur_at_index.row !== -1) {
                                this.tidyUpAdjustShape(i, points.length, true);
                            }
                            this.cur_at_index = { row: i, col: points.length }
                            exit = true;
                            break;
                        }
                    }
                }
            }
            if (exit) break;
        }
    }
    // 根据下标位置来调整图形所在位置
    tidyUpAdjustShape(_i: number, _j: number, end: boolean) {
        const shape_rows: ShapeView[][] = [...this.m_shape_rows];
        const targetShape = shape_rows[_i][_j];
        this.outline_index = { i: _i, j: _j }
        for (let i = 0; i < shape_rows.length; i++) {
            const row = shape_rows[i];
            const index = row.findIndex(s => s.id === this.shapes2[0].id);
            if (index !== -1) {
                shape_rows[i].splice(index, 1);
                break;
            }
        }
        if (!shape_rows[_i]) {
            shape_rows[_i] = [];
        }
        if (end) {
            shape_rows[_i].push(...this.shapes2);
        } else {
            shape_rows[_i].splice(_j, 0, ...this.shapes2);
        }
        if (targetShape) {
            const frame = targetShape._p_frame;
            (this.asyncApiCaller as Transporter).tidy_swap(this.shapes2[0], frame.x, frame.y);
            this.getTidyUpOutileFrame(shape_rows);
        } else {
            const tarShape = shape_rows[_i][Math.max(_j - 1, 0)];
            if (!tarShape) return;
            this.getTidyUpOutileFrame(shape_rows);
            const frame = tarShape._p_frame;
            (this.asyncApiCaller as Transporter).tidy_swap(this.shapes2[0], frame.x + 1, frame.y + 1);
        }
        if (this.m_dir) {
            this.m_shapes_map_points = getShapesColsMapPosition(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start);
        } else {
            this.m_shapes_map_points = getShapesRowsMapPosition(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start);
        }
        const algin = this.context.selection.tidyUpAlign;
        (this.asyncApiCaller as Transporter).tidyUpShapesLayout(shape_rows, this.tidy_up_space.hor, this.tidy_up_space.ver, this.m_dir, algin, this.tidy_up_start);
        this.__trans();
        this.m_adjusted_shape_rows = shape_rows;
    }
    // 画出拖动图形所在整理后的位置描边
    getTidyUpOutileFrame(shape_rows: ShapeView[][]) {
        if (this.m_dir) {
            getVerShapeOutlineFrame(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start, this.shapes2[0].id);
        } else {
            getHorShapeOutlineFrame(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start, this.shapes2[0].id)
        }
    }
    // 将选中的图形进行排序规定图形所在的区域位置
    getOrderShapes() {
        const shape_rows = checkTidyUpShapesOrder(this.shapes, this.m_dir);
        this.m_shape_rows = shape_rows;
        const minX = Math.min(...shape_rows[0].map(s => s._p_frame.x));
        const minY = Math.min(...shape_rows[0].map(s => s._p_frame.y));
        this.tidy_up_start = { x: minX, y: minY }
        this.tidy_up_space = layoutSpacing(shape_rows, this.m_dir);
        for (let i = 0; i < shape_rows.length; i++) {
            const row = shape_rows[i];
            let exit = false;
            for (let j = 0; j < row.length; j++) {
                const s = row[j];
                if (s.id === this.shapes2[0].id) {
                    this.outline_index = { i, j }
                    exit = true;
                    break;
                }
            }
            if (exit) break;
        }
        if (this.m_dir) {
            this.m_shapes_map_points = getShapesColsMapPosition(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start);
        } else {
            this.m_shapes_map_points = getShapesRowsMapPosition(this.context, shape_rows, this.tidy_up_space, this.tidy_up_start);
        }
    }
    migrate() {
        if (this.coping || this.mode === 'tidyUp') return;
        this.migrateOnce();
    }
    // 拖动结束后进行一次整理
    _tidyUp() {
        if (this.context.selection.selectedTidyUpShapes.length > 0 && this.asyncApiCaller) {
            const algin = this.context.selection.tidyUpAlign;
            if (this.m_adjusted_shape_rows.length === 0) this.m_adjusted_shape_rows = [...this.m_shape_rows];
            (this.asyncApiCaller as Transporter).tidyUpShapesLayout(this.m_adjusted_shape_rows, this.tidy_up_space.hor, this.tidy_up_space.ver, this.m_dir, algin, this.tidy_up_start);
        }
    }

    fulfil() {
        this._tidyUp();
        this.__migrate(false);
        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);
        if (this.altStatus) {
            this.context.selection.setLabelLivingGroup([]);
            this.context.selection.setLabelFixedGroup([]);
            this.context.selection.setShowInterval(false);
        }
        if (this.mode === "insert") {
            this.context.selection.notify(Selection.PRE_INSERT);
        }
        super.fulfil();
        this.fulfilled = true;
        this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE);
        this.clearAnimation();
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