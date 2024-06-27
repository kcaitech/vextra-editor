import {
    adapt2Shape,
    BatchAction2,
    FrameAdjust,
    Matrix,
    PathShape,
    PathShapeView,
    PolygonShape,
    PolygonShapeView,
    RectShape,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView,
    StarShape,
    StarShapeView
} from "@kcdesign/data";
import { getHorizontalAngle } from "@/utils/common"
import { is_equal } from "./assist";

// export function is_mixed(shapes: ShapeView[]) {
//     const frame0 = shapes[0].frame2Root();
//     const frame = shapes[0].frame;
//     const result: {
//         x: number | string,
//         y: number | string,
//         w: number | string,
//         h: number | string,
//         rotate: number | string,
//         constrainerProportions: boolean | string,
//         type: boolean | string,
//     } = {
//         x: frame0.x,
//         y: frame0.y,
//         w: frame.width,
//         h: frame.height,
//         rotate: shapes[0].rotation || 0,
//         constrainerProportions: Boolean(shapes[0].constrainerProportions),
//         type: shapes[0].type === ShapeType.Line,
//     }
//     for (let i = 1; i < shapes.length; i++) {
//         const shape = shapes[i];
//         const frame_i = shape.frame2Root();
//         const frame = shape.frame;
//         const type_line = shape.type === ShapeType.Line;
//         if (frame_i.x !== result.x) result.x = 'mixed';
//         if (frame_i.y !== result.y) result.y = 'mixed';
//         if (frame.width !== result.w) result.w = 'mixed';
//         if (frame.height !== result.h) result.h = 'mixed';
//         if ((shape.rotation || 0) !== result.rotate) result.rotate = 'mixed';
//         if (shape.constrainerProportions !== result.constrainerProportions) result.constrainerProportions = 'mixed';
//         if (type_line !== result.type) result.type = 'mixed';
//         if (Object.values(result).every(v => v === 'mixed')) return result;
//     }
//     if (result.rotate !== 'mixed') result.rotate = Number((result.rotate as number).toFixed(2));
//     return result;
// }

export function is_mixed_for_radius(shapes: Shape[], cor: boolean) {
    shapes = shapes.filter(i => i instanceof RectShape);
    if (shapes.length === 1) {
        const s = shapes[0];
        // const rs = Object.values((s as RectShape).getRadius());
        const rs = s.radius;
        if (cor) {
            if (rs.every(v => v === rs[0])) return rs;
            else return 'mixed'
        } else {
            return rs;
        }
    } else if (shapes.length > 1) {
        // const res: any[] = Object.values((shapes[0] as RectShape).getRadius());
        const res: any[] = shapes[0].radius;
        for (let i = 1; i < shapes.length; i++) {
            const s = shapes[i];
            // const rs = Object.values((s as RectShape).getRadius());
            const rs = s.radius;
            if (cor) {
                if (!rs.every(v => v === rs[0])) return 'mixed';
            } else {
                for (let i = 0; i < rs.length; i++) {
                    if (rs[i] !== res[i]) res[i] = 'mixed';
                }
                return res;
            }
        }
    }
}

export function get_actions_constrainer_proportions(shapes: ShapeView[], value: boolean): BatchAction2[] {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        actions.push({ target: shape, value })
    }
    return actions;
}

export function get_actions_frame_x(shapes: ShapeView[], value: number) {
    const actions: { target: Shape, x: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];

        const parent = shape.parent;

        if (!parent) {
            continue;
        }

        let x = value;
        let dx = 0;
        const box = get_box(shape);

        if (parent.type === ShapeType.Page) {
            const m = parent.matrix2Root();
            dx = value - m.computeCoord2(box.x, 0).x;
        } else {
            dx = value - box.x;
        }

        x = shape.frame.x + dx;

        actions.push({ target: adapt2Shape(shape), x });
    }

    return actions;
}

export function get_actions_frame_y(shapes: ShapeView[], value: number) {
    const actions: { target: Shape, y: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const parent = shape.parent;

        if (!parent) {
            continue;
        }

        let y = value;
        let dy = 0;
        const box = get_box(shape);

        if (parent.type === ShapeType.Page) {
            const m = parent.matrix2Root();
            dy = value - m.computeCoord2(0, box.y).y;
        } else {
            dy = value - box.y;
        }

        y = shape.frame.y + dy;

        actions.push({ target: adapt2Shape(shape), y });
    }

    return actions;
}

export function get_actions_frame_w(shapes: Shape[], value: number, isLock: boolean) {
    const actions: FrameAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        let effect_value = 0;
        if (isLock) {
            const ratio = frame.width / frame.height;
            effect_value = (value / ratio) - frame.height;
        }
        actions.push({ target: shape, widthExtend: value - frame.width, heightExtend: effect_value });
    }
    return actions;
}

export function get_actions_frame_h(shapes: Shape[], value: number, isLock: boolean) {
    const actions: FrameAdjust[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const frame = shape.frame;
        let effect_value = 0;
        if (isLock) {
            const ratio = frame.width / frame.height;
            effect_value = (value * ratio) - frame.width;
        }
        actions.push({ target: shape, widthExtend: effect_value, heightExtend: value - frame.height });
    }
    return actions;
}

export function get_actions_rotate(shapes: ShapeView[], value: number) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        actions.push({ target: shape, value: value });
    }
    return actions;
}

export function get_actions_flip_v(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type === ShapeType.Cutout) continue;
        actions.push({ target: shape, value: 'vertical' });
    }
    return actions;
}

export function get_actions_flip_h(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type === ShapeType.Cutout) continue;
        actions.push({ target: shape, value: 'horizontal' });
    }
    return actions;
}

export function get_rotation(shape: ShapeView) {
    let rotation: number = Number((shape.rotation || 0).toFixed(2));
    if (is_straight(shape)) {
        rotation = get_rotate_for_straight(shape as PathShapeView);
    }
    return rotation;
}

export function get_straight_line_length(shape: ShapeView) {
    const points = (shape as PathShapeView).segments[0]?.points;

    const f = shape.frame, m = shape.matrix2Root();
    m.preScale(f.width, f.height);
    const p1 = points[0];
    const p2 = points[1];

    if (!p1 || !p2) {
        return 0;
    }

    const lt = m.computeCoord2(p1.x, p1.y);
    const rb = m.computeCoord2(p2.x, p2.y);
    return Math.hypot(rb.x - lt.x, rb.y - lt.y);
}

export function is_straight(shape: ShapeView) {
    if (!(shape instanceof PathShapeView) || shape.type === ShapeType.Contact) {
        return false;
    }
    if (shape.segments.length !== 1) {
        return false;
    }
    const points = shape.segments[0]?.points;

    if (!points || points.length !== 2) {
        return false;
    }
    return !points[0].hasFrom && !points[1].hasTo;
}

export function get_rotate_for_straight(shape: PathShapeView) {
    const points = shape.segments[0].points;
    const p1 = points[0];
    const p2 = points[1];
    const m = new Matrix(shape.matrix2Root());
    m.preScale(shape.frame.width, shape.frame.height);
    const lt = m.computeCoord2(p1.x, p1.y);
    const rb = m.computeCoord2(p2.x, p2.y);
    return Number(getHorizontalAngle(lt, rb).toFixed(2)) % 360;
}

export function get_indexes2(type: 'rt' | 'lt' | 'rb' | 'lb') {
    let result: number[] = [];
    switch (type) {
        case 'rt':
            result.push(1);
            break;
        case 'lt':
            result.push(0);
            break;
        case 'rb':
            result.push(2);
            break;
        case 'lb':
            result.push(3);
            break;
        default:
            break;
    }
    return result;
}

export function is_rect(shape: ShapeView) {
    return shape.isClosed
        && (shape as any)?.points?.length === 4
        && [ShapeType.Rectangle, ShapeType.Artboard, ShapeType.Image].includes(shape.type);
}

export function get_box(shape: ShapeView) {
    // const parent = shape.parent!;
    // if (!parent) {
    //     console.log('!parent');
    //     return shape.frame;
    // }
    //
    //
    // let __parent_t: ShapeView | undefined = shape.parent;
    // while (__parent_t) {
    //     if (__parent_t.isContainer) {
    //         break;
    //     }
    //     __parent_t = __parent_t.parent;
    // }
    // __parent_t = __parent_t as ShapeView;
    //
    // if (__parent_t.id === parent.id) {
    //     if (shape.isNoTransform()) {
    //         return shape.frame;
    //     }
    // }
    //
    // let m2p = new Matrix();
    // if (__parent_t.type === ShapeType.Page) {
    //     m2p = shape.matrix2Root();
    // } else {
    //     let __p = parent;
    //     m2p = shape.matrix2Parent();
    //     while (__p && __p.id !== __parent_t.id) {
    //         m2p.multiAtLeft(__p.matrix2Parent());
    //         __p = __p.parent as any;
    //     }
    // }
    //
    // const sf = shape.frame;
    // const points = [
    //     { x: 0, y: 0 },
    //     { x: sf.width, y: 0 },
    //     { x: sf.width, y: sf.height },
    //     { x: 0, y: sf.height }
    // ].map(p => m2p.computeCoord3(p));
    //
    // const minx = points.reduce((pre, cur) => Math.min(pre, cur.x), points[0].x);
    // const maxx = points.reduce((pre, cur) => Math.max(pre, cur.x), points[0].x);
    // const miny = points.reduce((pre, cur) => Math.min(pre, cur.y), points[0].y);
    // const maxy = points.reduce((pre, cur) => Math.max(pre, cur.y), points[0].y);
    //
    // return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
    const parent = shape.parent!;
    if (shape.isNoTransform()) {
        return shape.frame;
    }

    if (!parent) {
        console.log('!parent');
        return shape.frame;
    }

    const sf = shape.frame;

    const m2p = shape.matrix2Parent();

    const points = [{ x: 0, y: 0 }, { x: sf.width, y: 0 }, { x: sf.width, y: sf.height }, { x: 0, y: sf.height }]
        .map(p => m2p.computeCoord3(p));

    const minx = points.reduce((pre, cur) => Math.min(pre, cur.x), points[0].x);
    const maxx = points.reduce((pre, cur) => Math.max(pre, cur.x), points[0].x);
    const miny = points.reduce((pre, cur) => Math.min(pre, cur.y), points[0].y);
    const maxy = points.reduce((pre, cur) => Math.max(pre, cur.y), points[0].y);

    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}

export function get_xy(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];

    let fx: number | string = 0;
    let fy: number | string = 0;

    const fp = first_shape.parent;

    if (!fp) {
        return { x: fx, y: fy };
    }

    if (fp.type === ShapeType.Page) {
        const m = fp.matrix2Root();

        const fbox = get_box(first_shape);

        const xy = m.computeCoord2(fbox.x, fbox.y);
        fx = xy.x;
        fy = xy.y;
    } else {
        const xy = get_box(first_shape);
        fx = xy.x;
        fy = xy.y;
    }

    for (let i = 1, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        let x = 0;
        let y = 0;

        const parent = shape.parent;

        if (!parent) {
            continue;
        }

        if (parent.type === ShapeType.Page) {
            const m = parent.matrix2Root();

            const box = get_box(shape);

            const xy = m.computeCoord2(box.x, box.y);
            x = xy.x;
            y = xy.y;
        } else {
            const xy = get_box(shape);
            x = xy.x;
            y = xy.y;
        }

        if (typeof fx === 'number' && !is_equal(x, fx)) {
            fx = mixed;
        }
        if (typeof fy === 'number' && !is_equal(y, fy)) {
            fy = mixed;
        }

        if (fy === mixed && fx === mixed) {
            break;
        }
    }
    return { x: fx, y: fy };
}

export function get_width(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];

    let first_width: number | string = shapes[0].frame.width;

    if (is_straight(first_shape)) {
        first_width = get_straight_line_length(first_shape);
    }

    for (let i = 1, l = shapes.length; i < l; i++) {
        const shape = shapes[i];

        if (is_straight(shape)) {
            if (!is_equal(get_straight_line_length(shape), first_width)) {
                first_width = mixed;
                break;
            }

            continue;
        }
        if (shape.frame.width !== first_width) {
            first_width = mixed;
            break;
        }
    }
    return first_width;
}

export function get_height(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];

    let first_height: number | string = first_shape.frame.height;

    if (is_straight(first_shape)) {
        first_height = 0;
    }
    for (let i = 1, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        if (is_straight(shape)) {
            if (first_height !== 0) {
                first_height = mixed;
                break;
            }

            continue;
        }
        if (!is_equal(shape.frame.height, first_height)) {
            first_height = mixed;
            break;
        }
    }
    return first_height;
}

export function get_constrainer_proportions(shapes: ShapeView[]) {
    let constrainer_proportions = true;
    for (let i = 0, l = shapes.length; i < l; i++) {
        const s = shapes[i];

        if (!s.constrainerProportions) {
            constrainer_proportions = false;
            break;
        }
    }
    return constrainer_proportions;
}

export function get_shapes_rotation(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];
    let first_rotation: number | string = get_rotation(first_shape);

    for (let i = 1, l = shapes.length; i < l; i++) {
        if (!is_equal(get_rotation(shapes[i]), first_rotation)) {
            first_rotation = mixed;
            break;
        }
    }

    return first_rotation;
}

export function get_shapes_angle_counts(shapes: ShapeView[], mixed: string) {
    const polygon_shapes = shapes.filter(s => (s.type === ShapeType.Polygon || s.type === ShapeType.Star) && !s.data.haveEdit);
    if (polygon_shapes.length === 0) return 0;
    const first_shape = polygon_shapes[0] as PolygonShapeView | StarShapeView;
    let first_counts: number | string = first_shape.data.counts;

    for (let i = 1, l = polygon_shapes.length; i < l; i++) {
        const shape = polygon_shapes[i] as PolygonShapeView | StarShapeView;
        if (!is_equal(shape.data.counts, first_counts)) {
            first_counts = mixed;
            break;
        }
    }

    return first_counts || 0;
}

export function get_shapes_inner_angle(shapes: ShapeView[], mixed: string) {
    const star_shapes = shapes.filter(s => s.type === ShapeType.Star && !s.data.haveEdit);
    if (star_shapes.length === 0) return 0;
    const first_shape = star_shapes[0] as StarShapeView;
    let first_inner_angle: number | string = first_shape.data.innerAngle * 100;

    for (let i = 1, l = star_shapes.length; i < l; i++) {
        const shape = star_shapes[i] as StarShapeView;
        if (!is_equal(shape.data.innerAngle * 100, first_inner_angle)) {
            first_inner_angle = mixed;
            break;
        }
    }

    return first_inner_angle || 0;
}

export function get_actions_counts(shapes: ShapeView[], count: number) {
    const actions: { target: (PolygonShape | StarShape), count: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if ((shape.type !== ShapeType.Polygon && shape.type !== ShapeType.Star) || shape.data.haveEdit) continue;
        actions.push({ target: adapt2Shape(shape) as PolygonShape | StarShape, count: count });
    }
    return actions;
}

export function get_actions_inner_angle(shapes: ShapeView[], offset: number) {
    const actions: { target: StarShape, offset: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type !== ShapeType.Star || shape.data.haveEdit) continue;
        actions.push({ target: adapt2Shape(shape) as StarShape, offset: offset });
    }
    return actions;
}

export const showCounts = (shapes: ShapeView[]) => {
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if ((shape.type === ShapeType.Polygon || shape.type === ShapeType.Star) && !shape.data.haveEdit) {
            return true;
        }
    }
    return false;
}

export const showInnerAngle = (shapes: ShapeView[]) => {
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type === ShapeType.Star && !shape.data.haveEdit) {
            return true;
        }
    }
    return false;
}