import { EL, objectId, PageView, PropsType, ShapeView } from "@kcdesign/data";
import { elpatch } from "./patch";
import { DomCtx } from "./domctx";
import { NodeType, opti2none, OPTI_NODE_COUNT, optiNode, unOptiNode } from "./optinode";


function intersect_range(lx0: number, lx1: number, rx0: number, rx1: number): boolean {
    return lx0 < rx1 && lx1 > rx0;
}

type Rect = { x: number, y: number, width: number, height: number };

function intersect_rect(lhs: Rect, rhs: Rect): boolean {
    return intersect_range(lhs.x, lhs.x + lhs.width, rhs.x, rhs.x + rhs.width) &&
        intersect_range(lhs.y, lhs.y + lhs.height, rhs.y, rhs.y + rhs.height);
}

const frame_time = 40;

export class PageDom extends (PageView) {

    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    constructor(ctx: DomCtx, props: PropsType) {
        super(ctx, props);
        this.onRenderIdle = this.onRenderIdle.bind(this);
        this.onBeforeRender = this.onBeforeRender.bind(this);
        ctx.setBeforeRenderCallback(this.onBeforeRender);
        ctx.setIdleCallback(this.onRenderIdle);
    }

    bind(node: HTMLElement | SVGElement /* old, for reuse */) { // 
        if (this.el) throw new Error("already binded");
        this.el = node;
        // this.m_first_bind = true;
    }

    unbind() {
        this.m_save_version = -1;
        this.m_save_render.reset("");
        this.el = undefined;
        // todo 考虑不释放，切换页面就很快
        // const ub = (el: EL) => {
        //     delete (el as any).el;
        //     if (Array.isArray(el.elchilds)) el.elchilds.forEach((el) => ub(el));
        // }
        // ub(this as any);
    }

    // protected checkAndResetDirty(): boolean {
    //     if (super.checkAndResetDirty()) return true;
    //     return this.m_save_version < 0;
    // }

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version || !this.el) {
            elpatch(this, this.m_save_render);
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
            this.m_save_render.el = this.el;
        }
        return version;
    }

    // 在缩放、移动内容、可见窗口大小改变时，增加删除节点
    m_visible_rect?: Rect;

    updateVisibleRect(visibleRect: { x: number, y: number, width: number, height: number }) {
        if (!this.m_visible_rect) this.m_visible_rect = { x: 0, y: 0, width: 0, height: 0 }
        this.m_visible_rect.x = visibleRect.x;
        this.m_visible_rect.y = visibleRect.y;
        this.m_visible_rect.width = visibleRect.width;
        this.m_visible_rect.height = visibleRect.height;
        this.m_ctx.continueLoop();
    }

    private get client_visible_rect(): Rect {
        if (!this.m_visible_rect) throw new Error();
        const visible_rect = this.m_visible_rect;
        const extend = Math.round(Math.max(100, Math.max(visible_rect.width, visible_rect.height) * 0.4));
        const client_visible_rect = {} as Rect;
        client_visible_rect.x = visible_rect.x - extend;
        client_visible_rect.y = visible_rect.y - extend;
        client_visible_rect.width = visible_rect.width + extend * 2;
        client_visible_rect.height = visible_rect.height + extend * 2;
        return client_visible_rect;
    }

    private get client_drop_rect(): Rect {
        if (!this.m_visible_rect) throw new Error();
        const visible_rect = this.m_visible_rect;
        const dropextend = Math.round(Math.max(500, Math.max(visible_rect.width, visible_rect.height) * 1.0));
        const client_drop_rect = {} as Rect;
        client_drop_rect.x = visible_rect.x - dropextend;
        client_drop_rect.y = visible_rect.y - dropextend;
        client_drop_rect.width = visible_rect.width + dropextend * 2;
        client_drop_rect.height = visible_rect.height + dropextend * 2;
        return client_drop_rect;
    }

    // 可见区域+20%绘制
    // 可见区域+50%以外drop
    private _optimizeClientVisibleNodes(node: (ShapeView & NodeType), startTime: number, client_visible_rect: Rect, client_drop_rect: Rect, optimize: number[], level: number, focusid: { [key: number]: true }): { expired: boolean, hasOptimizing: boolean } {
        if (!this.m_optimize) throw new Error();

        let hasOptimizing = false;
        const optiNodes: (ShapeView & NodeType)[] = [];
        let optiNodesCount = 0;

        for (let i = 0, len = this.m_children.length; i < len; i++) {
            const c = this.m_children[i] as (ShapeView & NodeType);
            if (!c.isVisible) {
                unOptiNode(c);
            } else if (c.canOptiNode) {

                if (!(intersect_rect(c._p_visibleFrame, client_drop_rect))) {
                    opti2none(c);// 这个是优化隐藏

                    const id = objectId(c);
                    optimize.push(id);
                    this.m_optimize.set(id, { node: c });

                } else if (intersect_rect(c._p_visibleFrame, client_visible_rect)) {

                    optiNodesCount += c.nodeCount;
                    optiNodes.push(c);
                }

            }
        }

        if (level > 0 || optiNodesCount > OPTI_NODE_COUNT) { // 当前节点大量不可见时，直接用svg


            for (let i = 0, len = optiNodes.length; i < len; ++i) {

                // todo 深入子节点
                // todo 当前节点大量不可见时，不用canvas 1
                // 当前缩放，用于计算canvas大小
                // 
                // todo 异步canvas 1
                const c = optiNodes[i];

                if (c.nodeCount > OPTI_NODE_COUNT) {
                    // 
                    const transform = c.transform.inverse;
                    const vlt = transform.computeCoord(client_visible_rect);
                    const vrb = transform.computeCoord(client_visible_rect.x + client_visible_rect.width, client_visible_rect.y + client_visible_rect.height);
                    const vx = Math.min(vlt.x, vrb.x);
                    const vy = Math.min(vlt.y, vrb.y);
                    const vw = Math.max(vlt.x, vrb.x) - vx;
                    const vh = Math.max(vlt.y, vrb.y) - vy;
                    const dlt = transform.computeCoord(client_drop_rect);
                    const drb = transform.computeCoord(client_drop_rect.x + client_drop_rect.width, client_drop_rect.y + client_drop_rect.height);
                    const dx = Math.min(dlt.x, drb.x);
                    const dy = Math.min(dlt.y, drb.y);
                    const dw = Math.max(dlt.x, drb.x) - dx;
                    const dh = Math.max(dlt.y, drb.y) - dy;

                    const ret = this._optimizeClientVisibleNodes(c, startTime, { x: vx, y: vy, width: vw, height: vh }, { x: dx, y: dy, width: dw, height: dh }, optimize, level + 1, focusid);

                    hasOptimizing = hasOptimizing || ret.hasOptimizing;
                    if (ret.expired) {
                        return { expired: true, hasOptimizing };
                    }
                    continue;
                }

                const id = objectId(c);
                const pre = this.m_optimize.get(id);
                const ret = optiNode(c, true, focusid[id], pre?.image);

                if (ret !== false) {
                    optimize.push(id);
                    if (ret === true) {
                        this.m_optimize.set(id, { node: c });
                    } else {
                        this.m_optimize.set(id, { node: c, image: ret });
                        hasOptimizing = true;
                    }

                    const endTime = Date.now();
                    if (endTime - startTime > frame_time) {
                        return { expired: true, hasOptimizing }
                    }
                }
            }
        }
        return { expired: false, hasOptimizing };
    }

    canOptiNode: boolean = true;
// todo 图片更新还有问题
    private optimizeClientVisibleNodes() {
        if (!this.m_visible_rect || !this.m_optimize) return false;

        const client_visible_rect = this.client_visible_rect;
        const client_drop_rect = this.client_drop_rect;

        const optimize: number[] = [];

        // const startTime = Date.now();
        const ctx = this.m_ctx as DomCtx;

        const focusshape = ctx.getFocusShape();
        const focusid: { [key: number]: true } = {};
        {
            let p = focusshape;
            while (p) {
                focusid[objectId(p)] = true;
                p = p.parent;
            }
        }

        const ret = this._optimizeClientVisibleNodes(this as (ShapeView & NodeType), Date.now(), client_visible_rect, client_drop_rect, optimize, 0, focusid)
        if (ret.expired) return true;

        // todo找差值，进行unopti
        if (optimize.length !== this.m_optimize.size) {

            const _opti = new Set(optimize);

            const unopti: (ShapeView & NodeType)[] = [];
            this.m_optimize.forEach(v => {
                if (_opti.has(objectId(v.node))) return;
                // unOptiNode(v.node);
                unopti.push(v.node);
            })

            for (let i = 0, len = unopti.length; i < len; ++i) {
                const n = unopti[i];
                unOptiNode(n);
                this.m_optimize.delete(objectId(n));
            }
        }

        return ret.hasOptimizing;
    }

    m_optimize?: Map<number, {
        node: ShapeView & NodeType, image?: {
            loaded: boolean,
            imageel: SVGImageElement
        }
    }>;

    onBeforeRender() {

        if (!this.m_optimize || !this.m_visible_rect) {
            return;
        }

        const ctx = this.m_ctx as DomCtx;
        const shape = ctx.getFocusShape(); // todo

        let p = shape;
        while (p) {
            const n = p as (ShapeView & NodeType);
            if (n.canOptiNode && n.optiel) {
                unOptiNode(n);
                this.m_optimize.delete(objectId(p));
                // break; // 正常只会有一个
            }
            p = p.parent;
        }
    }

    onRenderIdle(): boolean {

        if (!this.m_optimize && this.nodeCount > OPTI_NODE_COUNT) {
            this.m_optimize = new Map();
        }

        if (this.m_optimize && this.optimizeClientVisibleNodes()) {
            return true;
        }
        this.emit('renderidle')
        return false;

    }
}