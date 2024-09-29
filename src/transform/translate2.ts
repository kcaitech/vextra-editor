import { TransformHandler } from "@/transform/handler";
import {
    adapt2Shape,
    ArtboradView,
    AutoLayout,
    BorderPosition,
    ColVector3D,
    layoutShapesOrder,
    makeShapeTransform1By2,
    Matrix, PageView,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView,
    StackMode,
    SymbolView,
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
import { isTarget } from "@/utils/scout";
import { debounce, throttle } from "lodash";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { isShapeOut } from "@/utils/assist";

enum TranslateMode {
    Linear = 'linear',
    Prev = 'prev',
    Flex = 'flex'
}

interface TranslateBaseItem {
    transformRaw: TransformRaw,
    transform: Transform;
    view: ShapeView;
}

interface EnvLeaf {
    view: ShapeView;
    children: EnvLeaf[];
}

/**
 * @description 环境雷达
 */
class EnvRadar {
    private readonly translate: Translate2;
    private readonly context: Context;

    private __root_envs: Map<ShapeView, Matrix> = new Map();
    private __env_tree: EnvLeaf[] | undefined;
    private __target: ShapeView | undefined;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    placement: ShapeView | undefined;

    get target() {
        return this.__target!;
    }

    set target(view) {
        this.__target = view;
    }

    private __except: Set<string> | undefined;

    private __create_migrate_env() {
        const set: Set<string> = new Set();
        deep(this.translate.selManager.shapes);
        this.__except = set;

        function deep(shapes: ShapeView[]) {
            for (const view of shapes) {
                const type = view.type;
                if (type === ShapeType.SymbolRef || type === ShapeType.Table || type === ShapeType.BoolShape || type === ShapeType.SymbolUnion) continue;
                if (type === ShapeType.Artboard || type === ShapeType.Symbol) set.add(view.id);
                if (view.childs.length) deep(view.childs);
            }
        }
    }

    private __can_not_land(view: ShapeView) {
        return this.target === view;
    }

    __migrate() {
        const translate = this.translate;

        if (!this.__env_tree) return;
        if (!this.__except) this.__create_migrate_env();

        const target = this.placement!;

        if (this.__can_not_land(target)) return;

        if ((target as ArtboradView).autoLayout) return;

        const shapes = compare_layer_3(translate.selManager.shapes);
        const context = this.context;
        if (translate.api!.migrate(target, shapes, context.workspace.t('compos.dlt'))) {
            this.target = target;

            if (target instanceof PageView) {
                context.selection.unHoverShape();
            } else {
                context.selection.hoverShape(target);
            }

            context.nextTick(translate.page, () => {
                translate.mode === TranslateMode.Linear && translate.selModel.check();
            });
        }
    }

    migrate = debounce(this.__migrate, 36);

    private __return() {
    }

    count: number = 1;

    extract() {
        const translate = this.translate;
        const jumper = translate.jumper;

        const env = jumper.env!;
        const { x, y } = this.__get_matrix(env)!.computeCoord3(translate.living);

        const frame = env.frame;
        if (x >= frame.x && x <= frame.x + frame.width && y >= frame.y && y <= frame.y + frame.height) return;

        const placement = this.placement!;

        if (translate.api!.migrate(placement, compare_layer_3(translate.selManager.shapes), translate.workspace.t('compos.dlt'))) {
            this.target = placement;

            const context = this.context;
            if (placement instanceof PageView) {
                context.selection.unHoverShape();
            } else {
                context.selection.hoverShape(placement);
            }

            translate.check((placement as ArtboradView).autoLayout ? TranslateMode.Flex : TranslateMode.Linear);
        }
    }

    private __get_matrix(view: ShapeView) {
        let matrix = this.__root_envs.get(view)!;
        if (!matrix) {
            matrix = new Matrix(view.matrix2Root().inverse);
            this.__root_envs.set(view, matrix);
        }
        return matrix;
    }

    private __build() {
        const root: Map<ShapeView, Matrix> = new Map();
        this.__env_tree = collect(this.translate.page.childs);
        this.__root_envs = root;

        const set: Set<string> = new Set();
        deep(this.translate.selManager.shapes);
        this.__except = set;

        function collect(views: ShapeView[]) {
            const result: EnvLeaf[] = [];
            for (let i = views.length - 1; i > -1; i--) {
                const view = views[i];
                if (!(view instanceof ArtboradView || view instanceof SymbolView)) continue;
                result.push({ view, children: collect(view.childs) });
            }
            return result;
        }

        function deep(shapes: ShapeView[]) {
            for (const view of shapes) {
                const type = view.type;
                if (type === ShapeType.SymbolRef || type === ShapeType.Table || type === ShapeType.BoolShape || type === ShapeType.SymbolUnion) continue;
                if (type === ShapeType.Artboard || type === ShapeType.Symbol) set.add(view.id);
                if (view.childs.length) deep(view.childs);
            }
        }
    }

    private __is_target(view: ShapeView, xy: XY) {
        const matrix = this.__get_matrix(view);
        const frame = view.frame;
        const { x, y } = matrix.computeCoord3(xy);
        return x >= frame.x && x <= (frame.x + frame.width) && y >= frame.y && y <= (frame.y + frame.height);
    }

    private __out_views: Map<ShapeView, boolean> = new Map();  // 视野

    private __is_out_of_view(view: ShapeView) {
        let val = this.__out_views.get(view);
        if (val === undefined) {
            val = isShapeOut(this.context, view);
            this.__out_views.set(view, val);
        }
        return val;
    }

    sweep() {
        !this.__env_tree && this.__build();

        const isTarget = this.__is_target.bind(this);
        const isOutView = this.__is_out_of_view.bind(this);

        const except = this.__except!;
        const xy = this.translate.living;

        this.placement = __sweep(this.__env_tree!) || this.translate.page;

        if (!this.target) this.target = this.placement; // 初始化一个target

        function __sweep(leafs: EnvLeaf[]): ShapeView | undefined {
            for (const { view, children } of leafs) {
                if (except.has(view.id) || isOutView(view) || !isTarget(view, xy)) continue;

                const result = __sweep(children);
                return result ? result : view;
            }
        }
    }
}

/**
 * @description 数据模型，负责修正、提供选区图层数据
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
            const points = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, {
                x,
                y: y + height
            }].map(i => matrix.computeCoord3(i));

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

    update() {
        const transport = this.transport;

        this.livingSelBox.x = transport.living.x - this.offsetX;
        this.livingSelBox.y = transport.living.y - this.offsetY;
    }

    fix() {
        const transport = this.transport;
        const living = transport.living;

        const originSel = this.originSelBox;
        const livingSel = this.livingSelBox;

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

    private __last_env: ShapeView | undefined;

    collect() {
        const views = this.transport.selManager.shapes;

        this.__last_env = this.context.assist.set_collect_target(views);
        this.context.assist.set_trans_target(views);
    }

    check() {
        (this.transport.radar.target !== this.__last_env) && this.collect();
    }
}

/**
 * @description 调整选区
 */
class SelManager {
    readonly bases: Map<string, TranslateBaseItem>;
    private __shapes: ShapeView[];
    private __shapes_set: Set<string>;
    private translate: Translate2;
    private __coping: boolean;
    private context: Context;

    fixed: boolean;

    constructor(transport: Translate2, context: Context, shapes: ShapeView[]) {
        this.fixed = false;

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
                // shapes = Array.from(__shapes.values());
                // context.selection.rangeSelectShape(shapes);
                // 选区内存在虚拟图层，固定选区
                this.fixed = true;
                break;
            }
        }

        // 如果选区内既有自动布局的图层，也有自由图层，或者选区内存在多个不同自动布局容器下的图层则固定住选区，被固定的选区无法拖动
        const parents = new Set<ShapeView>();
        for (const view of shapes) parents.add(view.parent!);
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
        this.translate = transport;
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
            results = this.translate.api!.drawn(this.shapes, transforms)!;
        } else {
            results = this.translate.api!.drawn(this.shapes)!;
        }

        const page = this.translate.page;
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
        this.translate.api!.revert(shapes, baseShapes);
        this.shapes = baseShapes;
        this.context.selection.rangeSelectShape(this.shapes);
    }
}

/**
 * @description 图层样式管理器
 */
class StyleManager {
    static Slide = 'transition-200';
    static Alpha = 'opacity-for-preview';

    private transport: Translate2;

    constructor(transport: Translate2) {
        this.transport = transport;
    }

    private __elements_with_slide: Set<Element> = new Set();

    slidifyEnv(env: SymbolView | ArtboradView) {
        const children = env.childs;
        for (const shape of children) {
            const el = (shape as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Slide);
            this.__elements_with_slide.add(el);
        }
    }

    slidifySel() {
        const shapes = this.transport.selManager.shapes;
        for (const shape of shapes) {
            const el = (shape as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Slide);
            this.__elements_with_slide.add(el);
        }
    }

    clearSlide() {
        this.__elements_with_slide.forEach(element => element.classList.remove(StyleManager.Slide));
        this.__elements_with_slide.clear();
    }

    private __elements_with_opacity: Set<Element> = new Set();

    alphaSel() {
        const views = this.transport.selManager.shapes;
        for (const view of views) {
            const el = (view as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Alpha);
            this.__elements_with_opacity.add(el);
        }
    }

    disAlphaSel() {
        this.__elements_with_opacity.forEach(el => el.classList.remove(StyleManager.Alpha));
        this.__elements_with_opacity.clear();
    }
}

/**
 * @description 自动布局管理器
 */
class Jumper {
    private translate: Translate2;
    private context: Context;

    private __env: ArtboradView | SymbolView | undefined;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    inited: boolean = false;

    init() {
        const translate = this.translate;
        this.__env = translate.radar.placement as ArtboradView;
        translate.style.slidifyEnv(this.__env);
        this.inited = true;
    }

    destory() {
        this.__env = undefined;
        this.translate.style.clearSlide();
        this.inited = false;
    }

    private __rows: Shape[][] | undefined;
    private __flat: Shape[] | undefined;
    private __sort: Map<string, number> | undefined;

    set rows(shapes: Shape[][]) {
        this.__rows = shapes;
        const flat = shapes.flat();
        this.__flat = flat;
        const map = new Map<string, number>();
        const selected = this.translate.selManager.shapes;
        for (let i = 0; i < selected.length; i++) {
            const s = selected[i];
            const index = flat.findIndex(item => s.id === item.id);
            if (index !== -1) map.set(s.id, index);
        }
        this.__sort = map;
    }

    private __target_frame(shape: Shape) {
        let f = shape.frame;
        const m = shape.transform;
        if (shape.isNoTransform()) {
            f.x = f.x + m.translateX;
            f.y = f.y + m.translateY
        } else {
            const corners = [
                { x: f.x, y: f.y },
                { x: f.x + f.width, y: f.y },
                { x: f.x + f.width, y: f.y + f.height },
                { x: f.x, y: f.y + f.height }]
                .map((p) => m.computeCoord(p));
            const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
            const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
            const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
            const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
            f.x = minx;
            f.y = miny;
            f.width = maxx - minx;
            f.height = maxy - miny;
        }
        return f;
    }

    private __layout() {
        const env = this.__env!;
        this.rows = layoutShapesOrder(env.childs.map(s => adapt2Shape(s)), !!env.autoLayout?.bordersTakeSpace);
    }

    private __swap() {
        const translate = this.translate;
        const living = translate.living;
        const api = translate.api!;
        const shapes = translate.selManager.shapes;
        const shapeIdsSet = translate.selManager.shapeIdsSet;
        const env = this.__env!;
        const children = env.childs;
        if (!this.__rows) this.__layout();

        const flat = this.__flat!;
        const sort = this.__sort!;
        const scout = this.context.selection.scout;

        for (const view of children) {
            if (shapeIdsSet.has(view.id) || !isTarget(scout, view, living)) continue;
            const alpha = shapes[0];
            const cur_index = flat.findIndex(item => item.id === alpha.id);
            const tar_index = flat.findIndex(item => item.id === view.id);
            const targetXY = this.__target_frame(adapt2Shape(view));
            const transX = cur_index > tar_index ? targetXY.x - 1 : targetXY.x + 1;
            const transY = cur_index > tar_index ? targetXY.y - 1 : targetXY.y + 1;
            api.swap(env, shapes, transX, transY, sort);
            this.__layout();
            break;
        }
    }

    swap = throttle(this.__swap, 60);

    get env() {
        return this.__env;
    }
}

function tips4keyboard(context: Context) {
    const view = context.selection.selectedShapes[0];
    const parent = view.parent!;
    const box = parent.boundingBox();
    const matrix = parent.parent!.matrix2Root();
    matrix.multiAtLeft(context.workspace.matrix);
    const width = 320;
    const height = 240;

    const xy = matrix.computeCoord3(box);

    const container = document.createElement('div');
    container.classList.add('help-tips-windows');

    container.style.left = Math.max(20, xy.x - width - 20) + 'px';
    container.style.top = Math.max(20, xy.y) + 'px';

    const span = document.createElement('span');
    span.innerText = '除了使用鼠标拖拽之外，使用键盘中的方向键，也可以很方便的调整图层布局哦！';
    container.append(span);

    const board = document.createElement('div');
    const button = document.createElement('div');
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.border = '1px solid #595959';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#8C8C8C';

}

/**
 * @description 处理键盘方向键产生的移动
 */
export class TranslateByKeyboard {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }
}

function boundingBox(shape: Shape, includedBorder: boolean): ShapeFrame {
    let frame = { ...shape.frame };
    if (includedBorder) {
        const borders = shape.getBorders();
        let maxtopborder = 0;
        let maxleftborder = 0;
        let maxrightborder = 0;
        let maxbottomborder = 0;
        borders.forEach(b => {
            if (b.isEnabled) {
                if (b.position === BorderPosition.Outer) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom, maxbottomborder);
                } else if (b.position === BorderPosition.Center) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop / 2, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft / 2, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight / 2, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom / 2, maxbottomborder);
                }
            }
        })
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
        { x: frame.x, y: frame.y + frame.height }
    ].map((p) => m.computeCoord(p));
    const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
    const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
    const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
    const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}

interface Grid {
    view: ShapeView;
    position: -1 | 1; // -1 在前 1在后
    start: number;
    end: number;
}

interface Row {
    grids: Grid[];
    start: number;
    end: number;
}

/**
 * @description 帮助图层插入到自动布局
 */
class Inserter {
    translate: Translate2;
    context: Context;

    layoutEnv: ArtboradView | SymbolView | undefined;
    layout: AutoLayout | undefined;
    placement: Grid | undefined;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    rows: Row[] = [];

    set env(container: ArtboradView | SymbolView | undefined) {
        if (!container) {
            this.layoutEnv = undefined;
            this.layout = undefined;
            this.rows.length = 0;
            this.context.selection.notify(Selection.PRE_INSERT, '');
        } else {
            this.layoutEnv = container;
            this.layout = container.autoLayout;
            this.__draw();
        }
    }

    private __draw() {
        const env = this.layoutEnv!;
        const layout = this.layout!;

        const views = env.childs;
        const viewsMap = new Map<string, ShapeView>(views.map(i => ([i.id, i])));
        const __rows = layoutShapesOrder(views.map(s => adapt2Shape(s)), !!layout.bordersTakeSpace);
        const rows: Row[] = [];
        let lastRowEnd = 0;
        const mode = layout.stackMode || StackMode.Horizontal;
        for (let r = 0; r < __rows.length; r++) {
            const row = __rows[r];

            let height = 0;
            let lastEnd: number = 0;

            const grids: Grid[] = [];

            for (let i = 0; i < row.length; i++) {
                const shape = row[i];
                const box = boundingBox(shape, !!layout!.bordersTakeSpace);
                if (box.height > height) height = box.height;
                let __start = lastEnd;
                let __end;
                if (mode === StackMode.Horizontal) {
                    __end = box.x + (box.width / 2)
                } else {
                    __end = box.y + (box.height / 2)
                }
                lastEnd = __end;
                const grid: Grid = {
                    start: __start,
                    end: __end,
                    view: viewsMap.get(shape.id)!,
                    position: -1
                };
                grids.push(grid);
            }

            const last = grids[grids.length - 1];
            grids.push({
                start: last.end,
                end: Infinity,
                view: last.view,
                position: 1
            });

            let start = lastRowEnd;
            let end = lastRowEnd + height + (layout!.stackCounterSpacing) / 2;
            if (!lastRowEnd) end += layout!.stackVerticalPadding;
            lastRowEnd = end;

            rows.push({ grids, start, end });
        }
        rows[rows.length - 1].end = Infinity;
        this.rows = rows;
    }

    private __render(grid: Grid) {
        this.placement = grid;

        const layout = this.layout!;
        const { view, position } = grid;
        const isHor = (layout.stackMode || StackMode.Horizontal) === StackMode.Horizontal;
        const gap = (isHor ? layout.stackSpacing : layout.stackCounterSpacing) / 2;
        const frame = view.frame;
        let len = isHor ? frame.height : frame.width;
        const cx = (frame.x + frame.width) / 2;
        const cy = (frame.y + frame.height) / 2;
        let start;
        if (position > 0) {
            if (isHor) start = { x: frame.x + frame.width + gap, y: cy - len / 2 };
            else start = { x: cx - len / 2, y: frame.y + frame.height + gap };
        } else {
            if (isHor) start = { x: frame.x - gap, y: cy - len / 2 };
            else start = { x: cx - len / 2, y: frame.y - gap };
        }
        let end = isHor ? { x: start.x, y: start.y + len } : { x: start.x + len, y: start.y };
        const matrix = view.matrix2Root();
        matrix.multiAtLeft(this.context.workspace.matrix);
        start = matrix.computeCoord3(start);
        end = matrix.computeCoord3(end);
        const path = `M ${start.x} ${start.y} L${end.x} ${end.y}`;
        this.context.selection.notify(Selection.PRE_INSERT, path);
    }

    pre() {
        const env = this.layoutEnv!;
        const living = this.translate.living;
        const matrix = new Matrix(env.matrix2Root().inverse);
        const { x, y } = matrix.computeCoord3(living);
        const mode = this.layout!.stackMode || StackMode.Horizontal;

        const rows = this.rows;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (y > row.end) continue;

            let there = false;
            const grids = row.grids;
            for (let j = 0; j < grids.length; j++) {
                const grid = grids[j];
                const v = mode === StackMode.Horizontal ? x : y;
                if (v > grid.end) continue;
                this.__render(grid);
                there = true;
                break;
            }
            if (there) break;
        }
    }

    insert() {
        const translate = this.translate;
        const style = translate.style;

        style.disAlphaSel()
        style.slidifySel();

        const env = this.layoutEnv!;
        style.slidifyEnv(env);

        const context = this.context;
        context.selection.notify(Selection.PRE_INSERT);

        const placement = this.placement!;
        const shapes = translate.selManager.shapes;
        translate.api!.insert(env, placement.view, placement.position, shapes);
        let timer: any = setTimeout(() => {
            style.clearSlide();
            clearTimeout(timer);
            timer = undefined;
        }, 240);
    }
}

export class Translate2 extends TransformHandler {
    readonly selManager: SelManager;
    readonly selModel: SelModel;
    readonly style: StyleManager;
    readonly inserter: Inserter;
    readonly radar: EnvRadar;
    readonly jumper: Jumper;

    living: XY;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);
        this.living = this.workspace.getRootXY(event);

        this.selManager = new SelManager(this, context, shapes);
        this.selModel = new SelModel(this, context, event);
        this.style = new StyleManager(this);
        this.inserter = new Inserter(this, context);
        this.radar = new EnvRadar(this, context);
        this.jumper = new Jumper(this, context);

        // 根据选区类型初始化mode，初始化过程中，只可能产生两种mode
        const views = this.selManager.shapes;

        this.__mode = TranslateMode.Linear;
        for (const view of views) {
            if ((view.parent as ArtboradView).autoLayout) {
                this.__mode = TranslateMode.Flex;
                break;
            }
        }

        if (this.__mode === TranslateMode.Linear) this.selModel.collect();
    }

    private __api: Transporter | undefined;

    get api() {
        return this.__api;
    }

    private passiveExecute() {
        this.__execute();
    }

    private __trans(align = true) {
        const model = this.selModel;
        const manager = this.selManager;

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

            if (model.alignPixel && align) {
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

    private __linear() {
        this.selModel.update();
        this.selModel.fix();
        this.__trans();
        this.radar.migrate();
    }

    private __prev() {
        this.selModel.update();
        this.inserter.pre();
        this.__trans(false);
        this.radar.migrate();
    }

    private __flex() {
        const xy = this.workspace.matrix.computeCoord3(this.living);
        this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE_MOVE, xy);
        if (!this.jumper.inited) this.jumper.init();
        this.jumper.swap();
        this.radar.extract();
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

    private __mode: TranslateMode;
    private __last_mode: TranslateMode | undefined;

    get mode() {
        return this.__mode;
    }

    set mode(mode) {
        this.__last_mode = this.__mode;
        this.__mode = mode;

        if (this.__last_mode === TranslateMode.Prev) {
            this.inserter.env = undefined;
            this.style.disAlphaSel();
            this.context.selection.unHoverShape();
        }
        if (this.__mode === TranslateMode.Prev) {
            const radar = this.radar;
            this.style.alphaSel();
            this.context.selection.hoverShape(this.inserter.env = radar.placement as ArtboradView);
        }

        if (this.__last_mode === TranslateMode.Linear) {
            this.context.assist.notify(Assist.CLEAR);
        }
        if (this.__mode === TranslateMode.Linear) {
        }

        if (this.__last_mode === TranslateMode.Flex) {
            this.style.clearSlide();
            this.jumper.inited = false;
        }
        if (this.__mode === TranslateMode.Flex) {
            this.style.slidifyEnv(this.jumper.env!);
            this.style.slidifySel();
        }
    }

    check(mode?: TranslateMode) {
        this.radar.sweep();

        if (mode) return this.mode = mode;

        const current = this.mode;
        const radar = this.radar;

        if ((radar.placement as ArtboradView).autoLayout && current === TranslateMode.Linear) {
            this.mode = TranslateMode.Prev;
        }
        if (!(radar.placement as ArtboradView).autoLayout && current === TranslateMode.Prev) {
            this.mode = TranslateMode.Linear;
        }
    }

    execute(event: MouseEvent) {
        this.living = this.workspace.getRootXY(event);

        this.check();

        this.__execute();
    }

    connect() {
        if (this.__api) throw new Error('already connected');
        this.__api = new Transporter(this.context.coopRepo, this.context.data, this.page, this.selManager.shapes);
    }

    fulfil() {
        if (this.mode === TranslateMode.Prev) this.inserter.insert();
        if (this.mode === TranslateMode.Flex) this.style.clearSlide();

        this.api?.commit();

        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }
}