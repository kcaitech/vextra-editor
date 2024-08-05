import { XY } from "@/context/selection";
import { Border, BorderPosition, GroupShape, GroupShapeView, Page, PageView, ShadowPosition, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import { isTarget, isTarget2 } from '@/utils/common';
import { Context } from '@/context';
export function getCutoutShape(shape: ShapeView, page: PageView, selectedShapes: Map<string, ShapeView>) {
    if (!shape.parent) return;
    const matrix = shape.parent.matrix2Root();
    const p = shape.boundingBox()
    const { width, height } = shape.frame;
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
        const { width, height } = shape.frame;
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);
        const { left, top, right, bottom } = getShadowMax(shape);
        const _x = - (left + l_max);
        const _y = - (top + t_max);
        const _w = (left + l_max) + (right + r_max);
        const _h = (top + t_max) + (bottom + b_max);
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

export const getShapeBorderMax = (shape: ShapeView) => {
    const borders = shape.getBorders();
    let l_max = 0;
    let t_max = 0;
    let r_max = 0;
    let b_max = 0;
    if (!borders.length) return { l_max, t_max, r_max, b_max };
    for (let i = 0; i < borders.length; i++) {
        const border = borders[i];
        if (!border.isEnabled || border.position === BorderPosition.Inner) continue;
        const { thicknessBottom, thicknessTop, thicknessLeft, thicknessRight } = border.sideSetting;
        if (thicknessBottom > b_max) {
            b_max = border.position === BorderPosition.Center ? thicknessBottom / 2 : thicknessBottom;
        }
        if (thicknessLeft > l_max) {
            l_max = border.position === BorderPosition.Center ? thicknessLeft / 2 : thicknessLeft;
        }
        if (thicknessTop > t_max) {
            t_max = border.position === BorderPosition.Center ? thicknessTop / 2 : thicknessTop;
        }
        if (thicknessRight > r_max) {
            r_max = border.position === BorderPosition.Center ? thicknessRight / 2 : thicknessRight;
        }
    }
    return { l_max, t_max, r_max, b_max };
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

export const getShapeMaxBounds = (shape: Shape, x: number, y: number, width: number, height: number) => {
    let rotate = shape.rotation || 0;
    // todo flip
    // if (shape.isFlippedHorizontal) rotate = 180 - rotate;
    // if (shape.isFlippedVertical) rotate = 360 - rotate;
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    const radian = rotate * Math.PI / 180;
    const sin = Math.sin(radian);
    const cos = Math.cos(radian);
    const newx = Math.abs(x * cos) + Math.abs(y * sin);
    const newy = Math.abs(x * sin) + Math.abs(y * cos);
    const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
    const newHeight = Math.abs(width * sin) + Math.abs(height * cos);
    return {
        x: newx,
        y: newy,
        width: newWidth,
        height: newHeight,
        rotate: rotate
    };
}


// 对图片上任意点(x,y)，绕一个坐标点(rx0,ry0)逆时针旋转a角度后的新的坐标设为(x0, y0)，公式：
// x0= (x - rx0)*cos(a) - (y - ry0)*sin(a) + rx0 ;    y0= (x - rx0)*sin(a) + (y - ry0)*cos(a) + ry0 ;
export const getGroupChildBounds = (shape: ShapeView) => {
    const childs = shape.childs as ShapeView[];
    const { x, y, width, height } = shape.frame;
    if (!childs) return { x, y, width, height };
    const shapes = flattenShapes(childs).filter(s => (s.type !== ShapeType.Group));
    const group_bounds_points = getMaxMinPoints(shapes, shape);
    const max_p = getMaxPoint(group_bounds_points);
    const min_p = getMinPoint(group_bounds_points);
    return {
        x,
        y,
        width,
        height
    }
}

const getMaxMinPoints = (shapes: ShapeView[], s?: ShapeView) => {
    const bounds_points = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);
        const { left, top, right, bottom } = getShadowMax(shape);
        const l = (left + l_max);
        const t = (top + t_max);
        const r = (left + l_max) + (right + r_max);
        const b = (top + t_max) + (bottom + b_max);
        let frame = shape.frame;
        const cx = (frame.x + frame.width - frame.x + 1) / 2 + frame.x;
        const cy = (frame.y + frame.height - frame.y + 1) / 2 + frame.y;
        let rotate = shape.rotation || 0;
        rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
        const points = [];
        const p1 = getRotatePoint(frame.x - l, frame.y - t, rotate, cx, cy);
        const p2 = getRotatePoint(frame.x + frame.width + r, frame.y - t, rotate, cx, cy);
        const p3 = getRotatePoint(frame.x + frame.width + r, frame.y + frame.height + b, rotate, cx, cy);
        const p4 = getRotatePoint(frame.x - l, frame.y + frame.height + b, rotate, cx, cy);
        points.push(p1, p2, p3, p4);
        let max_point = getMaxPoint(points);
        let min_point = getMinPoint(points);
        let p = shape.parent;
        if (p && p.type !== ShapeType.Page) {
            while (p) {
                const p_farme = p.frame;
                max_point = {
                    x: max_point.x + p_farme.x,
                    y: max_point.y + p_farme.y
                }
                min_point = {
                    x: min_point.x + p_farme.x,
                    y: min_point.y + p_farme.y
                }
                break;
            }
        }
        if (s && s.parent && s.parent.type !== ShapeType.Page) {
            if (s.parent.type !== ShapeType.Group) {
                max_point = {
                    x: max_point.x + s.frame.x,
                    y: max_point.y + s.frame.y
                }
                min_point = {
                    x: min_point.x + s.frame.x,
                    y: min_point.y + s.frame.y
                }
            }
        }
        bounds_points.push(max_point, min_point);
    }
    return bounds_points;
}
export function flattenShapes(shapes: ShapeView[]): ShapeView[] {
    // if ((window as any).__context.workspace.transforming && (window as any).__context.selection.selectedShapes.length > 50) return shapes; @@@
    return shapes.reduce((result: any, item: ShapeView) => {
        if (item.type === ShapeType.Group) {
            const childs = (item).childs as ShapeView[];
            if (Array.isArray(childs)) {
                result = result.concat(flattenShapes(childs));
            }
        }
        return result.concat(item);
    }, []);
}

// 一个点沿着另一个点旋转后的位置
const getRotatePoint = (x: number, y: number, rotate: number, cx: number, cy: number) => {
    const radian = rotate * Math.PI / 180;
    const sin = Math.sin(radian);
    const cos = Math.cos(radian);
    const x0 = (x - cx) * cos - (y - cy) * sin + cx
    const y0 = (x - cx) * sin + (y - cy) * cos + cy
    return { x: x0, y: y0 }
}

const getMaxPoint = (points: { x: number, y: number }[]) => {
    let max_x = 0;
    let max_y = 0;
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
