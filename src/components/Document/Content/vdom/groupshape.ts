import { GroupShape, Matrix, Path, RenderTransform, ResizingConstraints, Shape, ShapeFrame, ShapeType, innerShadowId, renderBorders, renderFills, renderShadows } from "@kcdesign/data";
import { ShapeDom } from "./shape";
// import comsMap from "./comsmap";
import { boundingBox, fixFrameByConstrain, isDiffRenderTransform, isDiffVarsContainer, isNoTransform, matrix2parent } from "./shape";
import { PropsType, VDom, VarsContainer } from "./basic";
import { EL, elh, elpatch } from "./el";

export class GroupShapeDom extends ShapeDom {

    renderChilds(): VDom[] {
        const childs = this.m_children;
        const ret: VDom[] = [];
        childs.forEach((c) => {
            const r = c.render();
            if (r) ret.push(c);
        })
        return ret;
    }

    m_save_fills?: EL[];
    m_save_borders?: EL[];
    m_save_shadows?: EL[];
    // m_save_childs?: VDom[]; // 尽量复用
    m_save_props: any;

    protected renderFills() {
        if (!this.m_fills && this.m_path) {
            this.m_fills = renderFills(elh, this.getFills(), this.m_frame, this.m_path);
        }
        return this.m_fills;
    }

    protected renderBorders() {
        if (!this.m_borders && this.m_path) {
            this.m_borders = renderBorders(elh, this.getBorders(), this.m_frame, this.m_path);
        }
        return this.m_borders;
    }

    protected renderProps() {
        const shape = this.m_data;
        const frame = this.m_frame;
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

    updateChild(child: Shape, idx: number, transx: RenderTransform, varsContainer: VarsContainer, resue: Map<string, VDom>) {
        let cdom: VDom | undefined = resue.get(child.id);
        if (!cdom) {
            const comsMap = this.m_ctx.comsMap;
            const Com = comsMap.get(child.type) || comsMap.get(ShapeType.Rectangle)!;
            cdom = new Com(this.m_ctx, { data: child, transx, varsContainer });
            this.addChild(cdom, idx);
            return;
        }
        this.moveChild(cdom, idx);
        cdom.update({ data: child, transx, varsContainer });
    }

    update(props: PropsType) {

        if (props.data.id !== this.m_data.id) throw new Error('id not match');
        let tid = this.id();
        this.m_ctx.datachangeset.delete(tid); // remove from changeset

        // check
        const diffTransform = isDiffRenderTransform(props.transx, this.m_transx);
        const diffVars = isDiffVarsContainer(props.varsContainer, this.m_varsContainer);
        if (!diffTransform &&
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
        const varsContainer = props.varsContainer;

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

        let nodes: Array<any>;
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

            const resue: Map<string, VDom> = new Map();
            this.m_children.forEach((c) => resue.set(c.data().id, c));
            nodes = [];
            for (let i = 0, len = shape.childs.length; i < len; i++) {
                const cc = shape.childs[i]

                const transform = {
                    dx: 0,
                    dy: 0,
                    scaleX: cscaleX,
                    scaleY: cscaleY,
                    parentFrame,
                    vflip: false,
                    hflip: false,
                    rotate: 0
                }

                // update childs
                this.updateChild(cc, i, transform, varsContainer!, resue);
                // const com = comsMap.get(cc.type) || comsMap.get(ShapeType.Rectangle);
                // const node = h(com, { data: cc, key: cc.id, transx: transform, varsContainer });
                // nodes.push(node);
            }
            // 删除多余的
            this.removeChilds(shape.childs.length, Number.MAX_VALUE).forEach((c => c.destory()));
            // update frame, hflip, vflip, rotate
            this.updateRenderArgs(parentFrame, hflip, vflip, rotate);

            return;
            // return { nodes, frame: parentFrame, notTrans, hflip, vflip, rotate };
        }

        // cur frame
        frame = new ShapeFrame(x, y, width, height);
        // matrix2parent
        const m = matrix2parent(x, y, width, height, rotate, hflip, vflip);
        // bounds
        const bbox = boundingBox(m, frame, new Path());
        // todo 要变换points

        const parentFrame = new ShapeFrame(bbox.x * scaleX, bbox.y * scaleY, bbox.width * scaleX, bbox.height * scaleY);
        fixFrameByConstrain(shape, transform.parentFrame, parentFrame); // 左上右下
        const cscaleX = parentFrame.width / bbox.width;
        const cscaleY = parentFrame.height / bbox.height;

        const resue: Map<string, VDom> = new Map();
        this.m_children.forEach((c) => resue.set(c.data().id, c));
        nodes = [];
        for (let i = 0, len = shape.childs.length; i < len; i++) { //摆正： 将旋转、翻转放入到子对象
            const cc = shape.childs[i]
            const m1 = cc.matrix2Parent();
            m1.multiAtLeft(m);
            const target = m1.computeCoord(0, 0);

            const c_rotate = rotate + (cc.rotation || 0);
            const c_hflip = hflip ? !cc.isFlippedHorizontal : !!cc.isFlippedHorizontal;
            const c_vflip = vflip ? !cc.isFlippedVertical : !!cc.isFlippedVertical;
            const c_frame = cc.frame;
            // cc matrix2Parent
            const m2 = matrix2parent(c_frame.x, c_frame.y, c_frame.width, c_frame.height, c_rotate, c_hflip, c_vflip);

            m2.trans(bbox.x, bbox.y); // todo 使用parentFrame.x y会与rect对不齐，待研究
            const cur = m2.computeCoord(0, 0);

            const dx = target.x - cur.x;
            const dy = target.y - cur.y;

            const transform = {
                dx,
                dy,
                scaleX: cscaleX,
                scaleY: cscaleY,
                parentFrame: parentFrame,
                vflip,
                hflip,
                rotate
            }

            // update childs
            this.updateChild(cc, i, transform, varsContainer!, resue);
            // const com = comsMap.get(cc.type) || comsMap.get(ShapeType.Rectangle);
            // const node = h(com, { data: cc, key: cc.id, transx: transform, varsContainer });
            // nodes.push(node);
        }
        // 删除多余的
        this.removeChilds(shape.childs.length, Number.MAX_VALUE).forEach((c => c.destory()));

        // update frame, rotate, hflip...
        this.updateRenderArgs(parentFrame, undefined, undefined, undefined);

        // frame = parentFrame;
        // rotate = 0;
        // hflip = false;
        // vflip = false;
        // notTrans = true;

        this.notify("update");
    }

    // 先update再render

    render(): HTMLElement | undefined {
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
            this.m_el = document.createElement("g", props);
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
                    this.m_el.setAttribute(key, cv);
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