import { VariableType, OverrideType, Variable, ShapeFrame, RenderTransform, SymbolRefShape, SymbolShape, Shape, renderFills, renderBorders, CurvePoint, Point2D } from "@kcdesign/data";
import { PropsType, VDom, VDomCtx, findOverrideAndVar, stringh } from "./basic";
import { Matrix, Path, ResizingConstraints } from "@kcdesign/data";
import { EL, createElement, elh, elpatch, recycleELArr, setAttribute } from "./el";

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


export function transformPoints(points: CurvePoint[], matrix: Matrix) {
    const ret: CurvePoint[] = [];
    for (let i = 0, len = points.length; i < len; i++) {
        const p = points[i];
        const point: Point2D = matrix.computeCoord(p.x, p.y) as Point2D;
        const transp = new CurvePoint("", point.x, point.y, p.mode);

        if (p.hasFrom) {
            transp.hasFrom = true;
            const fromp = matrix.computeCoord(p.fromX || 0, p.fromY || 0);
            transp.fromX = fromp.x;
            transp.fromY = fromp.y;
        }
        if (p.hasTo) {
            transp.hasTo = true;
            const top = matrix.computeCoord(p.toX || 0, p.toY || 0);
            transp.toX = top.x;
            transp.toY = top.y;
        }

        ret.push(transp);
    }
    return ret;
}

export class ShapeDom extends VDom {

    m_fills?: EL[];
    m_borders?: EL[];
    m_path?: string;

    m_frame?: ShapeFrame;
    m_hflip?: boolean;
    m_vflip?: boolean;
    m_rotate?: number;
    m_fixedRadius?: number;

    onCreate(): void {
        this.m_frame = new ShapeFrame(0, 0, 0, 0);
    }

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
        return this.m_frame!;
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
        return v ? v.value : this.m_data.style.shadows;
    }

    getPath() {
        if (this.m_path) return this.m_path;
        this.m_path = this.m_data.getPathOfFrame(this.getFrame(), this.m_fixedRadius).toString(); // todo fixedRadius
        return this.m_path;
    }

    isVisible(): boolean {
        const v = this._findOV(OverrideType.Visible, VariableType.Visible);
        return v ? v.value : !!this.m_data.isVisible;
    }

    isLocked(): boolean {
        const v = this._findOV(OverrideType.Lock, VariableType.Lock);
        return v ? v.value : !!this.m_data.isLocked;
    }

    prepare() {
        // prepare path
        // prepare frame
    }

    // =================== update ========================
    updateRenderArgs(frame: ShapeFrame, hflip: boolean | undefined, vflip: boolean | undefined, rotate: number | undefined, radius?: number) {
        const _frame = this.getFrame();
        if (isDiffShapeFrame(_frame, frame)) {
            _frame.x = frame.x;
            _frame.y = frame.y;
            _frame.width = frame.width;
            _frame.height = frame.height;
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

    updateRectangle(scaleX: number, scaleY: number) {

    }
    updateDiamond(scaleX: number, scaleY: number, rotate: number, vflip: boolean, hflip: boolean, bbox: ShapeFrame, m: Matrix) {

    }

    update(props: PropsType, force?: boolean) {

        if (props.data.id !== this.m_data.id) throw new Error('id not match');
        let tid = this.id();
        this.m_ctx.datachangeset.delete(tid); // remove from changeset

        // check
        const diffTransform = isDiffRenderTransform(props.transx, this.m_transx);
        const diffVars = isDiffVarsContainer(props.varsContainer, this.m_varsContainer);
        if (!force &&
            !diffTransform &&
            !diffVars) {
            return;
        }

        this.m_ctx.dirtyset.set(tid, this);

        if (diffTransform) {
            // update transform
            this.m_transx = props.transx;
        }
        if (diffVars) {
            // update varscontainer
            this.m_varsContainer = props.varsContainer;
            const _id = this.id();
            if (_id !== tid) {
                this.m_ctx.dirtyset.delete(tid);
                tid = _id;
            }
        }
        // add to dirty
        this.m_ctx.dirtyset.set(tid, this);

        const shape = this.m_data;
        const transform = props.transx;
        // const varsContainer = props.varsContainer;

        const _frame = shape.frame;
        let x = _frame.x;
        let y = _frame.y;
        let width = _frame.width;
        let height = _frame.height;
        let rotate = (shape.rotation ?? 0);
        let hflip = !!shape.isFlippedHorizontal;
        let vflip = !!shape.isFlippedVertical;
        let frame = _frame;

        let notTrans = isNoTransform(transform);

        // let nodes: Array<any>;
        if (!transform || notTrans) {

            // update frame, hflip, vflip, rotate
            this.updateRenderArgs(frame, hflip, vflip, rotate);

            return;
        }

        // 这些是parent的属性！
        x += transform.dx;
        y += transform.dy;
        rotate += transform.rotate;
        hflip = transform.hflip ? !hflip : hflip;
        vflip = transform.vflip ? !vflip : vflip;
        const scaleX = transform.scaleX;
        const scaleY = transform.scaleY;

        const resizingConstraint = shape.resizingConstraint;
        if (!rotate ||
            resizingConstraint &&
            (ResizingConstraints.hasWidth(resizingConstraint) ||
                ResizingConstraints.hasHeight(resizingConstraint))) {

            const saveW = width;
            const saveH = height;
            if (resizingConstraint &&
                (ResizingConstraints.hasWidth(resizingConstraint) ||
                    ResizingConstraints.hasHeight(resizingConstraint))) {

                const fixWidth = ResizingConstraints.hasWidth(resizingConstraint);
                const fixHeight = ResizingConstraints.hasHeight(resizingConstraint);

                if (fixWidth && fixHeight) {
                    // 不需要缩放，但要调整位置
                    x *= scaleX;
                    y *= scaleY;
                    // 居中
                    x += (width * (scaleX - 1)) / 2;
                    y += (height * (scaleY - 1)) / 2;
                } else if (rotate) {
                    const m = new Matrix();
                    m.rotate(rotate / 360 * 2 * Math.PI);
                    m.scale(scaleX, scaleY);
                    const _newscale = m.computeRef(1, 1);
                    m.scale(1 / scaleX, 1 / scaleY);
                    const newscale = m.inverseRef(_newscale.x, _newscale.y);
                    x *= scaleX;
                    y *= scaleY;

                    if (fixWidth) {
                        x += (width * (newscale.x - 1)) / 2;
                        newscale.x = 1;
                    } else {
                        y += (height * (newscale.y - 1)) / 2;
                        newscale.y = 1;
                    }
                    width *= newscale.x;
                    height *= newscale.y;
                } else {
                    const newscaleX = fixWidth ? 1 : scaleX;
                    const newscaleY = fixHeight ? 1 : scaleY;
                    x *= scaleX;
                    y *= scaleY;
                    if (fixWidth) x += (width * (scaleX - 1)) / 2;
                    if (fixHeight) y += (height * (scaleY - 1)) / 2;
                    width *= newscaleX;
                    height *= newscaleY;
                }
            } else {
                x *= scaleX;
                y *= scaleY;
                width *= scaleX;
                height *= scaleY;
            }

            const parentFrame = new ShapeFrame(x, y, width, height);
            fixFrameByConstrain(shape, transform.parentFrame, parentFrame);

            const cscaleX = parentFrame.width / saveW;
            const cscaleY = parentFrame.height / saveH;

            // update frame, hflip, vflip, rotate
            this.updateRenderArgs(parentFrame, hflip, vflip, rotate);
            this.updateRectangle(cscaleX, cscaleY);

            return;
        }

        // cur frame
        frame = new ShapeFrame(x, y, width, height);
        // matrix2parent
        const m = matrix2parent(x, y, width, height, rotate, hflip, vflip);
        // bounds
        const bbox = boundingBox(m, frame, shape.getPathOfFrame(frame));
        // todo 要变换points

        const parentFrame = new ShapeFrame(bbox.x * scaleX, bbox.y * scaleY, bbox.width * scaleX, bbox.height * scaleY);
        fixFrameByConstrain(shape, transform.parentFrame, parentFrame); // 左上右下
        const cscaleX = parentFrame.width / bbox.width;
        const cscaleY = parentFrame.height / bbox.height;

        // const resue: Map<string, VDom> = new Map();
        // this.m_children.forEach((c) => resue.set(c.data().id, c));
        // nodes = [];
        // for (let i = 0, len = shape.childs.length; i < len; i++) { //摆正： 将旋转、翻转放入到子对象
        //     const cc = shape.childs[i]
        //     const m1 = cc.matrix2Parent();
        //     m1.multiAtLeft(m);
        //     const target = m1.computeCoord(0, 0);
        //     const c_rotate = rotate + (cc.rotation || 0);
        //     const c_hflip = hflip ? !cc.isFlippedHorizontal : !!cc.isFlippedHorizontal;
        //     const c_vflip = vflip ? !cc.isFlippedVertical : !!cc.isFlippedVertical;
        //     const c_frame = cc.frame;
        //     // cc matrix2Parent
        //     const m2 = matrix2parent(c_frame.x, c_frame.y, c_frame.width, c_frame.height, c_rotate, c_hflip, c_vflip);
        //     m2.trans(bbox.x, bbox.y); // todo 使用parentFrame.x y会与rect对不齐，待研究
        //     const cur = m2.computeCoord(0, 0);
        //     const dx = target.x - cur.x;
        //     const dy = target.y - cur.y;
        //     const transform = {
        //         dx,
        //         dy,
        //         scaleX: cscaleX,
        //         scaleY: cscaleY,
        //         parentFrame: parentFrame,
        //         vflip,
        //         hflip,
        //         rotate
        //     }
        //     // update childs
        //     this.updateChild(cc, i, transform, varsContainer!, resue);
        // }
        // // 删除多余的
        // this.removeChilds(shape.childs.length, Number.MAX_VALUE).forEach((c => c.destory()));

        // update frame, rotate, hflip...
        this.updateRenderArgs(parentFrame, undefined, undefined, undefined);

        this.updateDiamond(cscaleX, cscaleY, rotate, vflip, hflip, bbox, m);

        this.notify("update");
    }



    // ================== render ===========================

    m_save_fills?: EL[];
    m_save_borders?: EL[];
    m_save_shadows?: EL[];
    // m_save_childs?: VDom[]; // 尽量复用
    m_save_props: any;

    protected renderFills() {
        if (!this.m_fills) {

            this.m_fills = renderFills(elh, this.getFills(), this.getFrame(), this.getPath());
        }
        return this.m_fills;
    }

    protected renderBorders() {
        if (!this.m_borders) {
            this.m_borders = renderBorders(elh, this.getBorders(), this.getFrame(), this.getPath());
        }
        return this.m_borders;
    }

    protected renderProps() {
        const shape = this.m_data;
        const frame = this.getFrame();
        // const path = this.getPath(); // cache
        const props: any = {}

        const contextSettings = shape.style.contextSettings;
        if (contextSettings && (contextSettings.opacity ?? 1) !== 1) {
            props.opacity = contextSettings.opacity;
        }

        if (this.isNoTransform()) {
            props.transform = `translate(${frame.x},${frame.y})`
        } else {
            const cx = frame.x + frame.width / 2;
            const cy = frame.y + frame.height / 2;
            const style: any = {}
            style.transform = "translate(" + cx + "px," + cy + "px) "
            if (this.m_hflip) style.transform += "rotateY(180deg) "
            if (this.m_vflip) style.transform += "rotateX(180deg) "
            if (this.m_rotate) style.transform += "rotate(" + this.m_rotate + "deg) "
            style.transform += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
            props.style = style;
        }
        return props;
    }
    renderChilds(): VDom[] {
        // throw new Error("not implemented");
        return [];
    }

    // 先update再render
    render(): HTMLElement | SVGElement | undefined {
        const tid = this.id();
        const isDirty = this.m_ctx.dirtyset.delete(tid);
        if (!this.isVisible()) {
            return;
        }
        if (!isDirty && this.m_el) { // ?? 怎么兼容在data端导出svg?? 自定义h方法
            return this.m_el;
        }

        // const shape = this.m_data;
        // const frame = this.m_frame;
        // const path = this.getPath(); // cache

        // fill
        const fills = this.renderFills() || []; // cache
        // childs
        const childs = this.renderChilds(); // VDomArray
        // border
        const borders = this.renderBorders() || []; // ELArray

        const props = this.renderProps();

        // shadows todo
        // const shadows = this.getShadows();
        // const shape_id = shape.id.slice(0, 4);
        // const shadow = renderShadows(elh, shape_id, shadows, this.getBorders(), path, shape, this.m_varsContainer, comsMap); // todo!
        // if (shadow.length) {
        //     const ex_props = Object.assign({}, props);
        //     delete props.style;
        //     delete props.transform;
        //     const inner_url = innerShadowId(shape_id, shadows);
        //     if (shadows.length) props.filter = `${inner_url}`;
        //     const body = h("g", props, childs);
        //     return h("g", ex_props, [...shadow, body]);
        // } else {
        //     return h("g", props, childs);
        // }

        if (!this.m_el) {
            const el = createElement("g");
            Object.keys(props).forEach((key) => {
                setAttribute(el, key, props[key]);
            });
            this.m_el = el;
        }
        else {
            const saveprops = this.m_save_props || {};
            const nkeys = Object.keys(props);
            const okeys = Object.keys(saveprops);
            for (let i = 0; i < nkeys.length; i++) {
                const key = nkeys[i];
                const ov = saveprops[key];
                const cv = props[key];
                if (ov !== cv) {
                    setAttribute(this.m_el, key, cv);
                }
            }
            for (let i = 0; i < okeys.length; i++) {
                const key = okeys[i];
                if (nkeys.indexOf(key) < 0) {
                    this.m_el.removeAttribute(key);
                }
            }
        }
        this.m_save_props = props;

        // update
        let nodeIdx = 0;
        if (this.m_save_fills === fills) {
            // no change
            nodeIdx += fills.length;
        } else {
            const _fills = [];
            const _savefills = this.m_save_fills || [];
            for (let i = 0; i < fills.length; i++) {
                const fill = fills[i];
                _fills.push(elpatch(_savefills[i], fill))
            }

            // patch
            for (let i = 0; i < _fills.length; i++) {
                const el = _fills[i].el!;
                const n = this.m_el.childNodes[nodeIdx];
                if (n !== el) {
                    if (n) this.m_el.insertBefore(el, n);
                    else this.m_el.appendChild(el);
                }
                nodeIdx++;
            }
            this.m_save_fills = _fills;
            this.m_fills = _fills; // 新render出来的
        }

        // patch childs
        {
            for (let i = 0; i < childs.length; i++) {
                const el = childs[i].m_el!;
                const n = this.m_el.childNodes[nodeIdx];
                if (n !== el) {
                    if (n) this.m_el.insertBefore(el, n);
                    else this.m_el.appendChild(el);
                }
                nodeIdx++;
            }
        }

        // patch borders
        if (this.m_save_borders === borders) {
            // no change
            nodeIdx += borders.length;
        } else {
            const _borders = [];
            const _saveborders = this.m_save_borders || [];
            for (let i = 0; i < borders.length; i++) {
                const fill = borders[i];
                _borders.push(elpatch(_saveborders[i], fill))
            }

            // patch
            for (let i = 0; i < _borders.length; i++) {
                const el = _borders[i].el!;
                const n = this.m_el.childNodes[nodeIdx];
                if (n !== el) {
                    if (n) this.m_el.insertBefore(el, n);
                    else this.m_el.appendChild(el);
                }
                nodeIdx++;
            }
            this.m_save_borders = _borders;
            this.m_borders = _borders;
        }

        return this.m_el;
    }
}