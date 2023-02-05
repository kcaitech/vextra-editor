import { CurveMode, PathShape, Point } from "./shape";
import { XY } from "./types";

type CornerCalcInfo = {
    curPoint: XY<number, number>;
    preTangent: XY<number, number>;
    nextTangent: XY<number, number>;
    preHandle: XY<number, number>;
    nextHandle: XY<number, number>;
};

/**
 * 另外关于 curvePoint
 * curveMode 默认 1， 应该表示没有 curve，直来直去
 *    只有 curveMode = 1 的时候，cornerRadius 才有效
 * curveMode 2, 表示 control point 是对称的，长度一样
 * curveMode 4, disconnected, control point 位置随意
 * curveMode 3, 也是对称，长度可以不一样
 */
export function parsePath(shape: PathShape, isClosed: boolean, offsetX: number, offsetY: number, width: number, height: number): string {
    let hasBegin = false;

    let path = "";
    const len = shape.pointsCount;
    if (len < 2) return "";

    const cacheCornerCalcInfo: { [k: number]: CornerCalcInfo } = {};

    const bezierCurveTo = (x1: number, y1: number, x2: number, y2: number, tx: number, ty: number) => {
        path = path + " C" + (offsetX + x1 * width) + " " + (offsetY + y1 * height) + " " + (offsetX + x2 * width) + " " + (offsetY + y2 * height) + " " + (offsetX + tx * width) + " " + (offsetY + ty * height);
    }
    const moveTo = (x: number, y: number) => {
        path = path + " M" + (offsetX + x * width) + " " + (offsetY + y * height);
    }
    const lineTo = (x: number, y: number) => {
        path = path + " L" + (offsetX + x * width) + " " + (offsetY + y * height);
    }
    const closePath = () => {
        path = path + " Z";
    }

    for (let i = 0; i < len - 1; i++) {
        _connectTwo(i, i + 1);
    }
    if (isClosed) {
        _connectTwo(len - 1, 0);
        closePath();
    }

    function _isCornerRadius(idx: number) {
        const curvePoint = shape.getPointByIndex(idx);
        if (!isClosed && (idx === 0 || idx === len - 1)) {
            return false;
        }
        return curvePoint.curveMode === CurveMode.Straight && curvePoint.cornerRadius > 0;
    }

    function distanceTo(p0: XY<number, number>, p1: XY<number, number>) {
        return Math.hypot(p0.x - p1.x, p0.y - p1.y);
    }

    function calcAngleABC(A: XY<number, number>, B: XY<number, number>, C: XY<number, number>) {
        const AB = distanceTo(A, B);
        const BC = distanceTo(B, C);
        const AC = distanceTo(C, A);
        return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    }

    function minus(p0: XY<number, number>, p1: XY<number, number>): XY<number, number> {
        return { x: p0.x - p1.x, y: p0.y - p1.y };
    }

    function norm(p: XY<number, number>) {
        const d = Math.hypot(p.x, p.y);
        // invariant(d !== 0, 'cant norm a vector whos len is zero');
        return { x: p.x / d, y: p.y / d };
    }

    function multiply(p: XY<number, number>, d: number) {
        return { x: p.x * d, y: p.y * d };
    }

    function add(p: XY<number, number>, pt: XY<number, number>) {
        return { x: p.x + pt.x, y: p.y + pt.y };
    }

    /**
     * # Notice 1
     * sketch 可以设置并存储的 corner radius 可能非常大，绘制的时候需要加以限制。
     * 1.1 如果一个 corner 另外两端都没有 corner，那么 cornerRadius 实际最大值，以两侧较短一侧为准。
     * 1.2 如果 corner 另外两端也有 corner，那么 cornerRadius 实际最大值，要以较短一侧一半为准。
     *
     *
     * @param idx
     * @returns
     */
    function _getCornerInfo(idx: number): CornerCalcInfo {
        if (cacheCornerCalcInfo[idx]) {
            return cacheCornerCalcInfo[idx];
        }
        const pre = idx === 0 ? shape.getPointByIndex(len - 1) : shape.getPointByIndex(idx - 1);
        const cur = shape.getPointByIndex(idx);
        const next = idx === len - 1 ? shape.getPointByIndex(0) : shape.getPointByIndex(idx + 1);

        let radius = cur.cornerRadius;

        // 拿到三个点
        const prePoint = pre.point; // A
        const curPoint = cur.point; // B
        const nextPoint = next.point; // C

        const lenAB = distanceTo(curPoint, prePoint);
        const lenBC = distanceTo(curPoint, nextPoint);

        // 三点之间的夹角
        const radian = calcAngleABC(prePoint, curPoint, nextPoint);

        // 计算相切的点距离 curPoint 的距离， 在 radian 为 90 deg 的时候和 radius 相等。
        const tangent = Math.tan(radian / 2);
        let dist = radius / tangent;

        // 校准 dist，用户设置的 cornerRadius 可能太大，而实际显示 cornerRadius 受到 AB BC 两边长度限制。
        // 如果 B C 端点设置了 cornerRadius，可用长度减半
        const minDist = Math.min(
            pre.curveMode === CurveMode.Straight && pre.cornerRadius > 0 ? lenAB / 2 : lenAB,
            next.curveMode === CurveMode.Straight && next.cornerRadius > 0 ? lenBC / 2 : lenBC
        );

        if (dist > minDist) {
            dist = minDist;
            radius = dist * tangent;
        }

        // 方向向量
        const vPre = norm(minus(prePoint, curPoint));
        const vNext = norm(minus(nextPoint, curPoint));

        // 相切的点
        const preTangent = add(multiply(vPre, dist), curPoint);
        const nextTangent = add(multiply(vNext, dist), curPoint);

        // 计算 cubic handler 位置
        const kappa = (4 / 3) * Math.tan((Math.PI - radian) / 4);

        const preHandle = add(multiply(vPre, -radius * kappa), preTangent);
        const nextHandle = add(multiply(vNext, -radius * kappa), nextTangent);

        cacheCornerCalcInfo[idx] = {
            curPoint,
            preTangent,
            nextTangent,
            preHandle,
            nextHandle,
        };

        return cacheCornerCalcInfo[idx];
    }

    // #####
    // curveFrom: 表示作为 from 点的时候的控制点
    // curveTo: 表示作为 to 点的时候的控制点
    // #####
    function _connectTwo(fromIdx: number, toIdx: number) {
        let startPt: XY<number, number>;
        let startHandle: XY<number, number> | undefined;

        let endPt: XY<number, number>;
        let endHandle: XY<number, number> | undefined;

        // 获取起始点信息
        if (_isCornerRadius(fromIdx)) {
            const { nextTangent } = _getCornerInfo(fromIdx);

            startPt = nextTangent;
        } else {
            const fromCurvePoint = shape.getPointByIndex(fromIdx);
            startPt = fromCurvePoint.point;
            startHandle = fromCurvePoint.hasCurveFrom ? fromCurvePoint.curveFrom : undefined;
        }

        if (!hasBegin) {
            hasBegin = true;
            moveTo(startPt.x, startPt.y);
        }

        // 获取终点信息
        if (_isCornerRadius(toIdx)) {
            const { preTangent } = _getCornerInfo(toIdx);
            endPt = preTangent;
        } else {
            const toCurvePoint = shape.getPointByIndex(toIdx);
            endPt = toCurvePoint.point;
            endHandle = toCurvePoint.hasCurveTo ? toCurvePoint.curveTo : undefined;
        }

        // 根据有没有 handle 选择 cubic 或者 line 连接
        if (startHandle || endHandle) {
            bezierCurveTo(
                startHandle?.x ?? startPt?.x,
                startHandle?.y ?? startPt.y,
                endHandle?.x ?? endPt.x,
                endHandle?.y ?? endPt.y,
                endPt.x,
                endPt.y
            );
        } else {
            lineTo(endPt.x, endPt.y);
        }

        // 如果 end 的时候是 corner，绘制圆角
        if (_isCornerRadius(toIdx)) {
            const { nextTangent, preHandle, nextHandle } = _getCornerInfo(toIdx);
            bezierCurveTo(preHandle.x, preHandle.y, nextHandle.x, nextHandle.y, nextTangent.x, nextTangent.y);
        }
    }

    return path;
}
