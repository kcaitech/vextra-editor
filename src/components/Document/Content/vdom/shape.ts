import { VariableType, OverrideType, Variable, ShapeFrame, RenderTransform, SymbolRefShape, SymbolShape, Shape, renderFills, renderBorders } from "@kcdesign/data";
import { VDom, findOverrideAndVar, stringh } from "./basic";
import { Matrix, Path, ResizingConstraints } from "@kcdesign/data";
import { EL, elh, recycleELArr } from "./el";

export function isDiffShapeFrame(lsh: ShapeFrame, rsh: ShapeFrame) {
    return (
        lsh.x !== rsh.x ||
        lsh.y !== rsh.y ||
        lsh.width !== rsh.width ||
        lsh.height !== rsh.height
    );
}

export function isDiffRenderTransform(lhs: RenderTransform | undefined, rhs: RenderTransform | undefined) {
    if (lhs === rhs) { // both undefined
        return false;
    }
    if (lhs === undefined || rhs === undefined) {
        return true;
    }
    return (
        lhs.dx !== rhs.dx ||
        lhs.dy !== rhs.dy ||
        lhs.scaleX !== rhs.scaleX ||
        lhs.scaleY !== rhs.scaleY ||
        lhs.rotate !== rhs.rotate ||
        lhs.scaleX !== rhs.scaleX ||
        lhs.scaleY !== rhs.scaleY ||
        isDiffShapeFrame(lhs.parentFrame, rhs.parentFrame)
    )
}

export function isDiffVarsContainer(lhs: (SymbolRefShape | SymbolShape)[] | undefined, rhs: (SymbolRefShape | SymbolShape)[] | undefined): boolean {
    if (lhs === rhs) { // both undefined
        return false;
    }
    if (lhs === undefined || rhs === undefined) {
        return true;
    }
    if (lhs.length !== rhs.length) {
        return true;
    }
    for (let i = 0; i < lhs.length; i++) {
        if (lhs[i].id !== rhs[i].id) {
            return true;
        }
    }
    return false;
}

export function isNoTransform(trans: RenderTransform | undefined): boolean {
    return !trans ||
        trans.dx === 0 &&
        trans.dy === 0 &&
        trans.scaleX === 1 &&
        trans.scaleY === 1 &&
        trans.rotate === 0 &&
        !trans.hflip &&
        !trans.vflip;
}

export function fixFrameByConstrain(shape: Shape, parentFrame: ShapeFrame, frame: ShapeFrame) {
    const originParentFrame = shape.parent?.frame; // 至少有page!
    if (!originParentFrame) return;

    const cFrame = shape.frame;
    const resizingConstraint = shape.resizingConstraint;
    if (!resizingConstraint || ResizingConstraints.isUnset(resizingConstraint)) {
        return;
    }

    // 水平
    const hasWidth = ResizingConstraints.hasWidth(resizingConstraint);
    const hasLeft = ResizingConstraints.hasLeft(resizingConstraint);
    const hasRight = ResizingConstraints.hasRight(resizingConstraint);
    // 计算width, x
    // 宽度与同时设置左右是互斥关系，万一数据出错，以哪个优先？先以左右吧
    let cw = frame.width;
    let cx = frame.x;
    if (hasLeft && hasRight) {
        if (!hasWidth) {

            cx = cFrame.x;
            const dis = originParentFrame.width - (cFrame.x + cFrame.width);
            cw = parentFrame.width - dis - cx;
        }
    }
    else if (hasLeft) {
        cx = cFrame.x;
    }
    else if (hasRight) {
        cx = frame.x;
        const dis = originParentFrame.width - (cFrame.x + cFrame.width);
        cw = parentFrame.width - dis - cx;
    }
    // else if (hasWidth) {
    //     // 居中
    //     cx += (frame.width - cFrame.width) / 2;
    // }

    // 垂直
    const hasHeight = ResizingConstraints.hasHeight(resizingConstraint);
    const hasTop = ResizingConstraints.hasTop(resizingConstraint);
    const hasBottom = ResizingConstraints.hasBottom(resizingConstraint);
    // 计算height, y
    let ch = frame.height;
    let cy = frame.y;
    if (hasTop && hasBottom) {
        if (!hasHeight) {

            cy = cFrame.y;
            const dis = originParentFrame.height - (cFrame.y + cFrame.height);
            ch = parentFrame.height - dis - cy;
        }
    }
    else if (hasTop) {
        cy = cFrame.y;
    }
    else if (hasBottom) {
        cy = frame.y;
        const dis = originParentFrame.height - (cFrame.y + cFrame.height);
        ch = parentFrame.height - dis - cy;
    }
    // else if (hasHeight) {
    //     // 居中
    //     cy += (frame.height - cFrame.height) / 2;
    // }

    frame.x = cx;
    frame.y = cy;
    frame.width = cw;
    frame.height = ch;
}

export function matrix2parent(x: number, y: number, width: number, height: number, rotate: number, hflip: boolean, vflip: boolean) {
    const m = new Matrix();
    if (rotate || hflip || vflip) {
        const cx = width / 2;
        const cy = height / 2;
        m.trans(-cx, -cy);
        if (rotate) m.rotate(rotate / 360 * 2 * Math.PI);
        if (hflip) m.flipHoriz();
        if (vflip) m.flipVert();
        m.trans(cx, cy);
    }
    m.trans(x, y);
    return m;
}

export function boundingBox(m: Matrix, frame: ShapeFrame, path: Path): ShapeFrame {
    // const path = this.getPath();
    if (path.length > 0) {
        path.transform(m);
        const bounds = path.calcBounds();
        return new ShapeFrame(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    }

    // const frame = this.frame;
    const corners = [{ x: 0, y: 0 }, { x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }]
        .map((p) => m.computeCoord(p));
    const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
    const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
    const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
    const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}

export class ShapeDom extends VDom {

    m_fills?: EL[];
    m_borders?: EL[];
    m_path?: string;

    m_frame: ShapeFrame = new ShapeFrame(0, 0, 0, 0);
    m_hflip?: boolean;
    m_vflip?: boolean;
    m_rotate?: number;
    m_fixedRadius?: number;

    onDataChange(...args: any[]): void {
        if (args.includes('points')) this.m_path = undefined;
        if (args.includes('fills')) this.m_fills = undefined;
        if (args.includes('borders')) this.m_borders = undefined;
    }

    private _findOV(ot: OverrideType, vt: VariableType): Variable | undefined {
        if (!this.m_varsContainer) return;
        const _vars = findOverrideAndVar(this.m_data, ot, this.m_varsContainer);
        if (!_vars) return;
        const _var = _vars[_vars.length - 1];
        if (_var && _var.type === vt) {
            return _var;
        }
    }

    getFrame() {
        return this.m_frame;
    }

    isNoTransform() {
        return !this.m_hflip && !this.m_vflip && !this.m_rotate;
    }

    getFills() {
        const v = this._findOV(OverrideType.Fills, VariableType.Fills);
        return v ? v.value : this.m_data.style.fills;
    }

    getBorders() {
        const v = this._findOV(OverrideType.Borders, VariableType.Borders);
        return v ? v.value : this.m_data.style.borders;
    }

    getShadows() {
        const v = this._findOV(OverrideType.Shadows, VariableType.Shadows);
        return v? v.value : this.m_data.style.shadows;
    }

    getPath() {
        if (this.m_path) return this.m_path;
        this.m_path = this.m_data.getPathOfFrame(this.m_frame, this.m_fixedRadius).toString(); // todo fixedRadius
        return this.m_path;
    }

    isVisible(): boolean {
        const v = this._findOV(OverrideType.Visible, VariableType.Visible);
        return v ? v.value : !!this.m_data.isVisible;
    }

    isLocked(): boolean {
        const v = this._findOV(OverrideType.Lock, VariableType.Lock);
        return v? v.value :!!this.m_data.isLocked;
    }

    prepare() {
        // prepare path
        // prepare frame
    }

    // update
    updateRenderArgs(frame: ShapeFrame, hflip: boolean | undefined, vflip: boolean | undefined, rotate: number | undefined, radius?: number) {
        if (isDiffShapeFrame(this.m_frame, frame)) {
            this.m_frame.x = frame.x;
            this.m_frame.y = frame.y;
            this.m_frame.width = frame.width;
            this.m_frame.height = frame.height;
            this.m_path = undefined; // need update
            if (this.m_borders) {
                recycleELArr(this.m_borders);
                this.m_borders = undefined;
            }
            if (this.m_fills) {
                recycleELArr(this.m_fills);
                this.m_fills = undefined;
            }
        }
        this.m_hflip = hflip;
        this.m_vflip = vflip;
        this.m_rotate = rotate;
        if ((this.m_fixedRadius || 0) !== (radius || 0)) {
            this.m_fixedRadius = radius;
            this.m_path = undefined; // need update
            if (this.m_borders) {
                recycleELArr(this.m_borders);
                this.m_borders = undefined;
            }
            if (this.m_fills) {
                recycleELArr(this.m_fills);
                this.m_fills = undefined;
            }
        }
    }

}