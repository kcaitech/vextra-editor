import { Page, PageView, Shape, ShapeType, ShapeView, adapt2Shape } from "@kcdesign/data";
import { PositonAdjust } from "@kcdesign/data";
// 群的最左端
export function get_colony_left(shapes: ShapeView[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let xs: [number, number][] = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]];
        xs = xs.map(p => {
            const _s = m.computeCoord2(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    }
    return Math.min(..._xs);
}
// 群的水平中心
export function get_colony_center_x(shapes: ShapeView[]) {
    // todo
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let xs: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        xs = xs.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    }
    return (Math.min(..._xs) + Math.max(..._xs)) / 2;
}
// 群的最右端
export function get_colony_right(shapes: ShapeView[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let xs: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        xs = xs.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    }
    return Math.max(..._xs);
}
// 群的最顶端
export function get_colony_top(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let ys: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        ys = ys.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    }
    return Math.min(..._ys);
}
// 群的垂直中心
export function get_colony_center_y(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let ys: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        ys = ys.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    }
    return (Math.min(..._ys) + Math.max(..._ys)) / 2;
}
// 群的最低端
export function get_colony_bottom(shapes: ShapeView[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let ys: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        ys = ys.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    }
    return Math.max(..._ys);
}
// 群的宽度
export function get_colony_width(shapes: Shape[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let xs: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        xs = xs.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    }
    return Math.max(..._xs) - Math.min(..._xs);
}
// 群的左右
export function get_colony_l_r(shapes: Shape[]) {
    const _xs: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let xs: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        xs = xs.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    }
    return { right: Math.max(..._xs), left: Math.min(..._xs) };
}
// 群的高度
export function get_colony_height(shapes: Shape[]) {
    const _ys: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        const m = shape.matrix2Root();
        let ys: [number, number][] = [
            [0, 0],
            [frame.width, 0],
            [frame.width, frame.height],
            [0, frame.height]
        ];
        ys = ys.map(p => {
            const _s = m.computeCoord(p[0], p[1]);
            return [_s.x, _s.y];
        });
        _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    }
    return Math.max(..._ys) - Math.min(..._ys);
}
// 个体的最左端
export function get_individuality_left(shape: ShapeView) {
    const _xs: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let xs: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    xs = xs.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    return Math.min(..._xs);
}
// 个体的水平中心
export function get_individuality_center_x(shape: ShapeView) {
    const _xs: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let xs: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    xs = xs.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    return (Math.min(..._xs) + Math.max(..._xs)) / 2;
}
// 个体的最右端
export function get_individuality_right(shape: ShapeView) {
    const _xs: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let xs: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    xs = xs.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    return Math.max(..._xs);
}
// 个体的最顶端
export function get_individuality_top(shape: ShapeView) {
    const _ys: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let ys: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    ys = ys.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    return Math.min(..._ys);
}
// 个体的垂直中心
export function get_individuality_center_y(shape: ShapeView) {
    const _ys: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let ys: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    ys = ys.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    return (Math.min(..._ys) + Math.max(..._ys)) / 2;
}
// 个体的最底端
export function get_individuality_bottom(shape: ShapeView) {
    const _ys: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let ys: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    ys = ys.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    return Math.max(..._ys);
}
// 获取个体左右
export function get_individuality_l_r(shape: ShapeView) {
    const _xs: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let xs: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    xs = xs.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _xs.push(xs[0][0], xs[1][0], xs[2][0], xs[3][0]);
    return { left: Math.min(..._xs), right: Math.max(..._xs) };
}
// 获取个体上下
export function get_individuality_t_b(shape: ShapeView) {
    const _ys: number[] = [];
    const frame = shape.frame;
    const m = shape.matrix2Root();
    let ys: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ];
    ys = ys.map(p => {
        const _s = m.computeCoord(p[0], p[1]);
        return [_s.x, _s.y];
    });
    _ys.push(ys[0][1], ys[1][1], ys[2][1], ys[3][1]);
    return { top: Math.min(..._ys), bottom: Math.max(..._ys) };
}

export function is_container(shape: ShapeView) {
    return [ShapeType.Artboard, ShapeType.Group, ShapeType.SymbolUnion, ShapeType.Symbol].includes(shape.type) && shape.parent instanceof PageView;
}

// 靠左对齐
export function align_left(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_left([first, first_p]);
        } else {
            c_apex = get_colony_left(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_left([first_p]);
    }
    else {
        c_apex = get_colony_left(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_left(shape);
        actions.push({ target: adapt2Shape(shape), transX: c_apex - s_apex, transY: 0 });
    }
    return actions;
}
// 水平线对齐
export function align_cneter_x(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_center_x([first, first_p]);
        } else {
            c_apex = get_colony_center_x(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_center_x([first_p]);
    }
    else {
        c_apex = get_colony_center_x(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_center_x(shape);
        actions.push({ target: adapt2Shape(shape), transX: c_apex - s_apex, transY: 0 });
    }
    return actions;
}
// 靠右对齐
export function align_right(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_right([first, first_p]);
        } else {
            c_apex = get_colony_right(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_right([first_p]);
    }
    else {
        c_apex = get_colony_right(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_right(shape);
        actions.push({ target: adapt2Shape(shape), transX: c_apex - s_apex, transY: 0 });
    }
    return actions;
}
// 靠顶部对齐
export function align_top(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_top([first, first_p]);
        } else {
            c_apex = get_colony_top(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_top([first_p]);
    }
    else {
        c_apex = get_colony_top(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_top(shape);
        actions.push({ target: adapt2Shape(shape), transX: 0, transY: c_apex - s_apex });
    }
    return actions;
}
// 中线对齐
export function align_cneter_y(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_center_y([first, first_p]);
        } else {
            c_apex = get_colony_center_y(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_center_y([first_p]);
    }
    else {
        c_apex = get_colony_center_y(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_center_y(shape);
        actions.push({ target: adapt2Shape(shape), transX: 0, transY: c_apex - s_apex });
    }
    return actions;
}
export function align_bottom(shapes: ShapeView[]) {
    let c_apex = 0;
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];
    const first_p = first.parent;

    if (!first_p) {
        return [];
    }
    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
        if (shapes.length === 1) {
            c_apex = get_colony_bottom([first, first_p]);
        } else {
            c_apex = get_colony_bottom(shapes);
        }
    }
    else if (shapes.length === 1 && first_p.type !== ShapeType.Page) {
        c_apex = get_colony_bottom([first_p]);
    }
    else {
        c_apex = get_colony_bottom(shapes);
    }

    const actions: PositonAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const s_apex = get_individuality_bottom(shape);
        actions.push({ target: adapt2Shape(shape), transX: 0, transY: c_apex - s_apex });
    }
    return actions;
}

// 水平均匀分布
export function distribute_horizontally(shapes: ShapeView[]) {
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];

    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
    }

    const new_shapes: { left: number, right: number, width: number, shape: Shape }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const { left, right } = get_individuality_l_r(shape);
        new_shapes.push({ shape: adapt2Shape(shape), left, right, width: right - left });
    }
    new_shapes.sort((a, b) => {
        if (a.left > b.left) {
            return 1;
        } else if (a.left < b.left) {
            return -1;
        } else {
            return 0;
        }
    });
    let right_max = new_shapes[0];
    for (let i = 1; i < new_shapes.length; i++) {
        if (new_shapes[i].right > right_max.right) {
            right_max = new_shapes[i];
        }
    }
    if (right_max !== new_shapes[0]) {
        const inner_length = new_shapes[new_shapes.length - 1].left - new_shapes[0].right;
        let inner_space = inner_length;
        for (let i = 1; i < new_shapes.length - 1; i++) {
            inner_space -= new_shapes[i].width;
        }
        const gap = inner_space / (new_shapes.length - 1);
        const actions: PositonAdjust[] = [];
        for (let i = 1; i < new_shapes.length - 1; i++) {
            const s_left = new_shapes[i].left;
            actions.push({
                target: new_shapes[i].shape,
                transX: new_shapes[i - 1].right + gap - s_left,
                transY: 0
            })
            new_shapes[i].right = new_shapes[i - 1].right + new_shapes[i].width + gap;
        }
        return actions;
    }
}
// 垂直均匀分布
export function vertical_uniform_distribution(shapes: ShapeView[]) {
    if (!shapes.length) {
        return [];
    }

    const first = shapes[0];

    if (shapes.length === 1 && is_container(first)) {
        shapes = first.childs || [];
    }

    const new_shapes: { top: number, bottom: number, height: number, shape: Shape }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const { top, bottom } = get_individuality_t_b(shape);
        new_shapes.push({ shape: adapt2Shape(shape), top, bottom, height: bottom - top });
    }
    new_shapes.sort((a, b) => {
        if (a.top > b.top) {
            return 1;
        } else if (a.top < b.top) {
            return -1;
        } else {
            return 0;
        }
    });
    let right_max = new_shapes[0];
    for (let i = 1; i < new_shapes.length; i++) {
        if (new_shapes[i].bottom > right_max.bottom) {
            right_max = new_shapes[i];
        }
    }
    if (right_max !== new_shapes[0]) {
        const inner_length = new_shapes[new_shapes.length - 1].top - new_shapes[0].bottom;
        let inner_space = inner_length;
        for (let i = 1; i < new_shapes.length - 1; i++) {
            inner_space -= new_shapes[i].height;
        }
        const gap = inner_space / (new_shapes.length - 1);
        const actions: PositonAdjust[] = [];
        for (let i = 1; i < new_shapes.length - 1; i++) {
            const s_top = new_shapes[i].top;
            actions.push({
                target: new_shapes[i].shape,
                transX: 0,
                transY: new_shapes[i - 1].bottom + gap - s_top,
            })
            new_shapes[i].bottom = new_shapes[i - 1].bottom + new_shapes[i].height + gap;
        }
        return actions;
    }
}