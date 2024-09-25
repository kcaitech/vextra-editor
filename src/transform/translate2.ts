import { TransformHandler } from "@/transform/handler";
import {
    ArtboradView, ColVector3D, makeShapeTransform1By2,
    Matrix,
    Shape, ShapeType,
    ShapeView,
    Transform,
    TransformRaw,
    TranslateUnit,
    Transporter
} from "@kcdesign/data";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import { ShapeDom } from "@/components/Document/Content/vdom/shape";
import { Tool } from "@/context/tool";
import { Assist } from "@/context/assist";

enum TranslateMode {
    Linear = 'linear',
    Prev = 'prev',
    Flex = 'flex',
    Fixed = 'fixed'
}

interface TranslateBaseItem {
    transformRaw: TransformRaw,
    transform: Transform;
    view: ShapeView;
}

/**
 * @description 处理图层迁移操作
 */
class Portal {
    // private __living_env: ShapeView;
    // private __background_env: ShapeView[];
    constructor(shapes: ShapeView[]) {
    }

    private __return() {
    }

    private __migrate() {
    }

    migrate() {
    }
}

/**
 * @description 数据模型
 */
class SelModel {
    private readonly transport: Translate2;
    private readonly context: Context;
    private readonly fixed: XY;

    private readonly offsetX: number;
    private readonly offsetY: number;

    originSelBox;
    livingSelBox;
    alignPixel: boolean;

    constructor(transport: Translate2, context: Context, event: MouseEvent) {
        this.transport = transport;
        this.context = context;
        this.fixed = context.workspace.getRootXY(event);
        this.alignPixel = context.user.isPixelAlignMent;

        const box = this.__box(transport.selManager.shapes);
        this.originSelBox = box;
        this.livingSelBox = { ...box };
        const living = transport.living;
        this.offsetX = living.x - box.x;
        this.offsetY = living.y - box.y;

    }

    private __box(shapes: ShapeView[]) {
        const cache = new Map<ShapeView, Matrix>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        for (const shape of shapes) {
            const parent = shape.parent!;

            let p2r = cache.get(parent)!;
            if (!p2r) {
                p2r = parent.matrix2Root();
                cache.set(parent, p2r);
            }

            const matrix = shape.matrix2Parent();
            matrix.multiAtLeft(p2r);
            const { x, y, width, height } = shape.frame;
            const points = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }].map(i => matrix.computeCoord3(i));

            for (const point of points) {
                if (point.x < left) left = point.x;
                else if (point.y > right) right = point.x;

                if (point.y < top) top = point.y;
                else if (point.y > bottom) bottom = point.y;
            }
        }

        if (this.alignPixel) {
            left = Math.round(left);
            right = Math.round(right);
            top = Math.round(top);
            bottom = Math.round(bottom);
        }

        return {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        }
    }

    fix() {
        const transport = this.transport;
        const living = transport.living;

        const originSel = this.originSelBox;
        const livingSel = this.livingSelBox;

        livingSel.x = living.x - this.offsetX;
        livingSel.y = living.y - this.offsetY;

        if (transport.shiftStatus) {
            const fixed = this.fixed;
            const dx = Math.abs(living.x - fixed.x);
            const dy = Math.abs(living.y - fixed.y);

            if (dx < dy) {
                living.x = originSel.x;
            } else {
                living.y = originSel.y;
            }
        }

        const width = originSel.width;
        const height = originSel.height;

        livingSel.right = livingSel.x + width;
        livingSel.bottom = livingSel.y + height;

        let l = livingSel.x;
        let t = livingSel.y;
        let r = livingSel.right;
        let b = livingSel.bottom;

        if (this.alignPixel) {
            l = Math.round(l);
            t = Math.round(t);
            r = Math.round(r);
            b = Math.round(b);
        }

        let livingXs = [l, (l + r) / 2, r];
        let livingYs = [t, (t + b) / 2, b];

        const assist = this.context.assist;

        const assistResult = assist.alignPoints(livingXs, livingYs);
        assist.notify(Assist.CLEAR);

        if (!assistResult) return;

        let assistXWork = false;
        let assistYWork = false;

        if (assistResult.sticked_by_x) {
            livingSel.x += assistResult.dx;
            l += assistResult.dx;
            r = l + width;
            assistXWork = true;
        }

        if (assistResult.sticked_by_y) {
            livingSel.y += assistResult.dy;
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
            } else assist.highlight_guide_x = [];
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
            } else assist.highlight_guide_y = [];
        } else {
            assist.multi_line_y = [];
            assist.highlight_guide_y = [];
        }

        if (assistXWork || assistYWork) assist.notify(Assist.MULTI_LINE_ASSIST);
    }
}

/**
 * @description 选区管理
 */
class SelManager {
    readonly bases: Map<string, TranslateBaseItem>;
    private __shapes: ShapeView[];
    private __shapes_set: Set<string>;
    private transport: Translate2;
    private __coping: boolean;
    private context: Context;

    fixed: boolean;

    constructor(transport: Translate2, context: Context, shapes: ShapeView[]) {
        // 如果多选图层中包含了虚拟图层，需要把虚拟图层冒泡的其最近实体上，并将该实体替换到选区
        const __real_view = (view: ShapeView) => {
            while (view.parent) {
                view = view.parent;
                if (!view.isVirtualShape) break;
            }
            return view;
        }
        for (const view of shapes) {
            let needSortSel = false;
            const __shapes = new Set<ShapeView>();
            if (view.isVirtualShape) {
                __shapes.add(__real_view(view));
                needSortSel = true;
            } else __shapes.add(view);
            if (needSortSel) {
                shapes = Array.from(__shapes.values());
                context.selection.rangeSelectShape(shapes);
            }
        }

        // 如果选区内既有自动布局的图层，也有自由图层，或者选区内存在多个不同自动布局容器下的图层则固定住选区，被固定的选区无法拖动
        const parents = new Set<ShapeView>();
        for (const view of shapes) parents.add(view.parent!);
        this.fixed = false;
        if (parents.size > 1) {
            parents.forEach(g => {
                if ((g as ArtboradView).autoLayout) this.fixed = true;
            });
        }

        const map = new Map<string, TranslateBaseItem>();
        const cache = new Map<ShapeView, Transform>();
        for (const view of shapes) {
            const parent = view.parent!;
            let p2r = cache.get(parent);
            if (!p2r) {
                p2r = parent.transform2FromRoot;
                cache.set(parent, p2r);
            }
            const transform = view.transform2.clone();
            transform.addTransform(p2r);
            map.set(view.id, { view, transform, transformRaw: view.transform.clone() });
        }

        this.bases = map;
        this.__coping = false;
        this.context = context;
        this.__shapes = shapes;
        this.__shapes_set = new Set(shapes.map(i => i.id));
        this.transport = transport;
    }

    get coping() {
        return this.__coping;
    }

    get shapes() {
        return this.__shapes;
    }

    set shapes(shapeViews) {
        this.__shapes = [...shapeViews];
        this.__shapes_set = new Set(shapeViews.map(i => i.id));
    }

    get baseShapes() {
        const shapes: ShapeView[] = [];
        this.bases.forEach(i => shapes.push(i.view));
        return shapes;
    }

    get shapeIdsSet() {
        return this.__shapes_set;
    }

    drawn(reset = true) {
        if (this.fixed) return;

        this.__coping = true;
        let results: Shape[] | undefined;
        if (reset) {
            const transforms: TransformRaw[] = [];
            this.bases.forEach(i => transforms.push(i.transformRaw));
            results = this.transport.api!.drawn(this.shapes, transforms)!;
        } else {
            results = this.transport.api!.drawn(this.shapes)!;
        }

        const page = this.context.selection.selectedPage!;
        this.context.nextTick(page, () => {
            const selects: ShapeView[] = [];
            results.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            this.shapes = selects;
            this.context.selection.rangeSelectShape(this.shapes);
            this.__coping = false;
        });
    }

    revert() {
        if (this.fixed) return;

        const shapes = this.shapes;
        const baseShapes = this.baseShapes;
        this.transport.api!.revert(shapes, baseShapes);
        this.shapes = baseShapes;
        this.context.selection.rangeSelectShape(this.shapes);
    }
}

/**
 * @description 图层样式管理器
 */
class StyleManager {
    private transport: Translate2;
    private context: Context;

    constructor(transport: Translate2, context: Context) {
        this.transport = transport;
        this.context = context;
    }

    private __elements_with_slide: Set<Element> = new Set<Element>();

    clearSlide() {
        this.__elements_with_slide.forEach(element => element.classList.remove('transition-200'));
        this.__elements_with_slide.clear();
    }

    private __slidify_shape(shape: ShapeView) {
        const el = (shape as ShapeDom).el;
        if (!el) return;
        el.classList.add('transition-200');
        this.__elements_with_slide.add(el);
    }

}

/**
 * @description 自动布局管理器
 */
class AutoLayoutRenderer {

}

/**
 * @description 处理键盘方向键产生的移动
 */
export class TranslateByKeyboard {

}

export class Translate2 extends TransformHandler {
    readonly selManager: SelManager;
    readonly selModel: SelModel;

    mode: TranslateMode;
    living: XY;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);
        this.living = this.workspace.getRootXY(event);

        this.selManager = new SelManager(this, context, shapes);
        this.selModel = new SelModel(this, context, event);

        // 根据选区类型初始化mode，初始化过程中，只可能产生两种mode
        const views = this.selManager.shapes;
        this.mode = TranslateMode.Linear;
        for (const view of views) {
            if ((view.parent as ArtboradView).autoLayout) {
                this.mode = TranslateMode.Flex;
                break;
            }
        }
    }

    private __api: Transporter | undefined;

    get api() {
        return this.__api;
    }

    private passiveExecute() {
        this.__execute();
    }

    private __linear() {
        const model = this.selModel;
        const manager = this.selManager;

        model.fix();

        const { x, y } = model.originSelBox;
        const { x: tx, y: ty } = model.livingSelBox;
        const deltaX = tx - x;
        const deltaY = ty - y;

        const transformUnits: TranslateUnit[] = [];
        const cache = new Map<ShapeView, Transform>();
        const bases = manager.bases;
        const shapes = manager.shapes;
        for (const shape of shapes) {
            const parent = shape.parent!;
            let PI = cache.get(parent)!;
            if (!PI) {
                PI = parent.transform2FromRoot.getInverse();
                cache.set(parent, PI);
            }
            const __t = bases.get(shape.id)!.transform
                .clone()
                .translate(ColVector3D.FromXY(deltaX, deltaY));

            if (model.alignPixel) {
                const decompose = __t.clone().decomposeTranslate();
                const intX = Math.round(decompose.x);
                const intY = Math.round(decompose.y);
                const offsetX = intX - decompose.x;
                const offsetY = intY - decompose.y;
                if (offsetX || offsetY) __t.translate(ColVector3D.FromXY(offsetX, offsetY));
            }

            __t.addTransform(PI);
            const transform = makeShapeTransform1By2(__t) as TransformRaw;
            transformUnits.push({ shape, transform });
        }

        this.api!.execute(transformUnits);

        const ctx = this.context;
        ctx.nextTick(this.page, () => {
            ctx.tool.notify(Tool.RULE_RENDER_SIM);
            if (this.altStatus) ctx.selection.notify(Selection.PASSIVE_CONTOUR);
        });
    }

    private __prev() {
    }

    private __flex() {
    }

    private __execute() {
        if (this.selManager.fixed) return;

        switch (this.mode) {
            case TranslateMode.Linear:
                return this.__linear();
            case TranslateMode.Prev:
                return this.__prev();
            case TranslateMode.Flex:
                return this.__flex();
        }
    }

    protected keydown(event: KeyboardEvent) {
        if (event.repeat) return;
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
    }

    execute(event: MouseEvent) {
        this.living = this.workspace.getRootXY(event);
        this.__execute();
    }

    connect() {
        if (this.__api) throw new Error('already connected');
        this.__api = new Transporter(this.context.coopRepo, this.context.data, this.page, this.selManager.shapes);
    }

    fulfil() {
        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);
        super.fulfil();
    }
}