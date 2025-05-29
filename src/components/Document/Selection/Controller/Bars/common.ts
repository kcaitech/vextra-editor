/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { XY } from "@/context/selection";
import { ResizingConstraints, ShapeView } from "@kcdesign/data";

/**
 * @description 获取a点到b点的距离
 */
export function get_length(a: XY, b: XY) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}
export function isEqu(a: number, b: number) {
    return Math.abs(a - b) < 0.0001;
}
export function dir(a: XY, b: XY): 'ver' | 'hor' | undefined {
    if (isEqu(a.x, b.x)) {
        return 'ver';
    }

    if (isEqu(a.y, b.y)) {
        return 'hor';
    }
}
export function get_locate(a: XY, b: XY) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function get_dashes(context: Context, shape: ShapeView, rect: [XY, XY, XY, XY]) {
    const parent = shape.parent;
    const result: string[] = [];
    if (!parent) {
        return [];
    }

    const frame = parent.frame;

    let apex2 = [
        { x: 0, y: 0 },
        { x: frame.width, y: 0 },
        { x: frame.width, y: frame.height },
        { x: 0, y: frame.height }
    ];

    let matrix = parent.matrix2Root();
    matrix.multiAtLeft(context.workspace.matrix);

    apex2 = apex2.map(p => matrix.computeCoord3(p));

    const center = { x: (rect[0].x + rect[2].x) / 2, y: (rect[0].y + rect[2].y) / 2 };

    // const resizing = shape.resizingConstraint || ResizingConstraints.Mask;

    // if (ResizingConstraints.isFixedToLeft(resizing)) {
    //     const s = findPerpendicularFoot(apex2[0], apex2[3], center);
    //     const e = get_border_apex(s, center, rect);

    //     if (e) {
    //         result.push(`M ${s.x} ${s.y} L ${e.x} ${e.y} z`);
    //     }
    // }

    return result;
}

// 计算两点之间的斜率
function calculateSlope(point1: XY, point2: XY) {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

// 计算直线AB经过点Q的垂线的垂足
function findPerpendicularFoot(A: XY, B: XY, Q: XY) {
    // 计算直线AB的斜率
    let slopeAB = calculateSlope(A, B);

    if (slopeAB === Infinity) {
        return { x: A.x, y: Q.y };
    } else if (slopeAB === 0) {
        return { x: Q.x, y: A.y };
    }

    // 计算垂线的斜率
    let slopePerpendicular = -1 / slopeAB;

    // 利用点斜式方程求垂足的坐标
    let xFoot = (slopeAB * (Q.y - A.y) + A.x + slopePerpendicular * Q.x) / (slopeAB + slopePerpendicular);
    let yFoot = slopePerpendicular * (xFoot - Q.x) + Q.y;

    // 返回垂足的坐标
    return { x: xFoot, y: yFoot };
}

function calculateIntersection(A: XY, B: XY, C: XY, D: XY) {
    // 线段AB的方程参数
    let a1 = B.y - A.y;
    let b1 = A.x - B.x;
    let c1 = a1 * A.x + b1 * A.y;

    // 线段CD的方程参数
    let a2 = D.y - C.y;
    let b2 = C.x - D.x;
    let c2 = a2 * C.x + b2 * C.y;

    // 计算交点的坐标
    let determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
        // 两条线段平行，没有交点
        return null;
    } else {
        let x = (b2 * c1 - b1 * c2) / determinant;
        let y = (a1 * c2 - a2 * c1) / determinant;
        return { x, y };
    }
}

function get_distance(p1: XY, p2: XY) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function get_border_apex(fixed1: XY, center: XY, apexes: [XY, XY, XY, XY]) {
    const points = [...apexes, apexes[0]];
    let distance = Infinity;
    let fixed2: null | XY = null;

    for (let i = 0; i < 4; i++) {
        const intersection = calculateIntersection(fixed1, center, points[i], points[i + 1]);
        if (!intersection) {
            continue;
        }

        const _d = get_distance(fixed1, intersection);

        if (_d < distance) {
            distance = _d;
            fixed2 = intersection;
        }
    }

    return fixed2;
}