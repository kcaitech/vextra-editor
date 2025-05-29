/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from "@/context/selection";
import { CurvePoint, Matrix, PathSegment } from "@kcdesign/data";
import { convertQuadratic2Cubic } from "@/path/common";
import { Context } from "@/context";

export class PathHitChecker {
    transform: Matrix;
    point2D: XY;

    constructor(private context: Context, transform?: Matrix, point2D?: XY) {
        this.transform = transform ?? new Matrix();
        this.point2D = point2D ?? {x: 0, y: 0};
    }

    static bezierCurvePointAtT(p0: XY, p1: XY, p2: XY, p3: XY, t: number): XY {
        return {
            x: Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x,
            y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y
        };
    }

    private isPointInCubic(start: XY, handle1: XY, handle2: XY, end: XY) {
        start = this.transform.computeCoord3(start);
        handle1 = this.transform.computeCoord3(handle1);
        handle2 = this.transform.computeCoord3(handle2);
        end = this.transform.computeCoord3(end);
        const path = `M${start.x} ${start.y} C ${handle1.x} ${handle1.y} ${handle2.x} ${handle2.y} ${end.x} ${end.y}`;
        return this.context.selection.scout.isPointInStroke(path, this.point2D, 2);
    }

    private isPointInCurve(apex1: CurvePoint, apex2: CurvePoint) {
        if (apex1.hasFrom && apex2.hasTo) {
            return this.isPointInCubic(
                apex1,
                {x: apex1.fromX!, y: apex1.fromY!},
                {x: apex2.toX!, y: apex2.toY!},
                apex2
            );
        } else if (apex1.hasFrom) {
            const apexes = convertQuadratic2Cubic(apex1, {x: apex1.fromX!, y: apex1.fromY!}, apex2);
            return this.isPointInCubic(apexes[0], apexes[1], apexes[2], apexes[3]);
        } else {
            const apexes = convertQuadratic2Cubic(apex1, {x: apex2.toX!, y: apex2.toY!}, apex2);
            return this.isPointInCubic(apexes[0], apexes[1], apexes[2], apexes[3]);
        }
    }

    private isPointInStraight(apex1: XY, apex2: XY) {
        apex1 = this.transform.computeCoord3(apex1);
        apex2 = this.transform.computeCoord3(apex2);
        const path = `M${apex1.x} ${apex1.y} L${apex2.x} ${apex2.y}`;
        return this.context.selection.scout.isPointInStroke(path, this.point2D, 2);
    }

    private __hit(apex1: CurvePoint, apex2: CurvePoint) {
        return (apex1.hasFrom || apex2.hasTo) ? this.isPointInCurve(apex1, apex2) : this.isPointInStraight(apex1, apex2);
    }

    hit(apex1: CurvePoint, apex2: CurvePoint, point2D: XY) {
        this.point2D = point2D;
        return (apex1.hasFrom || apex2.hasTo) ? this.isPointInCurve(apex1, apex2) : this.isPointInStraight(apex1, apex2);
    }

    getTByXYFromCurve(apex1: CurvePoint, apex2: CurvePoint, point2D: XY) {
        let apexes: XY[];
        if (apex1.hasFrom && apex2.hasTo) {
            apexes = [apex1, {x: apex1.fromX!, y: apex1.fromY!}, {x: apex2.toX!, y: apex2.toY!}, apex2];
        } else if (apex1.hasFrom) {
            apexes = convertQuadratic2Cubic(apex1, {x: apex1.fromX!, y: apex1.fromY!}, apex2);
        } else {
            apexes = convertQuadratic2Cubic(apex1, {x: apex2.toX!, y: apex2.toY!}, apex2);
        }
        apexes = apexes.map(i => this.transform.computeCoord3(i));
        const {x, y} = point2D;
        for (let t = 0; t < 1; t = t + 0.0001) {
            const __xy = PathHitChecker.bezierCurvePointAtT(apexes[0], apexes[1], apexes[2], apexes[3], t);
            if (Math.hypot(__xy.x - x, __xy.y - y) <= 1) return t;
        }
    }

    check(paths: PathSegment[], point2D: XY) {
        this.point2D = point2D;
        for (let segmentIndex = 0; segmentIndex < paths.length; segmentIndex++) {
            const segment = paths[segmentIndex];
            const points = segment.points.slice(0);
            if (segment.isClosed) points.push(points[0]);
            for (let index = 0; index < points.length - 1; index++) {
                const current = points[index];
                const next = points[index + 1];
                if (this.__hit(current, next)) {
                    const result: {
                        segmentIndex: number,
                        index: number,
                        current: CurvePoint,
                        next: CurvePoint,
                        isCurve: boolean,
                        t?: number
                    } = {segmentIndex, index, current, next, isCurve: false};

                    if (current.fromX || next.hasTo) {
                        result["isCurve"] = true;
                        result["t"] = this.getTByXYFromCurve(current, next, point2D);
                    }

                    return result;
                }
            }
        }
    }
}