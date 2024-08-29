import {
    adapt2Shape, ArtboradView,
    BatchAction2, ContextSettings, export_text, MarkerType,
    Matrix,
    PathShapeView,
    PolygonShape,
    PolygonShapeView,
    Shape,
    ShapeType,
    ShapeView,
    StarShape,
    StarShapeView, SymbolRefView, SymbolView, Text, TextShapeView
} from "@kcdesign/data";
import { getHorizontalAngle } from "@/utils/common"
import { is_equal } from "./assist";

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
        const parent = shape.parent!;
        let x = value;
        let dx = 0;
        const box = get_box(shape);
        if ((parent as ArtboradView).autoLayout) continue;
        if (parent.type === ShapeType.Page) {
            const m = parent.matrix2Root();
            dx = value - m.computeCoord2(box.x, 0).x;
        } else {
            dx = value - box.x;
        }

        x = shape.transform.translateX + dx;

        actions.push({ target: adapt2Shape(shape), x });
    }

    return actions;
}

export function get_actions_frame_y(shapes: ShapeView[], value: number) {
    const actions: { target: Shape, y: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const parent = shape.parent!;
        let y = value;
        let dy = 0;
        const box = get_box(shape);
        if ((parent as ArtboradView).autoLayout) continue;
        if (parent.type === ShapeType.Page) {
            const m = parent.matrix2Root();
            dy = value - m.computeCoord2(0, box.y).y;
        } else {
            dy = value - box.y;
        }

        y = shape.transform.translateY + dy;

        actions.push({ target: adapt2Shape(shape), y });
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

export function get_box(shape: ShapeView) {
    return shape._p_frame
}

export function get_xy(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];

    let fx: number | string = 0;
    let fy: number | string = 0;

    const fp = first_shape.parent;

    if (!fp) return { x: fx, y: fy };

    if (fp.type === ShapeType.Page) {
        const m = fp.matrix2Root();

        const fbox = get_box(first_shape);

        const xy = m.computeCoord3(fbox);
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
        if (!parent) continue;

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

        if (typeof fx === 'number' && !is_equal(x, fx)) fx = mixed;
        if (typeof fy === 'number' && !is_equal(y, fy)) fy = mixed;

        if (fy === mixed && fx === mixed) break;
    }
    return { x: fx, y: fy };
}

export function get_width(shapes: ShapeView[], mixed: string) {
    const first_shape = shapes[0];

    let first_width: number | string = shapes[0].frame.width;

    if (is_straight(first_shape)) first_width = get_straight_line_length(first_shape);

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

    if (is_straight(first_shape)) first_height = 0;
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

export function getRadiusForCopy(shapes: ShapeView[]) {
    let first: [number, number, number, number] | undefined;

    for (const shape of shapes) {
        const corner = __get(shape);
        if (corner) {
            first = corner;
            break;
        }
    }

    if (!first) return;

    for (const shape of shapes) {
        const corner = __get(shape);
        if (!corner) continue;
        if (!__compare(corner, first)) return;
    }

    return first;

    function __get(shape: ShapeView): [number, number, number, number] | undefined {
        if (shape instanceof ArtboradView || shape instanceof SymbolView || shape instanceof SymbolRefView) {
            const corner = shape.cornerRadius;
            if (!corner) return;
            return [corner.lt, corner.rt, corner.rb, corner.lb];
        } else if (shape instanceof PathShapeView) {
            const points = shape.segments[0].points;
            if (!points) return
            let rs: [number, number, number, number] = [0, 0, 0, 0];
            for (let i = 0; i < 4; i++) {
                const p = points[i];
                if (!p) break;
                rs[i] = p.radius ?? 0;
            }
            return rs;
        } else {
            const fixed = shape.fixedRadius;
            if (!fixed) return;
            return [fixed, fixed, fixed, fixed];
        }
    }

    function __compare(a: [number, number, number, number], b: [number, number, number, number]) {
        for (let i = 0; i < 4; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}

export function getContextSetting(shapes: ShapeView[]) {
    let first: ContextSettings | undefined;

    for (const shape of shapes) {
        const cs = shape.style.contextSettings;
        if (cs) {
            first = new ContextSettings(cs.blenMode, cs.opacity);
            break;
        }
    }

    if (!first) return;

    for (const shape of shapes) {
        const cs = shape.style.contextSettings;
        if (!cs) continue;
        if (cs.blenMode !== first.blenMode || cs.opacity !== first.opacity) return;
    }

    return first;
}

export function getMarkType(shapes: ShapeView[]) {
    let first: { start: MarkerType | undefined, end: MarkerType | undefined } | undefined;

    for (const shape of shapes) {
        const startMark = shape.startMarkerType;
        const endMark = shape.endMarkerType;

        if (!startMark && !endMark) continue;
        first = { start: startMark, end: endMark };
        break;
    }

    if (!first) return;

    for (const shape of shapes) {
        const startMark = shape.startMarkerType;
        const endMark = shape.endMarkerType;

        if (!startMark && !endMark) continue;

        if (startMark !== first.start || endMark !== first.end) return;
    }

    return first;
}

export function getText(shapes: ShapeView[]) {
    let first: Text | undefined;
    for (const shape of shapes) {
        if (shape instanceof TextShapeView) {
            first = export_text(shape.text) as Text;
            break;
        }
    }
    return first;
}