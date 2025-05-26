/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { PathShapeView, CurvePoint } from "@kcdesign/data";
import { Context } from "@/context";

interface ClipResult {
    closed: boolean;
    originSegmentIndex: number;
    slices: CurvePoint[][];
}

/**
 * @description 切割路径
 */
export class PathClipper {
    private readonly context: Context;
    private view: PathShapeView;

    constructor(context: Context, view: PathShapeView) {
        this.context = context;
        this.view = view;
    }

    private disconnect(slices: CurvePoint[][], sides: number[], points: CurvePoint[], closed: boolean) {
        if (sides.length === 1 && closed) { // 打开路径就好了
            const index = sides[0];
            slices.push([...points.slice(index + 1), ...points.slice(0, index + 1)]);
            return false;
        }
        points = points.slice(0);
        sides = sides.sort((a, b) => b - a);
        for (let i = 0; i < sides.length; i++) {
            const index = sides[i];
            if (closed) {
                closed = false;
                continue;
            }
            const last = sides[i - 1];
            if (last) {
                if (index === last - 1) {
                    points.splice(last, 1);
                } else {
                    slices.unshift(points.splice(index + 1, last - index));
                }
            } else {
                if (index === points.length - 1) {
                    points.pop();
                } else {
                    slices.unshift(points.splice(index + 1, points.length - 1 - index));
                }
            }
        }
        const last = sides[sides.length - 1];
        if (last !== points.length - 1) {
            points = [...points.slice(last + 1), ...points.slice(0, last + 1)];
        }
        slices.unshift(points);

        return closed;
    }

    private subtract(slices: CurvePoint[][], indexes: number[], points: CurvePoint[]) {
        const idSet = new Set<string>();
        for (const index of indexes) idSet.add(points[index].id);
        if (!slices.length) slices.push(points.slice(0));
        for (let j = slices.length - 1; j > -1; j--) {
            const slice = slices[j];
            for (let i = slice.length - 1; i > -1; i--) {
                if (idSet.has(slice[i].id)) slice.splice(i, 1);
            }
        }
    }

    private split(slices: CurvePoint[][], indexes: number[], points: CurvePoint[], isClosed: boolean) {
        const idSet = new Set<string>();
        for (const index of indexes) idSet.add(points[index].id);
        if (!slices.length) slices.push(points.slice(0));
        const __slices: CurvePoint[][] = [];
        for (let j = slices.length - 1; j > -1; j--) {
            let slice = slices[j];
            let copy = slice.slice(0);
            let lastIdx = slice.length - 1;
            let left: CurvePoint[] = [];
            for (let i = slice.length - 1; i > -1; i--) {
                if (!idSet.has(slice[i].id)) continue;
                if (isClosed) {
                    left = copy.slice(i + 1);
                    copy = copy.slice(0, i);
                    lastIdx = i;
                    isClosed = false;
                } else {
                    __slices.unshift(copy.slice(i + 1, lastIdx + 1));
                    copy = copy.slice(0, i);
                    lastIdx = i;
                }
            }
            if (left.length) copy = [...left, ...copy];
            __slices.unshift(copy);
        }
        slices.length = 0;
        slices.push(...__slices);
        return closed;
    }

    private getSlices(keepClosed = false) {
        const path = this.context.path;
        const segments = this.view.segments;
        const sides = path.selectedSides;
        const points = path.selectedPoints;
        const result: ClipResult[] = [];
        if (!(sides.size || points.size)) return result;
        const affected = Array.from(new Set((() => {
            const __affected: number[] = [];
            sides.forEach((i, k) => {
                i.length && __affected.push(k)
            });
            points.forEach((i, k) => {
                i.length && __affected.push(k)
            });
            return __affected;
        })())).sort((a, b) => b - a);
        for (const index of affected) {
            const segment = segments[index];
            const slices: CurvePoint[][] = [];
            const _sides = sides.get(index);
            let closed = segment.isClosed;
            if (_sides) closed = this.disconnect(slices, _sides, segment.points as CurvePoint[], segment.isClosed);
            const _points = points.get(index);
            if (_points) {
                if (keepClosed) {
                    this.subtract(slices, _points, segment.points as CurvePoint[]);
                } else {
                    closed = this.split(slices, _points, segment.points as CurvePoint[], segment.isClosed && !_sides);
                }
            }
            result.push({closed, originSegmentIndex: index, slices: slices.filter(s => s.length > 1)});
        }
        return result;
    }

    clip(keepClosed = false) {
        const slices = this.getSlices(keepClosed);
        if (!slices.length) return -1;
        return this.context.editor4Shape(this.view).clipPath(slices)
    }
}