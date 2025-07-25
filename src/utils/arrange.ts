/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */
import {
    ArtboardView,
    PageView,
    Shape,
    ShapeType,
    ShapeView,
    adapt2Shape,
    PathShapeView,
    Transform,
    SymbolView
} from "@kcaitech/vextra-core";
import { is_straight } from "@/utils/attri_setting";

function getFrameAnchor(view: ShapeView) {
    const m = view.matrix2Root();
    const frame = view.frame;
    if (is_straight(view)) {
        const width = frame.width;
        const height = frame.height;
        const __m = new Transform();
        __m.preScale(width, height);
        __m.multiAtLeft(m);
        const lt = __m.map((view as PathShapeView).segments[0].points[0]);
        const rb = __m.map((view as PathShapeView).segments[0].points[1]);
        return [[lt.x, lt.y], [rb.x, rb.y]];
    } else {
        return [
            [frame.x, frame.y],
            [frame.x + frame.width, frame.y],
            [frame.x + frame.width, frame.y + frame.height],
            [frame.x, frame.y + frame.height]
        ].map(point => {
            const p = m.computeCoord2(point[0], point[1]);
            return [p.x, p.y];
        });
    }
}
// 群的最左端
export function get_colony_left(shapes: ShapeView[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _xs.push(p[0]));
    }
    return Math.min(..._xs);
}
// 群的水平中心
export function get_colony_center_x(shapes: ShapeView[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _xs.push(p[0]));
    }
    let center = (Math.min(..._xs) + Math.max(..._xs));
    if (Math.round(center) % 2) center--;
    return center / 2;
}
// 群的最右端
export function get_colony_right(shapes: ShapeView[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _xs.push(p[0]));
    }
    return Math.max(..._xs);
}
// 群的最顶端
export function get_colony_top(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _ys.push(p[1]));
    }
    return Math.min(..._ys);
}
// 群的垂直中心
export function get_colony_center_y(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _ys.push(p[1]));
    }
    let center = (Math.min(..._ys) + Math.max(..._ys));
    if (Math.round(center) % 2) center--;
    return center / 2;
}
// 群的最低端
export function get_colony_bottom(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const points = getFrameAnchor(shapes[i]);
        points.forEach(p => _ys.push(p[1]));
    }
    return Math.max(..._ys);
}
// 个体的最左端
export function get_individuality_left(shape: ShapeView) {
    const _xs: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _xs.push(p[0]));
    return Math.min(..._xs);
}
// 个体的水平中心
export function get_individuality_center_x(shape: ShapeView) {
    const _xs: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _xs.push(p[0]));
    return (Math.min(..._xs) + Math.max(..._xs)) / 2;
}
// 个体的最右端
export function get_individuality_right(shape: ShapeView) {
    const _xs: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _xs.push(p[0]));
    return Math.max(..._xs);
}
// 个体的最顶端
export function get_individuality_top(shape: ShapeView) {
    const _ys: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _ys.push(p[1]));
    return Math.min(..._ys);
}
// 个体的垂直中心
export function get_individuality_center_y(shape: ShapeView) {
    const _ys: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _ys.push(p[1]));
    return (Math.min(..._ys) + Math.max(..._ys)) / 2;
}
// 个体的最底端
export function get_individuality_bottom(shape: ShapeView) {
    const _ys: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _ys.push(p[1]));
    return Math.max(..._ys);
}
// 获取个体左右
export function get_individuality_l_r(shape: ShapeView) {
    const _xs: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _xs.push(p[0]));
    return { left: Math.min(..._xs), right: Math.max(..._xs) };
}
// 获取个体上下
export function get_individuality_t_b(shape: ShapeView) {
    const _ys: number[] = [];
    const points = getFrameAnchor(shape);
    points.forEach(p => _ys.push(p[1]));
    return { top: Math.min(..._ys), bottom: Math.max(..._ys) };
}

export function is_container(shape: ShapeView) {
    return [ShapeType.Artboard, ShapeType.Group, ShapeType.SymbolUnion, ShapeType.Symbol].includes(shape.type) && shape.parent instanceof PageView;
}

// 靠左对齐
export function align_left(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) return [];

    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_left(shapes);
        } else {
            c_apex = get_colony_left([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_left([first_p]);
    } else {
        c_apex = get_colony_left(shapes);
    }

    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if (view.parent?.autoLayout) continue;
        const s_apex = get_individuality_left(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(c_apex - s_apex, 0)
            .multiAtLeft(intoParent);

        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }

    return actions;
}
// 水平线对齐
export function align_center_x(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) return [];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_center_x(shapes);
        } else {
            c_apex = get_colony_center_x([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_center_x([first_p]);
    } else {
        c_apex = get_colony_center_x(shapes);
    }

    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if (view.parent?.autoLayout) continue;
        const s_apex = get_individuality_center_x(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(c_apex - s_apex, 0)
            .multiAtLeft(intoParent);

        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }
    return actions;
}
// 靠右对齐
export function align_right(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) return [];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_right(shapes);
        } else {
            c_apex = get_colony_right([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_right([first_p]);
    } else {
        c_apex = get_colony_right(shapes);
    }

    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if ((view as ArtboardView).autoLayout) continue;
        const s_apex = get_individuality_right(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(c_apex - s_apex, 0)
            .multiAtLeft(intoParent);

        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }
    return actions;
}
// 靠顶部对齐
export function align_top(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];
    const first = shapes[0];
    const first_p = first.parent;
    if (!first_p) return [];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_top(shapes);
        } else {
            c_apex = get_colony_top([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_top([first_p]);
    } else {
        c_apex = get_colony_top(shapes);
    }
    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if (view.parent?.autoLayout) continue;
        const s_apex = get_individuality_top(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(0, c_apex - s_apex)
            .multiAtLeft(intoParent);
        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }
    return actions;
}
// 中线对齐
export function align_center_y(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) return [];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_center_y(shapes);
        } else {
            c_apex = get_colony_center_y([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_center_y([first_p]);
    } else {
        c_apex = get_colony_center_y(shapes);
    }

    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if (view.parent?.autoLayout) continue;
        const s_apex = get_individuality_center_y(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(0, c_apex - s_apex)
            .multiAtLeft(intoParent);

        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }
    return actions;
}
// 靠底部对齐
export function align_bottom(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) return [];

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) return [];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (first.childs.length > 1) {
            c_apex = get_colony_bottom(shapes);
        } else {
            c_apex = get_colony_bottom([first]);
        }
    } else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_bottom([first_p]);
    } else {
        c_apex = get_colony_bottom(shapes);
    }

    const actions: { target: Shape, transX: number, transY: number }[] = [];
    for (const view of shapes) {
        if (view.parent?.autoLayout) continue;
        const s_apex = get_individuality_bottom(view);
        const intoParent = view.parent!.matrix2Root().inverse;
        const target = view
            .matrix2Root()
            .trans(0, c_apex - s_apex)
            .multiAtLeft(intoParent);

        actions.push({
            target: adapt2Shape(view),
            transX: target.translateX - view.transform.translateX,
            transY: target.translateY - view.transform.translateY
        });
    }
    return actions;
}
// 水平均匀分布
export function distribute_horizontally(shapes: ShapeView[]) {
    if (!shapes.length) return [];
    const first = shapes[0];
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
    }
    const pre: { left: number, right: number, width: number, shape: ShapeView }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.parent?.autoLayout) continue;
        const { left, right } = get_individuality_l_r(shape);
        pre.push({ shape, left, right, width: right - left });
    }
    pre.sort((a, b) => a.left - b.left);
    let right_max = pre[0];
    for (let i = 1; i < pre.length; i++) {
        if (pre[i].right > right_max.right) {
            right_max = pre[i];
        }
    }
    if (right_max !== pre[0]) {
        let inner_space = pre[pre.length - 1].left - pre[0].right;
        for (let i = 1; i < pre.length - 1; i++) {
            inner_space -= pre[i].width;
        }
        const gap = inner_space / (pre.length - 1);
        const actions: { target: Shape, transX: number, transY: number }[] = [];
        for (let i = 1; i < pre.length - 1; i++) {
            const s_left = pre[i].left;
            const view = pre[i].shape;
            const intoParent = view.parent!.matrix2Root().inverse;
            const target = view
                .matrix2Root()
                .trans(pre[i - 1].right + gap - s_left, 0)
                .multiAtLeft(intoParent);
            actions.push({
                target: adapt2Shape(view),
                transX: target.translateX - view.transform.translateX,
                transY: target.translateY - view.transform.translateY
            })
            pre[i].right = pre[i - 1].right + pre[i].width + gap;
        }
        return actions;
    }
}
// 垂直均匀分布
export function vertical_uniform_distribution(shapes: ShapeView[]) {
    if (!shapes.length) return [];

    const first = shapes[0];

    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
    }

    const pre: { top: number, bottom: number, height: number, shape: ShapeView }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.parent?.autoLayout) continue;
        const { top, bottom } = get_individuality_t_b(shape);
        pre.push({ shape, top, bottom, height: bottom - top });
    }
    pre.sort((a, b) => a.top - b.top);
    let right_max = pre[0];
    for (let i = 1; i < pre.length; i++) {
        if (pre[i].bottom > right_max.bottom) {
            right_max = pre[i];
        }
    }
    if (right_max !== pre[0]) {
        let inner_space = pre[pre.length - 1].top - pre[0].bottom;
        for (let i = 1; i < pre.length - 1; i++) {
            inner_space -= pre[i].height;
        }
        const gap = inner_space / (pre.length - 1);
        const actions: { target: Shape, transX: number, transY: number }[] = [];
        for (let i = 1; i < pre.length - 1; i++) {
            const s_top = pre[i].top;
            const view = pre[i].shape;
            const intoParent = view.parent!.matrix2Root().inverse;
            const target = view
                .matrix2Root()
                .trans(0, pre[i - 1].bottom + gap - s_top)
                .multiAtLeft(intoParent);
            actions.push({
                target: adapt2Shape(view),
                transX: target.translateX - view.transform.translateX,
                transY: target.translateY - view.transform.translateY
            })
            pre[i].bottom = pre[i - 1].bottom + pre[i].height + gap;
        }
        return actions;
    }
}

function getGroups(shapes: ShapeView[]) {
    const map: Map<ShapeView, ShapeView[]> = new Map();
    for (const shape of shapes) {
        const parent = shape.parent;
        if (parent instanceof ArtboardView || parent instanceof SymbolView) {
            if (parent.autoLayout) continue;
            const group = map.get(parent) ?? [];
            map.set(parent, group);
            group.push(shape);
        }
    }
    return map;
}

export function align_left_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_left(parent);
        const match = get_colony_left(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(offset, 0);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}

export function align_center_x_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_center_x(parent);
        const match = get_colony_center_x(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(offset, 0);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}

export function align_right_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_right(parent);
        const match = get_colony_right(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(offset, 0);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}

export function align_top_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_top(parent);
        const match = get_colony_top(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(0, offset);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}

export function align_center_y_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_center_y(parent);
        const match = get_colony_center_y(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(0, offset);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}

export function align_bottom_relative(shapes: ShapeView[]) {
    const map = getGroups(shapes);
    if (!map.size) return [];
    const offsets: { target: Shape, transX: number, transY: number }[] = [];
    map.forEach((group, parent) => {
        const target = get_individuality_bottom(parent);
        const match = get_colony_bottom(group);
        const offset = target - match;
        const intoParent = parent.matrix2Root().inverse;
        for (const view of group) {
            const targetTrans = view.matrix2Root();
            targetTrans.trans(0, offset);
            targetTrans.multiAtLeft(intoParent);
            offsets.push({
                target: adapt2Shape(view),
                transX: targetTrans.translateX - view.transform.translateX,
                transY: targetTrans.translateY - view.transform.translateY
            });
        }
    });
    return offsets;
}