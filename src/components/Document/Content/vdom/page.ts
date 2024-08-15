import { EL, PageView, PropsType, ShapeView } from "@kcdesign/data";
import { elpatch } from "./patch";
import { DomCtx } from "./domctx";
import { NodeType, OPTI_NODE_COUNT, optiNode } from "./optinode";


function intersect_range(lx0: number, lx1: number, rx0: number, rx1: number): boolean {
    return lx0 < rx1 && lx1 > rx0;
}

type Rect = { x: number, y: number, width: number, height: number };

function intersect_rect(lhs: Rect, rhs: Rect): boolean {
    return intersect_range(lhs.x, lhs.x + lhs.width, rhs.x, rhs.x + rhs.width) &&
        intersect_range(lhs.y, lhs.y + lhs.height, rhs.y, rhs.y + rhs.height);
}
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
    private optimizeClientVisibleNodes() {
        if (!this.m_visible_rect) return false;

        const frame_time = 40;
        const startTime = Date.now();
        const client_visible_rect = this.client_visible_rect;
        const client_drop_rect = this.client_drop_rect;
        const ctx = this.m_ctx as DomCtx;
        const focusid = ctx.getFocusLevel1Id() ?? this.m_last_focusid;
        if (focusid) this.m_last_focusid = focusid;

        for (let i = 0, len = this.m_children.length; i < len; i++) {
            const c = this.m_children[i] as (ShapeView & NodeType);
            if (c.hasOptiNode) {
                if (!(intersect_rect(c._p_visibleFrame, client_drop_rect))) {
                    optiNode(c, false, false, 0);
                } else if (intersect_rect(c._p_visibleFrame, client_visible_rect)) {
                    optiNode(c, true, c.id === focusid, 0);
                } else {
                    continue;
                }
                const endTime = Date.now();
                if (endTime - startTime > frame_time) {
                    return true;
                }
            }
        }
        return false;
    }

    m_optimize: boolean = false;
    m_last_focusid: string | undefined;
    // m_first_bind: boolean = false;

    onBeforeRender() {

        if (!this.m_optimize || !this.m_visible_rect) {
            return;
        }

        const ctx = this.m_ctx as DomCtx;
        const focusid = ctx.getFocusLevel1Id();
        for (let i = 0, len = this.m_children.length; i < len; i++) {
            const c = this.m_children[i] as (ShapeView & NodeType);
            if (c.hasOptiNode && c.id === focusid) {
                const client_visible_rect = this.client_visible_rect;
                if (intersect_rect(c._p_visibleFrame, client_visible_rect)) {
                    optiNode(c, true, true, 0);
                }
                break;
            }
        }

    }

    onRenderIdle(): boolean {

        if (!this.m_optimize && this.nodeCount > OPTI_NODE_COUNT) {
            this.m_optimize = true;
        }

        if (this.m_optimize && this.optimizeClientVisibleNodes()) {
            return true;
        }
        this.emit('renderidle')
        return false;

    }
}