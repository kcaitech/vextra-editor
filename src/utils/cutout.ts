/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from "@/context/selection";
import { PageView, ShadowPosition, ShapeType, ShapeView } from "@kcdesign/data";
import { isTarget2 } from '@/utils/common';
export function getCutoutShape(shape: ShapeView, page: PageView, selectedShapes: Map<string, ShapeView>) {
    if (!shape.parent) return;
    const matrix = shape.parent.matrix2Root();
    const p = shape.boundingBox()
    const p1: XY = matrix.computeCoord2(p.x, p.y); // lt
    const p2: XY = matrix.computeCoord2(p.width + p.x, p.y); // rt
    const p3: XY = matrix.computeCoord2(p.width + p.x, p.height + p.y); // rb
    const p4: XY = matrix.computeCoord2(p.x, p.height + p.y); //lb
    const ps: [XY, XY, XY, XY, XY] = [p1, p2, p3, p4, p1]; // 5个点方便闭合循环
    finder(page.childs, ps, selectedShapes); // 再寻找框选区外的图形
}

function finder(childs: ShapeView[], Points: [XY, XY, XY, XY, XY], selectedShapes: Map<string, ShapeView>) {
    for (let ids = 0, len = childs.length; ids < len; ids++) {
        const shape = childs[ids];
        if (selectedShapes.get(shape.id) || !shape.isVisible) continue;
        const m = childs[ids].matrix2Root();
        const { width, height, x, y } = shape.outerFrame;
        const { left, top, right, bottom } = getShadowMax(shape);
        const _x = x - left;
        const _y = y - top;
        const _w = left + right;
        const _h = top + bottom;
        const ps: XY[] = [{ x: _x, y: _y }, { x: width + _w, y: _y }, { x: width + _w, y: height + _h }, { x: _x, y: height + _h }, { x: _x, y: _y }];
        for (let i = 0; i < 5; i++) {
            const p = ps[i];
            ps[i] = m.computeCoord3(p);
        }

        if (isTarget2(Points, shape)) {
            private_set(shape.id, shape, selectedShapes);
        }
    }
}

function private_set(key: string, value: ShapeView, selectedShapes: Map<string, ShapeView>) {
    selectedShapes.set(key, value);
}

export const getShadowMax = (shape: ShapeView) => {
    const offsets = { left: 0, top: 0, right: 0, bottom: 0 };
    const shadows = shape.getShadows();
    if (!shadows.length) return offsets;
    const max_l = [0];
    const max_b = [0];
    const max_r = [0];
    const max_t = [0];
    for (let i = 0; i < shadows.length; i++) {
        const shadow = shadows[i];
        const { offsetX, offsetY, blurRadius, spread } = shadow;
        if (shadow.position === ShadowPosition.Outer) {
            if (offsetX >= 0) {
                const right = offsetX + blurRadius + spread;
                const left = blurRadius + spread - offsetX;
                max_l.push(left);
                max_r.push(right);
            }
            if (offsetY >= 0) {
                const bottom = offsetY + blurRadius + spread;
                const top = blurRadius + spread - offsetY;
                max_b.push(bottom);
                max_t.push(top);
            }
            if (offsetX < 0) {
                const left = -(offsetX - blurRadius - spread);
                const right = blurRadius + spread + offsetX;
                max_r.push(right);
                max_l.push(left);
            }
            if (offsetY < 0) {
                const top = -(offsetY - blurRadius - spread);
                const bottom = blurRadius + spread + offsetY;
                max_t.push(top);
                max_b.push(bottom);
            }
        }
    }
    offsets.left = Math.max(...max_l);
    offsets.top = Math.max(...max_t);
    offsets.right = Math.max(...max_r);
    offsets.bottom = Math.max(...max_b);
    return offsets;
}
export const parentIsArtboard = (shape: ShapeView) => {
    let result: ShapeView | undefined = undefined;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        result = p;
        break;
    }
    return result;
}

export const getPageBounds = (page: PageView) => {
    const childs = page.childs as ShapeView[];
    const { x, y, width, height } = page.frame;
    if (!(childs.length > 0)) return { x, y, width, height };
    const shapes = flattenShapes(childs).filter(s => (s.type !== ShapeType.Group));
    const page_bounds_points = getMaxMinPoints(shapes);
    const max_p = getMaxPoint(page_bounds_points);
    const min_p = getMinPoint(page_bounds_points);
    return {
        x: min_p.x,
        y: min_p.y,
        width: max_p.x - min_p.x,
        height: max_p.y - min_p.y
    };
}

export const getGroupChildBounds = (shape: ShapeView) => {
    const childs = shape.childs as ShapeView[];
    const { x, y, width, height } = shape.frame;
    if (!childs) return { x, y, width, height };
    const shapes = flattenShapes(childs).filter(s => (s.type !== ShapeType.Group));
    const group_bounds_points = getMaxMinPoints(shapes);
    const max_p = getMaxPoint(group_bounds_points);
    const min_p = getMinPoint(group_bounds_points);
    const m = shape.matrix2Root();
    const xy = m.computeCoord2(x, y);
    
    return {
        x: xy.x + min_p.x,
        y: xy.y + min_p.y,
        width: max_p.x - min_p.x,
        height: max_p.y - min_p.y
    }
}

const getMaxMinPoints = (shapes: ShapeView[]) => {
    const bounds_points = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const { left, top, right, bottom } = getShadowMax(shape);
        const frame = shape._p_outerFrame;
        const points = [];
        const width = frame.width + left + right;
        const height = frame.height + top + bottom;
        const p1 = { x: frame.x - left, y: frame.y - top }
        const p2 = { x: frame.x + width, y: frame.y - top }
        const p3 = { x: frame.x + width, y: frame.y + height }
        const p4 = { x: frame.x - left, y: frame.y + height }
        points.push(p1, p2, p3, p4);
        let max_point = getMaxPoint(points);
        let min_point = getMinPoint(points);
        bounds_points.push(max_point, min_point);
    }
    return bounds_points;
}
export function flattenShapes(shapes: ShapeView[]): ShapeView[] {
    return shapes.reduce((result: any, item: ShapeView) => {
        if (item.type === ShapeType.Group) {
            const childs = item.childs as ShapeView[];
            if (Array.isArray(childs)) {
                result = result.concat(flattenShapes(childs));
            }
        }
        return result.concat(item);
    }, []);
}

const getMaxPoint = (points: { x: number, y: number }[]) => {
    let max_x = points[0].x;
    let max_y = points[0].y;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point.x > max_x) max_x = point.x;
        if (point.y > max_y) max_y = point.y;
    }
    return { x: max_x, y: max_y }
}
const getMinPoint = (points: { x: number, y: number }[]) => {
    let min_x = points[0].x;
    let min_y = points[0].y;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point.x <= min_x) min_x = point.x;
        if (point.y <= min_y) min_y = point.y;
    }
    return { x: min_x, y: min_y }
}

export function compareArrays(s1: ShapeView[], s2: ShapeView[]) {
    if (s1.length !== s2.length) {
        return false;
    }
    for (let i = 0; i < s1.length; i++) {
        if (s1[i].id !== s2[i].id) {
            return false;
        }
    }
    return true;
}
