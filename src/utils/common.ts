/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from '@/context/selection';
import { v4 as uuid } from "uuid";
import { debounce } from 'lodash';
import {
    ContactShape,
    Matrix,
    PathShape,
    PathShapeView,
    Shape,
    ShapeType,
    ShapeView,
    adapt2Shape,
    ContactLineView
} from '@kcdesign/data';
import { Context } from '@/context';
import { is_straight } from './attri_setting';
import { hidden_selection, selectShapes } from './content';
// import { Perm } from '@/context/workspace';
// import { permIsEdit } from './permission';
export const permIsEdit = (context: Context) => {
    return Boolean(!context.readonly && !context.tool.isLable);
}

// 打印
function _debounceLog(mes: any, flag?: string) {
    console.log(flag ? `${flag} ${mes}` : mes);
}

export const debounceLog = debounce(_debounceLog, 300);

// 简易id
export function simpleId(): string {
    return uuid().split('-')[3];
}

// 获取Select的options
export function genOptions(items: string[][]) {
    return items.map((item: string[], index: number) => {
        return {
            id: index,
            data: {
                value: item[0],
                content: item[1],
                [item[2] ? 'icon' : '']: item[2],
                [item[3] ? 'type' : '']: item[3]
            }
        }
    })
}

// 获取两条直线的夹角
export function getAngle(line1: [number, number, number, number], line2: [number, number, number, number]): number {
    // const slope1 = Math.abs((line1[3] - line1[1]) / (line1[2] - line1[0])) === Infinity ? 0 : (line1[3] - line1[1]) / (line1[2] - line1[0]);
    // const slope2 = Math.abs((line2[3] - line2[1]) / (line2[2] - line2[0])) === Infinity ? 0 : (line2[3] - line2[1]) / (line2[2] - line2[0]);
    const slope1 = (line1[3] - line1[1]) / (line1[2] - line1[0]);
    const slope2 = (line2[3] - line2[1]) / (line2[2] - line2[0]);
    const angleRad = Math.atan((slope2 - slope1) / (1 + slope1 * slope2));
    return angleRad * (180 / Math.PI);
}

// 根据四个点生成一个矩形
// p1 p2
// p4 p3
export function createRect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    const left = Math.min(x1, x2, x3, x4);
    const top = Math.min(y1, y2, y3, y4);
    const right = Math.max(x1, x2, x3, x4);
    const bottom = Math.max(y1, y2, y3, y4);

    const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));

    const angle = getHorizontalAngle({ x: x1, y: y1 }, { x: x2, y: y2 });

    const transX = ((right - left) - width) / 2;
    const transY = ((bottom - top) - height) / 2;
    const transform = `transform: translate(${transX}px, ${transY}px) rotate(${angle}deg);`
    return "position: absolute; " +
        `left: ${left}px; ` +
        `top: ${top}px; ` +
        `width: ${width}px; ` +
        `height: ${height}px; ` +
        transform;
}

// 根据四个点生成一条线
// p1 p2
// p4 p3
export function createLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    const left = Math.min(x1, x2, x3, x4);
    const top = Math.min(y1, y2, y3, y4);
    const right = Math.max(x1, x2, x3, x4);
    const bottom = Math.max(y1, y2, y3, y4);

    const lineThick = 14; // 线条控件实际宽度

    const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));

    const length = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

    const angle = getHorizontalAngle({ x: x1, y: y1 }, { x: x3, y: y3 });

    const transY = (((bottom - top) - height) + (height - lineThick)) / 2;
    const transX = (((right - left) - width) + (width - length)) / 2;
    const transform = `transform: translate(${transX}px, ${transY}px) rotate(${angle}deg);`
    return "position: absolute; " +
        `left: ${left}px; ` +
        `top: ${top}px; ` +
        `width: ${length}px; ` +
        `height: ${lineThick}px; ` +
        transform;
}

// 根据矩形的四个点获取其中心轴
// p1 p2
// p4 p3
export function getAxle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): XY {
    const left = Math.min(x1, x2, x3, x4);
    const top = Math.min(y1, y2, y3, y4);
    const right = Math.max(x1, x2, x3, x4);
    const bottom = Math.max(y1, y2, y3, y4);
    return { x: (left + right) / 2, y: (top + bottom) / 2 };
}

// 根据矩形的三个点，获取矩形宽高
// p1 p2
// p4 p3
export function getRectWH(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
    return { width, height }
}

// 获取直线的水平夹角
export function getHorizontalAngle(A: { x: number, y: number }, B: { x: number, y: number }) {
    const deltaX = B.x - A.x;
    const deltaY = B.y - A.y;
    return (Math.atan2(deltaY, deltaX) * 180 / Math.PI + 360) % 360;
}

// 根据若干个点[x, y]，确定最边界的四个点
export function createHorizontalBox(points: [number, number][]) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < points.length; i++) {
        xs.push(points[i][0]);
        ys.push(points[i][1]);
    }
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    return { top, bottom, left, right };
}

// 根据若干个点{x, y}，确定最边界的四个点
export function XYsBounding(points: XY[]) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < points.length; i++) {
        xs.push(points[i].x);
        ys.push(points[i].y);
    }
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    return { top, bottom, left, right };
}

// 寻找群体shape在屏幕坐标系上的边界
export function XYsBounding2(shapes: Shape[], context: Context) {
    if (!shapes.length) return false;
    const wm = context.workspace.matrix;
    const fs = shapes[0], fbox = fs.boundingBox(), fsp = fs.parent;
    if (!fsp) return false;
    const fspm2r = fsp.matrix2Root();
    fspm2r.multiAtLeft(wm);
    const xy1 = fspm2r.computeCoord2(fbox.x, fbox.y),
        xy2 = fspm2r.computeCoord2(fbox.x + fbox.width, fbox.y + fbox.height);
    let top = xy1.y, bottom = xy2.y, left = xy1.y, right = xy2.x;
    if (shapes.length < 2) return { top, bottom, left, right };
    for (let i = 1, len = shapes.length; i < len; i++) {
        const s = shapes[i], m2r = s.matrix2Root(), f = s.frame;
        m2r.multiAtLeft(wm);
        const points = [m2r.computeCoord2(0, 0), m2r.computeCoord2(f.width, 0), m2r.computeCoord2(f.width, f.height), m2r.computeCoord2(0, f.height)];
        for (let i = 0; i < 4; i++) {
            const p = points[i];
            if (p.x < left) left = p.x; else if (p.x > right) right = p.x;
            if (p.y < top) top = p.y; else if (p.y > bottom) bottom = p.y;
        }
    }
    return { top, bottom, left, right };
}

export function is_box_outer_view(box: { top: number, bottom: number, left: number, right: number }, context: Context) {
    const { x, right, y, bottom } = context.workspace.root;
    return (box.right > right - x) || (box.left < 0) || (box.top < 0) || (box.bottom > bottom - y);
}

export function is_box_outer_view2(shapes: Shape[], context: Context) {
    const wm = context.workspace.matrix
    const { x, right, y, bottom } = context.workspace.root;
    for (let i = 0, len = shapes.length; i < len; i++) {
        const { m01: x, m12: y } = shapes[i].transform;
        const p = wm.computeCoord2(x, y);

        if ((p.x > right - x) || (p.x < 0) || (p.y < 0) || (p.y > bottom - y)) {
            return true;
        }
    }
    return false;
}


// 判断线段p1q1与线段p2q2是否🍌
export function isIntersect(p1: XY, q1: XY, p2: XY, q2: XY): boolean {
    const orientation1 = pointOrientation(p1, q1, p2);
    const orientation2 = pointOrientation(p1, q1, q2);
    const orientation3 = pointOrientation(p2, q2, p1);
    const orientation4 = pointOrientation(p2, q2, q1);

    if (orientation1 !== orientation2 && orientation3 !== orientation4) return true;
    if (orientation1 === 0 && isOnSegment(p1, p2, q1)) return true;
    if (orientation2 === 0 && isOnSegment(p1, q2, q1)) return true;
    if (orientation3 === 0 && isOnSegment(p2, p1, q2)) return true;
    if (orientation4 === 0 && isOnSegment(p2, q1, q2)) return true;
    return false;

    function pointOrientation(p1: XY, p2: XY, p3: XY) {
        const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
        if (val === 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    function isOnSegment(p: XY, q: XY, r: XY) {
        return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
    }
}

// 判断形状是否被包涵
export function isIncluded(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[]): boolean {
    const left = selectorPoints[0].x, top = selectorPoints[0].y, right = selectorPoints[2].x,
        bottom = selectorPoints[2].y;

    const { left: l, top: t, right: r, bottom: b } = XYsBounding(shapePoints);
    return l >= left && r <= right && t >= top && b <= bottom;
}

// 两个形状既不🍌也没有包含关系，返回false
export function isTarget(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[], includes?: boolean) {
    if (isIncluded(selectorPoints, shapePoints)) return true;
    if (includes) return false;
    for (let i = 0, len = selectorPoints.length - 1; i < len; i++) {
        const p1 = selectorPoints[i], q1 = selectorPoints[i + 1];
        if (shapePoints.length === 2) { // 线条
            if (isIntersect(p1, q1, shapePoints[0], shapePoints[1])) return true;
        } else {
            for (let j = 0; j < shapePoints.length - 1; j++) {
                const p2 = shapePoints[j], q2 = shapePoints[j + 1];
                if (isIntersect(p1, q1, p2, q2)) return true;
            }
        }
    }
    return false;
}

interface Side {
    start: XY
    end: XY
}

export function get_side_by_points(points: XY[]) {
    if (points.length <= 1) {
        return [];
    }
    const sides: Side[] = [];
    for (let i = 1, l = points.length; i < l; i++) {
        const start = points[i - 1];
        const end = points[i];
        sides.push({ start, end });
    }
    return sides;
}

export function get_points_for_straight(shape: PathShapeView) {
    const segment = shape.segments[0];
    const start = segment.points[0];
    const end = segment.points[1];

    if (!start || !end) {
        return [];
    }

    const m = shape.matrix2Root();
    const { width, height } = shape.frame;
    m.preScale(width, height);

    return [m.computeCoord2(start.x, start.y), m.computeCoord2(end.x, end.y)];
}

export function get_points_from_shape(shape: ShapeView) {
    if (is_straight(shape)) return get_points_for_straight(shape as PathShapeView);

    const m = shape.matrix2Root();
    const { width, height, x, y } = shape.frame;

    if (shape instanceof ContactLineView) {
        m.preScale(width, height);
        return shape.getPoints().map(i => m.computeCoord2(i.x, i.y));
    }

    const ps: XY[] = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }, { x, y }];
    for (let i = 0; i < 5; i++) {
        const p = ps[i];
        ps[i] = m.computeCoord3(p);
    }
    return ps;
}

export function isIncluded2(selectorPoints: XY[], shapePoints: XY[]): boolean {
    const { left, top, right, bottom } = XYsBounding(selectorPoints);
    const { left: l, top: t, right: r, bottom: b } = XYsBounding(shapePoints);
    return l >= left && r <= right && t >= top && b <= bottom;
}

export function isTarget2(selectorPoints: [XY, XY, XY, XY, XY], shape: ShapeView, includes?: boolean) {
    const points = get_points_from_shape(shape);
    if (isIncluded2(selectorPoints, points)) return true; // 选择器是否完全覆盖目标

    if (includes) return false; // 需要完全覆盖而未完全覆盖，判为false

    if (isIncluded2(points, selectorPoints)) return true;  // 目标是否覆盖了选择器

    // 检测是否相交
    const selectorPointsSides = get_side_by_points(selectorPoints);
    const shapeSides = get_side_by_points(points);

    if (!shapeSides.length) return false;

    for (let i = 0, l = selectorPointsSides.length; i < l; i++) {
        const side = selectorPointsSides[i];

        const p1 = side.start;
        const q1 = side.end;

        for (let j = 0, k = shapeSides.length; j < k; j++) {
            const _side = shapeSides[j];

            const p2 = _side.start
            const q2 = _side.end;

            if (isIntersect(p1, q1, p2, q2)) return true;
        }
    }
    return false;
}

export function is_mac() {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

export function string_by_sys(str: string): string {
    if (is_mac()) {
        return str.replace(/ctrl|Ctrl/g, "⌘").replace(/shift|Shift/g, "⇧").replace(/alt|Alt/g, "⌥");
    } else {
        return str;
    }
}

export function forbidden_to_modify_frame(shape: ShapeView) {
    return shape.isLocked || shape.isVirtualShape;
}

export function scout_once(context: Context, e: MouseEvent) {
    const { clientX, clientY, metaKey, ctrlKey } = e;
    const { x, y } = context.workspace.root;
    const xy = context.workspace.matrix.inverseCoord(clientX - x, clientY - y);
    const shapes = context.selection.getShapesByXY(xy, metaKey || ctrlKey);
    selectShapes(context, shapes);
}

export function menu_locate(context: Context, site: XY, el: HTMLElement | undefined) {
    if (!el) {
        return;
    }
    const SPACE = 4;
    const root = context.workspace.root;

    const el_width = el.clientWidth;
    const el_height = el.clientHeight;

    let left = site.x;
    let top = site.y;

    const over_left = left + el_width - root.width + SPACE;
    if (over_left > 0) {
        left -= over_left;
    }
    if (left < SPACE) {
        left = SPACE;
    }

    const over_top = top + el_height - root.height + SPACE;
    if (over_top > 0) {
        top -= over_top;
    }
    if (top < SPACE) {
        top = SPACE;
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    return over_left;
}


export function menu_locate2(e: MouseEvent, el: HTMLDivElement | undefined, el_parent: HTMLDivElement | undefined) {
    if (!el || !el_parent) {
        return;
    }

    const box = el_parent.getBoundingClientRect();

    let left = e.clientX - box.x;
    let top = e.clientY - box.y;

    const el_height = el.clientHeight;

    const over_top = e.clientY + el_height - document.documentElement.clientHeight + 4;

    if (over_top > 0) {
        top -= over_top;
    }

    if (top * -1 > box.y - 46 - 4) {
        top = -(box.y - 46 - 4);
    }

    el.style.left = left + 'px';
    el.style.top = top + 'px';
}

export function isInt(num: number, fix = 2) {
    num = Number(num.toFixed(fix));
    return (num | 0) === num;
}

export function format_value(val: number | string, fix = 2) {
    if (typeof val === 'string' || val === undefined) {
        return val;
    }

    if (isInt(val)) {
        return Number(val.toFixed(0));
    }

    return fixedZero(val);
}

export const fixedZero = (value: number | string) => {
    if (typeof value === 'string') return value;
    value = Math.round(value * 100) / 100;
    if (Number.isInteger(value)) {
        return value.toFixed(0); // 返回整数形式
    } else if (Math.abs(value * 10 - Math.round(value * 10)) < Number.EPSILON) {
        return value.toFixed(1); // 保留一位小数
    } else {
        return value.toFixed(2); // 保留两位小数
    }
}

export function modifyOpacity(context: Context, val: number, _shapes?: ShapeView[]) {
    if (!permIsEdit(context) || context.textSelection.cursorStart > -1) return;
    const page = context.selection.selectedPage!;
    const shapes = _shapes || context.selection.selectedShapes;
    const editor = context.editor4Page(page);
    editor.modifyShapesContextSettingOpacity(shapes, val);
    hidden_selection(context);
}

export function modifyXYByAlignSetting(context: Context, xy: XY) {
    if (context.user.isPixelAlignMent) {
        xy.x = Math.round(xy.x);
        xy.y = Math.round(xy.y);
    }
    return xy;
}

export function modifyXYByAlignSettingCell(context: Context, xy: XY) {
    if (context.user.isPixelAlignMent) {
        xy.x = Math.ceil(xy.x);
        xy.y = Math.ceil(xy.y);
    }
    return xy;
}

export function modifyXYByAlignSettingFloor(context: Context, xy: XY) {
    if (context.user.isPixelAlignMent) {
        xy.x = Math.floor(xy.x);
        xy.y = Math.floor(xy.y);
    }
    return xy;
}