/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { BoundHandler } from "@/transform/handler";
import {
    ArtboardView, AutoLayout, BorderPosition, ColVector3D, Matrix, MigrateItem, PageView, ShapeFrame,
    ShapeType, ShapeView, StackMode, SymbolView, Transform, TranslateUnit, Transporter,
    PathShapeView, layoutShapesOrder2, getShapeFrame
} from "@kcaitech/vextra-core";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import { Tool } from "@/context/tool";
import { Assist } from "@/context/assist";
import { isTarget } from "@/utils/scout";
import { debounce, throttle } from "lodash";
import { compare_layer_3, sort_by_layer } from "@/utils/group_ungroup";
import { isShapeOut } from "@/utils/assist";
import { StyleManager } from "@/transform/style";
import { WorkSpace } from "@/context/workspace";
import { Navi } from "@/context/navigate";
import { is_straight } from "@/utils/attri_setting";
enum TranslateMode {
    Linear = 'linear',
    Prev = 'prev',
    Flex = 'flex'
}
interface TranslateBaseItem {
    transformRaw: Transform,
    transform: Transform;
    view: ShapeView;
}
interface EnvLeaf {
    view: ShapeView;
    children: EnvLeaf[];
}

/**
 * @description 环境检查
 */
class EnvRadar {
    private readonly translate: Translate2;
    private readonly context: Context;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    original: Map<ShapeView, { parent: ShapeView, index: number }> | undefined;

    private __init_original() {
        if (this.original) return;
        const __original: Map<ShapeView, { parent: ShapeView, index: number }> = new Map();

        const translate = this.translate;

        const views = translate.selManager.shapes;

        const __view = (v: ShapeView) => {
            const reflect = translate.api?.reflect;
            return reflect ? translate.page.getView(reflect.get(v.id)!.id)! : v;
        }

        for (const v of views) {
            const view = __view(v);
            const parent = view.parent!;
            const index = (() => {
                for (let i = 0; i < parent.childs.length; i++) if (parent.childs[i].id === view.id) return i;
                return -1;
            })();
            __original.set(view, { parent, index });
        }
        this.original = __original;
    }

    fixed: boolean = false; // 固定图层环境

    master: ShapeView | undefined;      // 初始图层环境
    target: ShapeView | undefined;      // 当前图层环境
    placement: ShapeView | undefined;   // 当前目标图层环境

    private __except: Set<string> | undefined;
    private __root_envs: Map<ShapeView, Matrix> = new Map();
    private __env_tree: EnvLeaf[] | undefined;

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
        return !!view.autoLayout || this.target === view;
    }

    private __get_matrix(view: ShapeView) {
        let matrix = this.__root_envs.get(view)!;
        if (!matrix) {
            matrix = view.matrix2Root().inverse.toMatrix();
            this.__root_envs.set(view, matrix);
        }
        return matrix;
    }

    private __build() {
        const root: Map<ShapeView, Matrix> = new Map();
        this.__env_tree = collect(this.translate.page.childs);
        this.__root_envs = root;

        function collect(views: ShapeView[]) {
            const result: EnvLeaf[] = [];
            for (let i = views.length - 1; i > -1; i--) {
                const view = views[i];
                if (!(view instanceof ArtboardView || view instanceof SymbolView)) continue;
                result.push({ view, children: collect(view.childs) });
            }
            return result;
        }

        const set: Set<string> = new Set();
        deep(this.translate.selManager.shapes);
        this.__except = set;

        function deep(shapes: ShapeView[]) {
            for (const view of shapes) {
                const type = view.type;
                if (type === ShapeType.SymbolRef || type === ShapeType.BoolShape || type === ShapeType.SymbolUnion) continue;
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

    private __out_views: Map<ShapeView, boolean> = new Map();

    private __is_out_of_view(view: ShapeView) {
        let val = this.__out_views.get(view);
        if (val === undefined) {
            val = isShapeOut(this.context, view);
            this.__out_views.set(view, val);
        }
        return val;
    }

    /**
     * sweep只会检查鼠标当前位置所在的有效容器[placement]，不会修改图层环境
     */
    sweep() {
        if (this.fixed) return;

        !this.__env_tree && this.__build();

        const isTarget = this.__is_target.bind(this);
        const isOutView = this.__is_out_of_view.bind(this);

        const except = this.__except!;
        const xy = this.translate.living;

        this.placement = __sweep(this.__env_tree!) || this.translate.page;

        if (!this.target) this.target = this.placement; // 初始化一个target
        if (!this.master) this.master = this.placement; // 初始化一个master

        function __sweep(leafs: EnvLeaf[]): ShapeView | undefined {
            for (const { view, children } of leafs) {
                if (except.has(view.id) || isOutView(view) || !isTarget(view, xy)) continue;

                const result = __sweep(children);
                return result ? result : view;
            }
        }
    }

    migrateImme() {
        if (!this.__env_tree) return;
        if (!this.__except) this.__create_migrate_env();

        const translate = this.translate;

        const target = this.placement!;

        if (this.__can_not_land(target)) return;

        this.__init_original();

        const sortedViews = compare_layer_3(translate.selManager.shapes, -1);
        const migrateItems: MigrateItem[] = [];
        if (this.master === target && !this.translate.altStatus) { // 回到初始状态
            const original = this.original!;
            for (const view of sortedViews) {
                const env = original.get(view)!;
                migrateItems.push({ view, toParent: env.parent, index: env.index });
            }
        } else {
            const __is_locked = translate.isLocked.bind(translate);
            for (const view of sortedViews) {
                if (__is_locked(view)) continue;
                migrateItems.push({ view, toParent: target });
            }
        }

        const context = this.context;
        if (translate.api!.migrate(migrateItems, context.workspace.t('compos.dlt'))) {
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

    migrate = debounce(this.migrateImme, 36); // debounce避免划过时的不必要迁移

    extract() {
        const translate = this.translate;
        const jumper = translate.jumper;

        const env = jumper.env!;
        const { x, y } = this.__get_matrix(env)!.computeCoord3(translate.living);

        const frame = env.frame;
        if (x >= frame.x && x <= frame.x + frame.width && y >= frame.y && y <= frame.y + frame.height) return;

        const target = this.placement! as (ArtboardView | PageView);

        this.__init_original();

        const sortedViews = compare_layer_3(translate.selManager.shapes, -1);
        const migrateItems: MigrateItem[] = [];
        for (const view of sortedViews) migrateItems.push({ view, toParent: target });

        if (translate.api!.migrate(migrateItems, translate.workspace.t('compos.dlt'))) {
            this.target = target;
            const context = this.context;
            if (target instanceof PageView) {
                context.selection.unHoverShape();
                translate.checkout(TranslateMode.Linear);
            } else {
                if (target.autoLayout) {
                    translate.checkout(TranslateMode.Prev);
                    this.suspend();
                } else {
                    translate.checkout(TranslateMode.Linear);
                }
                context.selection.hoverShape(target);
            }
        }
    }

    suspending: boolean = false;

    /**
     * 将所有选区图层悬浮到文档最上层
     */
    suspend() {
        if (!this.__env_tree || this.suspending) return;
        if (!this.__except) this.__create_migrate_env();
        const translate = this.translate;
        const target = translate.page;
        this.__init_original();
        const sortedViews = compare_layer_3(translate.selManager.shapes, -1);
        const migrateItems: MigrateItem[] = [];
        for (const view of sortedViews) migrateItems.push({ view, toParent: target, allowSameEnv: true });
        const context = this.context;
        if (translate.api!.migrate(migrateItems, context.workspace.t('compos.dlt'))) {
            this.target = target;
            this.suspending = true;
        }
    }

    /**
     * 切换当前处于活跃状态的容器[图层环境]
     */
    checkout() {
        switch (this.translate.mode) {
            case TranslateMode.Linear:
                return this.migrate();
            case TranslateMode.Flex:
                return this.extract();
        }
    }
}

/**
 * @description 维护、提供选区状态
 */
class SelModel {
    private readonly translate: Translate2;
    private readonly context: Context;
    readonly fixed: XY;

    private readonly offsetX: number;
    private readonly offsetY: number;

    originSelBox;
    livingSelBox;
    alignPixel: boolean;

    readonly original: Map<string, TranslateBaseItem>;

    constructor(transport: Translate2, context: Context) {
        this.translate = transport;
        this.context = context;
        this.fixed = { ...transport.living };
        this.alignPixel = context.user.isPixelAlignMent;

        const { box, original } = this.__box(transport.selManager.shapes);
        this.original = original;
        this.originSelBox = box;
        this.livingSelBox = { ...box };

        this.offsetX = transport.living.x - box.x;
        this.offsetY = transport.living.y - box.y;
    }

    private __box(views: ShapeView[]) {
        const cache = new Map<ShapeView, Transform>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        const original: Map<string, TranslateBaseItem> = new Map();

        for (const view of views) {
            const parent = view.parent!;

            let p2r = cache.get(parent)!;
            if (!p2r) {
                p2r = parent.matrix2Root();
                cache.set(parent, p2r);
            }

            const transform = view.transform.clone();
            transform.addTransform(p2r);

            original.set(view.id, {
                transformRaw: view.transform.clone(),
                transform: transform.clone(),
                view
            });

            const { x, y, width, height } = view.frame;

            let points: XY[];
            if (is_straight(view)) {
                const unitTransform = new Transform().scale(width, height).addTransform(transform);
                const lt = (view as PathShapeView).segments[0].points[0];
                const rb = (view as PathShapeView).segments[0].points[1];
                points = unitTransform.transform([
                    ColVector3D.FromXY(lt.x, lt.y),
                    ColVector3D.FromXY(rb.x, rb.y)
                ])
            } else {
                points = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ].map(p => transform.map(p));
            }

            for (const point of points) {
                if (point.x < left) left = point.x;
                if (point.x > right) right = point.x;
                if (point.y < top) top = point.y;
                if (point.y > bottom) bottom = point.y;
            }
        }

        if (this.alignPixel) {
            left = Math.round(left);
            right = Math.round(right);
            top = Math.round(top);
            bottom = Math.round(bottom);
        }

        return {
            original,
            box: {
                x: left,
                y: top,
                right,
                bottom,
                width: right - left,
                height: bottom - top,
            }
        }
    }

    update() {
        const transport = this.translate;

        this.livingSelBox.x = transport.living.x - this.offsetX;
        this.livingSelBox.y = transport.living.y - this.offsetY;
    }

    fix() {
        const translate = this.translate;
        const living = translate.living;
        const originSel = this.originSelBox;
        const livingSel = this.livingSelBox;

        let fixedX = false;
        let fixedY = false;

        if (translate.shiftStatus) {
            const fixed = this.fixed;
            const dx = Math.abs(living.x - fixed.x);
            const dy = Math.abs(living.y - fixed.y);

            if (dx < dy) {
                livingSel.x = originSel.x;
                fixedX = true;
            } else {
                livingSel.y = originSel.y;
                fixedY = true;
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

        if (this.alignPixel) {
            livingXs[1] = Math.round(livingXs[1]);
            livingYs[1] = Math.round(livingYs[1]);
        }

        const assist = this.context.assist;

        const assistResult = assist.alignPoints(livingXs, livingYs);
        assist.notify(Assist.CLEAR);

        if (!assistResult) return;

        let assistXWork = false;
        let assistYWork = false;

        if (assistResult.sticked_by_x && !fixedX) {
            livingSel.x += assistResult.dx;
            l += assistResult.dx;
            r = l + width;
            assistXWork = true;
        }

        if (assistResult.sticked_by_y && !fixedY) {
            livingSel.y += assistResult.dy;
            t += assistResult.dy;
            b = t + height;
            assistYWork = true;
        }

        let cx = (l + r) / 2;
        let cy = (t + b) / 2;

        if (this.alignPixel) {
            cx = Math.round(cx);
            cy = Math.round(cy);
        }

        const fixedTarget = assist.fixedTarget;

        if (assistXWork) {
            assist.multi_line_x = [
                { x: l, pre: [{ x: l, y: t }, { x: l, y: b }] },
                { x: r, pre: [{ x: r, y: t }, { x: r, y: b }] },
                { x: cx, pre: [{ x: cx, y: cy }] }
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
                { y: t, pre: [{ x: l, y: t }, { x: r, y: t }] },
                { y: b, pre: [{ x: l, y: b }, { x: r, y: b }] },
                { y: cy, pre: [{ x: cx, y: cy }] }
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
        const views = this.translate.selManager.shapes;
        this.__last_env = this.context.assist.set_collect_target(views);
        this.context.assist.set_trans_target(views);
    }

    check() {
        (this.translate.radar.target !== this.__last_env) && this.collect();
    }

    getBaseTransform(view: ShapeView) {
        const reflect = this.translate.api!.reflect;
        const pointer = reflect ? reflect.get(view.id)!.id : view.id;
        return this.original.get(pointer)!.transform;
    }
}

/**
 * @description 维护、提供选区对象
 */
class SelManager {
    private readonly context: Context;
    private readonly translate: Translate2;

    private __shapes: ShapeView[];
    private __shapes_set: Set<string>;

    private readonly master: ShapeView[];

    fixed: boolean;

    constructor(translate: Translate2, context: Context, shapes: ShapeView[]) {
        this.fixed = false;

        // 选区内若存在虚拟图层，固定选区，被固定的选区无法拖动
        for (const view of shapes) {
            if (view.isVirtualShape) {
                this.fixed = true;
                break;
            }
        }

        // 如果选区内既有自动布局的图层，也有自由图层，或者选区内存在多个不同自动布局容器下的图层则固定住选区
        const parents = new Set<ShapeView>();
        for (const view of shapes) parents.add(view.parent!);
        if (parents.size > 1) {
            parents.forEach(g => {
                if ((g as ArtboardView).autoLayout) this.fixed = true;
            });
        }

        this.context = context;
        this.translate = translate;
        this.__shapes = shapes;
        this.__shapes_set = new Set(shapes.map(i => i.id));
        this.master = [...shapes];
    }

    get shapes() {
        return this.__shapes;
    }

    set shapes(shapeViews) {
        this.__shapes = [...shapeViews];
        this.__shapes_set = new Set(shapeViews.map(i => i.id));
    }

    get shapeIdsSet() {
        return this.__shapes_set;
    }

    drawn() {
        const translate = this.translate;

        if (this.fixed || !translate.api) return;
        this.fixed = true;


        const transformOriginal = translate.selModel.original;
        const envOriginal = translate.radar.original;

        const results = translate.api.drawn(compare_layer_3(this.shapes, -1), transformOriginal, envOriginal)!;

        this.context.nextTick(translate.page, () => {
            const selects: ShapeView[] = [];
            results.forEach((s) => {
                const v = translate.page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            this.shapes = selects;
            const selection = this.context.selection;
            selection.rangeSelectShape(this.shapes);
            selection.setLabelLivingGroup(this.shapes);
            selection.setLabelFixedGroup(this.master);
            selection.setShowInterval(true);
            selection.notify(Selection.PASSIVE_CONTOUR);
            this.fixed = false;
            translate.selModel.collect();
        });
    }

    revert() {
        if (this.fixed || !this.translate.api) return;
        this.fixed = true;

        const results = this.translate.api.revert(compare_layer_3(this.shapes, -1))!;

        const page = this.translate.page;
        this.context.nextTick(page, () => {
            const selects: ShapeView[] = [];
            results.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            this.shapes = selects;
            const selection = this.context.selection;
            selection.rangeSelectShape(this.shapes);
            selection.setLabelLivingGroup([]);
            selection.setLabelFixedGroup([]);
            selection.setShowInterval(false);
            this.fixed = false;
            this.translate.selModel.collect();
        });
    }
}

/**
 * @description 图层样式管理器
 */

/**
 * @description 自动布局管理器
 */
class Jumper {
    private readonly translate: Translate2;
    private context: Context;

    private __env: ArtboardView | SymbolView | undefined;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    inited: boolean = false;

    init() {
        const translate = this.translate;
        this.__env = translate.radar.placement as ArtboardView;
        translate.style.slidifyEnv(this.__env);
        this.inited = true;
    }

    destroy() {
        this.__env = undefined;
        this.translate.style.clearSlide();
        this.inited = false;
    }

    private __rows: ShapeView[] | undefined;

    set rows(shapes: ShapeView[]) {
        this.__rows = shapes;
    }

    private __layout() {
        const env = this.__env!;
        this.rows = env.childs;
    }

    private __last_target: ShapeView | undefined;

    private __swap() {
        const translate = this.translate;
        const living = translate.living;
        const api = translate.api!;
        const shapes = translate.selManager.shapes;
        const shapeIdsSet = translate.selManager.shapeIdsSet;
        const env = this.__env!;
        const children = env.childs;
        if (!this.__rows) this.__layout();

        const flat = this.__rows!;
        const scout = this.context.selection.scout;

        for (const view of children) {
            if (shapeIdsSet.has(view.id) || !isTarget(scout, view, living)) continue;
            if (view !== this.__last_target) {
                const tar_index = flat.findIndex(item => item.id === view.id);
                api.swap(env, sort_by_layer(this.context, shapes, -1), tar_index);
                this.__layout();
                this.__last_target = view;
            }
            return;
        }
        this.__last_target = undefined;
    }

    swap = throttle(this.__swap, 160);

    get env() {
        return this.__env;
    }
}

function boundingBox(shape: ShapeView, includedBorder?: boolean): ShapeFrame {
    let frame = { ...getShapeFrame(shape) };
    frame.height = Math.max(frame.height, 1);
    frame.width = Math.max(frame.width, 1);
    if (includedBorder) {
        const border = shape.getBorder();
        let maxtopborder = 0;
        let maxleftborder = 0;
        let maxrightborder = 0;
        let maxbottomborder = 0;
        if (border) {
            const isEnabled = border.strokePaints.some(p => p.isEnabled);
            if (isEnabled) {
                const outer = border.position === BorderPosition.Outer;
                maxtopborder = outer ? border.sideSetting.thicknessTop : border.sideSetting.thicknessTop / 2;
                maxleftborder = outer ? border.sideSetting.thicknessLeft : border.sideSetting.thicknessLeft / 2;
                maxrightborder = outer ? border.sideSetting.thicknessRight : border.sideSetting.thicknessRight / 2;
                maxbottomborder = outer ? border.sideSetting.thicknessBottom : border.sideSetting.thicknessBottom / 2;
            }

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

interface Grid {
    view: ShapeView | undefined;
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

    layoutEnv: ArtboardView | SymbolView | undefined;
    layout: AutoLayout | undefined;
    placement: Grid | undefined;

    constructor(translate: Translate2, context: Context) {
        this.translate = translate;
        this.context = context;
    }

    rows: Row[] = [];

    set env(container: ArtboardView | SymbolView | undefined) {
        if (!container) {
            this.layoutEnv = undefined;
            this.layout = undefined;
            this.rows.length = 0;
            this.context.selection.notify(Selection.PRE_INSERT, '');
        } else if (container.id !== this.layoutEnv?.id) {
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
        const __rows = layoutShapesOrder2(views, !!layout.bordersTakeSpace);
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
        if (rows.length) rows[rows.length - 1].end = Infinity;
        this.rows = rows;
    }

    private __render(grid: Grid) {
        this.placement = grid;
        const layout = this.layout!;
        const isHor = (layout.stackMode || StackMode.Horizontal) === StackMode.Horizontal;
        const gap = (isHor ? layout.stackSpacing : layout.stackCounterSpacing) / 2;
        let start;
        let end;
        if (grid.view === undefined) {
            const x = layout.stackHorizontalPadding;
            const y = layout.stackVerticalPadding;
            const matrix = this.layoutEnv!.matrix2Root();
            matrix.multiAtLeft(this.context.workspace.matrix);
            start = matrix.computeCoord3({ x, y });
            end = matrix.computeCoord3(isHor ? { x, y: y + 100 } : { x: x + 100, y });
        } else {
            const { view, position } = grid;
            const frame = view.frame;
            let len = isHor ? frame.height : frame.width;
            const cx = (frame.x + frame.width) / 2;
            const cy = (frame.y + frame.height) / 2;
            if (position > 0) {
                if (isHor) start = { x: frame.x + frame.width + gap, y: cy - len / 2 };
                else start = { x: cx - len / 2, y: frame.y + frame.height + gap };
            } else {
                if (isHor) start = { x: frame.x - gap, y: cy - len / 2 };
                else start = { x: cx - len / 2, y: frame.y - gap };
            }
            end = isHor ? { x: start.x, y: start.y + len } : { x: start.x + len, y: start.y }
            const matrix = view.matrix2Root();
            matrix.multiAtLeft(this.context.workspace.matrix);
            start = matrix.computeCoord3(start);
            end = matrix.computeCoord3(end);
        }
        const path = `M ${start!.x} ${start!.y} L${end!.x} ${end!.y}`;
        this.context.selection.notify(Selection.PRE_INSERT, path);
    }

    pre() {
        const env = this.layoutEnv!;
        const living = this.translate.living;
        const matrix = (env.matrix2Root().inverse);
        const { x, y } = matrix.computeCoord3(living);
        const mode = this.layout!.stackMode || StackMode.Horizontal;

        const rows = this.rows;
        if (!rows.length) {
            return this.__render({ view: undefined, end: 0, start: 0, position: 1 });
        }
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
        const shapes = translate.selManager.shapes;

        style.disAlphaSel()
        style.slidifySel(shapes);

        const env = this.layoutEnv!;
        style.slidifyEnv(env);

        const context = this.context;
        context.selection.notify(Selection.PRE_INSERT);
        context.selection.unHoverShape();

        const placement = this.placement!;
        translate.api!.insert(env, placement.view, placement.position, shapes);
        context.nextTick(context.selection.selectedPage!, () => {
            context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        })
        let timer: any = setTimeout(() => {
            style.clearSlide();
            clearTimeout(timer);
            timer = undefined;
        }, 240);
    }
}

export class Translate2 extends BoundHandler {
    readonly selManager: SelManager;
    readonly selModel: SelModel;
    readonly style: StyleManager;
    readonly inserter: Inserter;
    readonly radar: EnvRadar;
    readonly jumper: Jumper;

    living: XY; // root坐标系下的鼠标位置
    client: XY;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);
        this.living = this.workspace.getRootXY(event);
        this.client = event;

        this.selManager = new SelManager(this, context, shapes);
        this.selModel = new SelModel(this, context);
        this.style = new StyleManager(context);
        this.inserter = new Inserter(this, context);
        this.radar = new EnvRadar(this, context);
        this.jumper = new Jumper(this, context);

        // 根据选区类型初始化mode，初始化过程中，只可能产生两种mode
        const views = this.selManager.shapes;

        this.__mode = TranslateMode.Linear;
        for (const view of views) {
            if ((view.parent as ArtboardView).autoLayout) {
                this.__mode = TranslateMode.Flex;
                break;
            }
        }

        if (this.__mode === TranslateMode.Linear) this.selModel.collect();

        context.workspace.linearEditorExist = true;
    }

    private __api: Transporter | undefined;

    get api() {
        return this.__api;
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
        const shapes = manager.shapes;
        const __is_locked = this.isLocked.bind(this);
        for (const shape of shapes) {
            if (__is_locked(shape)) continue;

            const parent = shape.parent!;
            let PI = cache.get(parent)!;
            if (!PI) {
                PI = (parent.matrix2Root().getInverse());
                cache.set(parent, PI);
            }
            const __t = model.getBaseTransform(shape)
                .clone()
                .translate(deltaX, deltaY);

            if (model.alignPixel && align) {
                const decompose = __t.clone().decomposeTranslate();
                const intX = Math.round(decompose.x);
                const intY = Math.round(decompose.y);
                const offsetX = intX - decompose.x;
                const offsetY = intY - decompose.y;
                if (offsetX || offsetY) __t.translate(offsetX, offsetY);
            }

            __t.addTransform(PI);
            const transform = (__t);
            transformUnits.push({ shape, transform });
        }

        this.api!.execute(transformUnits);

        const ctx = this.context;
        ctx.nextTick(this.page, () => {
            ctx.tool.notify(Tool.RULE_RENDER_SIM);
            this.altStatus && ctx.selection.notify(Selection.PASSIVE_CONTOUR);
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
        this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE_MOVE, this.client);
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
        if (event.shiftKey && !this.shiftStatus) {
            this.shiftStatus = true;
            this.__execute();
        }
        if (event.altKey && !this.altStatus) {
            this.altStatus = true;
            this.selManager.drawn();
        }
        if (event.code === "Space" && !this.radar.fixed) {
            this.radar.fixed = true;
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'ShiftLeft') {
            this.shiftStatus = false;
            this.__execute();
            return;
        }
        if (event.code === "AltLeft") {
            this.altStatus = false;
            this.selManager.revert();
        }
        if (event.code === "Space") {
            this.radar.fixed = false;
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
            this.style.alphaSel(this.selManager.shapes);
            this.context.selection.hoverShape(this.inserter.env = radar.placement as ArtboardView);
        }

        if (this.__last_mode === TranslateMode.Linear) {
            this.context.assist.notify(Assist.CLEAR);
        }
        if (this.__mode === TranslateMode.Linear) {
        }

        if (this.__last_mode === TranslateMode.Flex) {
            this.style.clearSlide();
            this.jumper.inited = false;
            this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE);
        }
        if (this.__mode === TranslateMode.Flex) {
            this.style.slidifyEnv(this.jumper.env!);
            this.style.slidifySel(this.selManager.shapes);
            this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE, this.client);
        }
    }

    checkout(mode?: TranslateMode) {
        // 切换到指定模式
        if (mode) {
            this.mode = mode;
            return;
        }

        const radar = this.radar;
        radar.sweep();

        // 根据环境在Linear、Prev之间自动切换
        const current = this.mode;
        if ((radar.placement as ArtboardView).autoLayout) {
            if (current === TranslateMode.Linear) {
                if (radar.placement !== radar.target) {
                    this.mode = TranslateMode.Prev;
                    radar.suspend();
                }
            } else if (current === TranslateMode.Prev) { // 更新[预插入env]
                this.inserter.env = radar.placement as ArtboardView;
            }
        } else {
            if (current === TranslateMode.Prev) {
                this.mode = TranslateMode.Linear;
                radar.suspending = false;
            }
        }
    }

    execute(event: MouseEvent) {
        this.living = this.workspace.getRootXY(event);
        this.client = event;
        this.checkout(); // 鼠标移动后，先判断当前选区的移动模式，根据移动模式修改图层数据
        this.__execute();
    }

    connect() {
        if (this.__api) throw new Error('already connected');
        this.__api = new Transporter(this.context.repo, this.context.data, this.page, this.selManager.shapes);
        if (this.altStatus) this.selManager.drawn();
        this.workspace.translating(true);
        if (this.mode === TranslateMode.Flex) this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE, this.client);
    }

    fulfil() {
        this.workspace.translating(false);
        this.workspace.setSelectionViewUpdater(true);
        this.workspace.linearEditorExist = false;

        if (this.mode === TranslateMode.Prev) this.inserter.insert();
        else if (this.mode === TranslateMode.Flex) {
            this.style.clearSlide();
            this.context.selection.notify(Selection.LAYOUT_DOTTED_LINE);
        } else if (this.mode === TranslateMode.Linear) this.radar.migrateImme();

        this.api?.commit();

        const selection = this.context.selection;
        selection.setLabelLivingGroup([]);
        selection.setLabelFixedGroup([]);
        if (!this.altStatus) selection.setShowInterval(false);

        if (this.altStatus) this.context.nextTick(this.page, () => {
            this.context.navi.notify(Navi.SHAPELIST_UPDATE);
        })

        super.fulfil();
    }
}