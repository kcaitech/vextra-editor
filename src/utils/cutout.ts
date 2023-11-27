import { XY } from "@/context/selection";
import { Border, BorderPosition, Page, Shape, ShapeType } from "@kcdesign/data";
import { isTarget } from '@/utils/common';
export function getCutoutShape(shape: Shape, page: Page, selectedShapes: Map<string, Shape>) {
    const matrix = shape.matrix2Root();
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
        const ps: XY[] = [{ x: -max_border, y: -max_border }, { x: width + (max_border * 2), y: -max_border }, { x:  + (max_border * 2), y: height + (max_border * 2) }, { x: -max_border, y: height + (max_border * 2) }, { x: -max_border, y: -max_border }];
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

const getShapeBorderMax = (shape: Shape) => {
    if(!shape.style.borders.length) return 0;
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