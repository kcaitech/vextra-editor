import { getHorizontalAngle } from "@/utils/common"
import {
    ContactLineView,
    CtrlElementType, CurvePoint,
    Matrix,
    PathShapeView,
    PathType,
    ShapeFrame,
    ShapeView
} from "@kcdesign/data"
import { XY } from "@/context/selection";
import { Context } from "@/context";

interface Dot {
    point: { x: number, y: number }
    extra: { x: number, y: number }
    r: { p: string, transform: string }
    type: CtrlElementType
    type2: CtrlElementType
}

export function getRotationFromTransform(shape: ShapeView) {
    return shape.transform2FromRoot.decomposeEuler().z * 180 / Math.PI;
}

export function getTransformForPart() {

}

export function update_dot(ps: { x: number, y: number, type?: CtrlElementType }[], shape: ShapeView): Dot[] {
    const bit_v = 4;
    const bit_v_d = 7;
    const [lt, rt, rb, lb] = ps;
    const t = get_transform(shape);
    console.log('__T__ROTATION__', t.rotate);

    // lt
    const r1 = get_r_path(lt);
    let transform1 = `translate(${lt.x}px, ${lt.y}px)`;
    transform1 += ` translate(-${lt.x}px, -${lt.y}px)`;
    const path_obj_1 = {
        point: { x: lt.x - bit_v, y: lt.y - bit_v },
        extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d },
        r: { p: r1, transform: transform1 },
        type: CtrlElementType.RectLT,
        type2: CtrlElementType.RectLTR
    };

    //rt
    const r2 = get_r_path(rt);
    let transform2 = `translate(${rt.x}px, ${rt.y}px)`;
    transform2 += ` translate(-${rt.x}px, -${rt.y}px)`;
    const path_obj_2 = {
        point: { x: rt.x - bit_v, y: rt.y - bit_v },
        extra: { x: rt.x - bit_v_d, y: rt.y - bit_v_d },
        r: { p: r2, transform: transform2 },
        type: CtrlElementType.RectRT,
        type2: CtrlElementType.RectRTR
    };

    //rb
    const r3 = get_r_path(rb);
    let transform3 = `translate(${rb.x}px, ${rb.y}px)`;

    transform3 += ` translate(-${rb.x}px, -${rb.y}px)`;
    const path_obj_3 = {
        point: { x: rb.x - bit_v, y: rb.y - bit_v },
        extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d },
        r: { p: r3, transform: transform3 },
        type: CtrlElementType.RectRB,
        type2: CtrlElementType.RectRBR
    };
    //lb
    const r4 = get_r_path(lb);
    let transform4 = `translate(${lb.x}px, ${lb.y}px)`;
    transform4 += ` translate(-${lb.x}px, -${lb.y}px)`;
    const path_obj_4 = {
        point: { x: lb.x - bit_v, y: lb.y - bit_v },
        extra: { x: lb.x - bit_v_d, y: lb.y - bit_v_d },
        r: { p: r4, transform: transform4 },
        type: CtrlElementType.RectLB,
        type2: CtrlElementType.RectLBR
    };

    return [path_obj_1, path_obj_2, path_obj_3, path_obj_4];
}

export function update_dot2(ps: { x: number, y: number, type?: CtrlElementType }[]): Dot[] {
    const bit_v = 4;
    const bit_v_d = 7;
    const [lt, rt, rb, lb] = ps;

    // lt
    const r1 = get_r_path(lt);
    let transform1 = `translate(${lt.x}px, ${lt.y}px)`;
    transform1 += `rotate(-180deg) translate(-${lt.x}px, -${lt.y}px)`;
    const path_obj_1 = {
        point: { x: lt.x - bit_v, y: lt.y - bit_v },
        extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d },
        r: { p: r1, transform: transform1 },
        type: CtrlElementType.RectLT,
        type2: CtrlElementType.RectLTR
    };

    //rt
    const r2 = get_r_path(rt);
    let transform2 = `translate(${rt.x}px, ${rt.y}px)`;
    transform2 += `rotate(-90deg) translate(-${rt.x}px, -${rt.y}px)`;
    const path_obj_2 = {
        point: { x: rt.x - bit_v, y: rt.y - bit_v },
        extra: { x: rt.x - bit_v_d, y: rt.y - bit_v_d },
        r: { p: r2, transform: transform2 },
        type: CtrlElementType.RectRT,
        type2: CtrlElementType.RectRTR
    };

    //rb
    const r3 = get_r_path(rb);
    let transform3 = `translate(${rb.x}px, ${rb.y}px)`;
    transform3 += `rotate(0deg) translate(-${rb.x}px, -${rb.y}px)`;
    const path_obj_3 = {
        point: { x: rb.x - bit_v, y: rb.y - bit_v },
        extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d },
        r: { p: r3, transform: transform3 },
        type: CtrlElementType.RectRB,
        type2: CtrlElementType.RectRBR
    };
    //lb
    const r4 = get_r_path(lb);
    let transform4 = `translate(${lb.x}px, ${lb.y}px)`;
    transform4 += `rotate(90deg) translate(-${lb.x}px, -${lb.y}px)`;
    const path_obj_4 = {
        point: { x: lb.x - bit_v, y: lb.y - bit_v },
        extra: { x: lb.x - bit_v_d, y: lb.y - bit_v_d },
        r: { p: r4, transform: transform4 },
        type: CtrlElementType.RectLB,
        type2: CtrlElementType.RectLBR
    };

    return [path_obj_1, path_obj_2, path_obj_3, path_obj_4];
}

export function update_dot3(ps: { x: number, y: number, type?: CtrlElementType }[]): Dot[] {
    const bit_v = 4;
    const bit_v_d = 7;
    const [lt, rb] = ps;
    const rotation = getHorizontalAngle(lt, rb);
    const r1 = get_r_path2(lt);
    let transform1 = `translate(${lt.x}px, ${lt.y}px)`;
    transform1 += `rotate(${rotation - 180}deg) translate(-${lt.x}px, -${lt.y}px)`;
    const path_obj_1 = {
        point: { x: lt.x - bit_v, y: lt.y - bit_v },
        extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d },
        r: { p: r1, transform: transform1 },
        type: CtrlElementType.LineStart,
        type2: CtrlElementType.LineStartR
    };
    const r3 = get_r_path2(rb);
    let transform3 = `translate(${rb.x}px, ${rb.y}px)`;
    transform3 += `rotate(${rotation}deg) translate(-${rb.x}px, -${rb.y}px)`;
    const path_obj_3 = {
        point: { x: rb.x - bit_v, y: rb.y - bit_v },
        extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d },
        r: { p: r3, transform: transform3 },
        type: CtrlElementType.LineEnd,
        type2: CtrlElementType.LineEndR
    };
    return [path_obj_1, path_obj_3];
}

function get_r_path(ps: { x: number, y: number }) {
    return `M${ps.x} ${ps.y} h18 a18 18 0 0 1 -18 18 z`;
}

function get_r_path2(ps: { x: number, y: number }) {
    const bit_v_r = 18, r = Math.PI * 0.25, sx = bit_v_r * Math.cos(r), sy = bit_v_r * Math.sin(r);
    return `M${ps.x} ${ps.y} l${sx} ${-sy} a${bit_v_r},${bit_v_r} 0 0 1 0,${2 * sy} z`;
}

export function get_path_by_point(s: ShapeView, matrix: Matrix, map: Map<number, number[]>) {
    const points: { segment: number, index: number, point: XY, selected: boolean }[] = [];

    if (s.pathType === PathType.Editable) {
        const segments = (s as PathShapeView).segments;
        segments.forEach((segment, index) => {
            __exe(index, segment.points as CurvePoint[]);
        })
    }

    return points;

    function __exe(segment: number, _points: CurvePoint[]) {
        if (!_points?.length) {
            return [];
        }

        const set = new Set(map.get(segment) || []);

        const m = new Matrix(matrix);
        m.preScale(s.frame.width, s.frame.height);

        for (let i = 0, l = _points.length; i < l; i++) {
            const p = _points[i];
            points.push({ point: m.computeCoord2(p.x, p.y), segment, index: i, selected: set.has(i) });
        }
    }

}

export function get_apexs(s: ContactLineView, matrix: Matrix) {
    const raw_p = s.getPoints(), m = new Matrix(matrix);
    if (!raw_p || raw_p.length < 2) return false;
    m.preScale(s.frame.width, s.frame.height);
    const apex1: {
        point: { x: number, y: number }
        type: 'from' | 'to'
    } = { point: m.computeCoord(raw_p[0]), type: 'from' };
    const apex2: {
        point: { x: number, y: number }
        type: 'from' | 'to'
    } = { point: m.computeCoord(raw_p[raw_p.length - 1]), type: 'to' };
    return { apex1, apex2 };
}

export function get_transform(shape: ShapeView) {
    const __r = shape.rotation || 0;
    const result = {
        rotate: __r,
        isFlippedHorizontal: false,
        isFlippedVertical: false,
    };

    result.rotate = shape.transform2FromRoot.decomposeEuler().z * 180 / Math.PI;

    return result
}

export function get_real_rotation(shape: ShapeView) {
    const t = get_transform(shape);
    let rotate = t.rotate;

    if (t.isFlippedHorizontal) {
        rotate = 180 - rotate;
    }

    if (t.isFlippedVertical) {
        rotate = 360 - rotate;
    }

    return rotate;
}

export function modify_rotate_before_set(deg: number, fh: boolean, fv: boolean) {
    if (fh) {
        deg = 180 - deg;
    }

    if (fv) {
        deg = 360 - deg;
    }

    return Math.floor(deg) % 360;
}

export function getCornerControlPoint(points: CurvePoint[], idx: number, frame: ShapeFrame) {
    const len = points.length;
    const preIndex = idx === 0 ? len - 1 : idx - 1;
    const nextIndex = idx === len - 1 ? 0 : idx + 1;
    const { width, height } = frame;
    const pre = points[preIndex];
    const cur = points[idx];
    const next = points[nextIndex];
    // 拿到三个点
    const prePoint = { x: points[preIndex].x * width, y: points[preIndex].y * height };
    const curPoint = { x: points[idx].x * width, y: points[idx].y * height };
    const nextPoint = { x: points[nextIndex].x * width, y: points[nextIndex].y * height }

    const lenAB = distanceTo(curPoint, prePoint);
    const lenBC = distanceTo(curPoint, nextPoint);

    const radian = calcAngleABC(prePoint, curPoint, nextPoint);

    if (Number.isNaN(radian)) {
        return;
    }

    let radius = cur.radius || 0;
    const tangent = Math.tan(radian / 2);
    let dist = radius / tangent;

    const minDist = Math.min(
        (pre.radius || 0) > 0 ? lenAB / 2 : lenAB,
        (next.radius || 0) > 0 ? lenBC / 2 : lenBC
    );

    if (dist > minDist) {
        dist = minDist;
        radius = dist * tangent;
    }

    const vPre = norm(minus(prePoint, curPoint));
    const vNext = norm(minus(nextPoint, curPoint));

    let preTangent = add(multiply(vPre, dist), curPoint);
    let nextTangent = add(multiply(vNext, dist), curPoint);

    const kappa = (4 / 3) * Math.tan((Math.PI - radian) / 4);

    let preHandle = add(multiply(vPre, -radius * kappa), preTangent);
    let nextHandle = add(multiply(vNext, -radius * kappa), nextTangent);
    return { preHandle, nextHandle, radius, prePoint, nextPoint, curPoint };
}

function distanceTo(p0: XY, p1: XY) {
    return Math.hypot(p0.x - p1.x, p0.y - p1.y);
}

function calcAngleABC(A: XY, B: XY, C: XY) {
    const AB = distanceTo(A, B);
    const BC = distanceTo(B, C);
    const AC = distanceTo(C, A);
    let value = (BC * BC + AB * AB - AC * AC) / (2 * BC * AB);
    if (value < -1) value = -1; // 防止出现NaN (特色情况：星形三个角，内角50%)
    return Math.acos(value);
}

function minus(p0: XY, p1: XY) {
    return { x: p0.x - p1.x, y: p0.y - p1.y };
}

function norm(p: XY) {
    const d = Math.hypot(p.x, p.y);
    return { x: p.x / d, y: p.y / d };
}

function multiply(p: XY, d: number) {
    return { x: p.x * d, y: p.y * d };
}

function add(p: XY, pt: XY) {
    return { x: p.x + pt.x, y: p.y + pt.y };
}

export const getRadiusValue = (start: XY, end: XY, e: MouseEvent, context: Context) => {
    const point3 = context.workspace.getContentXY(e); //鼠标位置
    if (start.x === end.x) {
        // 如果线段是竖直的
        const intersectionY = point3.y;
        const lineLength = Math.abs(end.y - start.y); // 计算线段的长度（竖直线段的长度即为纵坐标的差的绝对值）
        const distanceFromStart = Math.abs(intersectionY - start.y); // 交点到起点的距离（竖直线段的距离即为交点纵坐标与起点纵坐标的差的绝对值）
        const distanceFromEnd = Math.abs(intersectionY - end.y); // 交点到终点的距离（竖直线段的距离即为交点纵坐标与终点纵坐标的差的绝对值）
        const percent = Math.min(distanceFromStart / lineLength, 1);
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        return percent;
    } else if (start.y === end.y) {
        // 如果线段是水平的
        const intersectionX = point3.x;
        const lineLength = Math.abs(end.x - start.x);
        const distanceFromStart = Math.abs(intersectionX - start.x);
        const distanceFromEnd = Math.abs(intersectionX - end.x);

        const percent1 = Math.min(distanceFromStart / lineLength, 1);
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        return percent1;
    }
    const slope = (end.y - start.y) / (end.x - start.x); // 起点和终点的斜率
    const intercept = start.y - slope * start.x; //起点和终点的截距
    const verSlope = -1 / slope; //起点和终点的垂线斜率
    const verIntercept = point3.y - verSlope * point3.x; //垂线截距
    const intersectionX = (verIntercept - intercept) / (slope - verSlope); //直线垂线的交点
    const intersectionY = slope * intersectionX + intercept;
    const lineLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const distanceFromStart = Math.sqrt(Math.pow(intersectionX - start.x, 2) + Math.pow(intersectionY - start.y, 2)); // 交点到起点的距离
    const distanceFromEnd = Math.sqrt(Math.pow(intersectionX - end.x, 2) + Math.pow(intersectionY - end.y, 2)); // 交点到终点的距离
    const percent1 = Math.min(distanceFromStart / lineLength, 1); // 交点所在百分比位置
    if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
        return 0;
    }
    return percent1;
}