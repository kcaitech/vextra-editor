import { XY } from "@/context/selection";
import { Border, BorderPosition, Page, ShadowPosition, Shape, ShapeType } from "@kcdesign/data";
import { isTarget } from '@/utils/common';
export function getCutoutShape(shape: Shape, page: Page, selectedShapes: Map<string, Shape>) {
    const matrix = shape.matrix2Root();
    const p = shape.boundingBox()
    const { width, height } = shape.frame;
    const p1: XY = matrix.computeCoord2(0, 0); // lt
    const p2: XY = matrix.computeCoord2(width, 0); // rt
    const p3: XY = matrix.computeCoord2(width, height); // rb
    const p4: XY = matrix.computeCoord2(0, height); //lb
    const ps: [XY, XY, XY, XY, XY] = [p1, p2, p3, p4, p1]; // 5个点方便闭合循环
    finder(page.childs, ps, selectedShapes); // 再寻找框选区外的图形
}

function finder(childs: Shape[], Points: [XY, XY, XY, XY, XY], selectedShapes: Map<string, Shape>) {
    for (let ids = 0, len = childs.length; ids < len; ids++) {
        const shape = childs[ids];
        if (selectedShapes.get(shape.id) || shape.isLocked || !shape.isVisible) continue;
        const m = childs[ids].matrix2Root();
        const { width, height } = shape.frame;
        const max_border = getShapeBorderMax(shape);
        const { left, top, right, bottom } = getShadowMax(shape);
        const _x = - (left + max_border);
        const _y = - (top + max_border);
        const _w = (left + max_border) + (right + max_border);
        const _h = (top + max_border) + (bottom + max_border);
        const ps: XY[] = [{ x: _x, y: _y }, { x: width + _w, y: _y }, { x: width + _w, y: height + _h }, { x: _x, y: height + _h }, { x: _x, y: _y }];
        for (let i = 0; i < 5; i++) {
            const p = ps[i];
            ps[i] = m.computeCoord3(p);
        }
        
        if (isTarget(Points, ps)) {
            private_set(shape.id, shape, selectedShapes);
        }

    }
}

function private_set(key: string, value: Shape, selectedShapes: Map<string, Shape>) {
    selectedShapes.set(key, value);
}

export const getShapeBorderMax = (shape: Shape) => {
    if (!shape.style.borders.length) return 0;
    const borders = shape.style.borders;
    const max_b = [0];
    for (let i = 0; i < borders.length; i++) {
        const border = borders[i];
        if (border.position === BorderPosition.Outer) {
            max_b.push(border.thickness / 2);
        } else if (border.position === BorderPosition.Inner) {
            continue;
        }
        max_b.push(border.thickness);
    }
    return Math.max(...max_b);
}

export const getShadowMax = (shape: Shape) => {
    const offsets = { left: 0, top: 0, right: 0, bottom: 0 };
    if (!shape.style.shadows.length) return offsets;
    const shadows = shape.style.shadows;
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