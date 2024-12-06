import { XY } from "@/context/selection";
import { CurvePoint, Matrix, PathSegment } from "@kcdesign/data";
import { convertQuadratic2Cubic } from "@/path/common";

export class PathHitChecker {
    transform: Matrix;
    point2D: XY;

    constructor(transform?: Matrix, point2D?: XY) {
        this.transform = transform ?? new Matrix();
        this.point2D = point2D ?? {x: 0, y: 0};
    }

    private __isPointInCurve(start: XY, handle1: XY, handle2: XY, end: XY) {

    }

    private isPointInCurve(apex1: CurvePoint, apex2: CurvePoint) {
        if (apex1.hasFrom && apex2.hasTo) {
            this.__isPointInCurve(
                apex1,
                {x: apex1.fromX!, y: apex1.fromY!},
                {x: apex2.toX!, y: apex2.toY!},
                apex2
            );
        } else if (apex1.hasFrom) {
            const apexes = convertQuadratic2Cubic(apex1, {x: apex1.fromX!, y: apex1.fromY!}, apex2);
            this.__isPointInCurve(apexes[0], apexes[1], apexes[2], apexes[3]);
        } else {
            const apexes = convertQuadratic2Cubic(apex1, {x: apex2.toX!, y: apex2.toY!}, apex2);
            this.__isPointInCurve(apexes[0], apexes[1], apexes[2], apexes[3]);
        }
    }

    private isPointInStraight(apex1: CurvePoint, apex2: CurvePoint) {

    }

    hit(apex1: CurvePoint, apex2: CurvePoint, point2D: XY) {

    }

    check(paths: PathSegment[], point2D: XY) {
        this.point2D = point2D;
    }
}