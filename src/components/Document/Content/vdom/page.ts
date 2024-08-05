import { EL, PageView, PropsType, ShapeView } from "@kcdesign/data";
import { elpatch } from "./patch";
import { DomCtx } from "./domctx";
import { ArtboradDom } from "./artboard";
import { GroupShapeDom } from "./groupshape";

const MAX_NODE_SUPPORT = 5000;
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
        this.m_first_bind = true;
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
    m_client_visible_rect?: Rect;
    m_client_drop_rect?: Rect;
    // 可见区域+20%绘制
    // 可见区域+50%以外drop
    optimizeClientVisibleNodes(visibleRect: { x: number, y: number, width: number, height: number }) {
        const extend = Math.round(Math.max(100, Math.max(visibleRect.width, visibleRect.height) * 0.4));
        const dropextend = Math.round(Math.max(500, Math.max(visibleRect.width, visibleRect.height) * 1.0));
        if (!this.m_client_visible_rect || !this.m_client_drop_rect) {
            this.m_client_visible_rect = { x: 0, y: 0, width: 0, height: 0 }
            this.m_client_drop_rect = { x: 0, y: 0, width: 0, height: 0 }
        }

        this.m_client_visible_rect.x = visibleRect.x - extend;
        this.m_client_visible_rect.y = visibleRect.y - extend;
        this.m_client_visible_rect.width = visibleRect.width + extend * 2;
        this.m_client_visible_rect.height = visibleRect.height + extend * 2;

        this.m_client_drop_rect.x = visibleRect.x - dropextend;
        this.m_client_drop_rect.y = visibleRect.y - dropextend;
        this.m_client_drop_rect.width = visibleRect.width + dropextend * 2;
        this.m_client_drop_rect.height = visibleRect.height + dropextend * 2;

        // check patch
        // check drop

        for (let i = 0, len = this.m_children.length; i < len; i++) {
            const c = this.m_children[i];
            if (c instanceof ArtboradDom || c instanceof GroupShapeDom) {
                if (!(intersect_rect(c._p_visibleFrame, this.m_client_drop_rect))) c.dropNode();
                else if (intersect_rect(c._p_visibleFrame, this.m_client_visible_rect)) c.appendNode();
            }
        }
    }

    m_has_image: boolean = false;
    m_last_focusid: string | undefined;
    m_first_bind: boolean = false;

    onBeforeRender() {
        if (!this.m_has_image) {
            return;
        }
        if (this.nodeCount < MAX_NODE_SUPPORT / 2) {
            for (let i = 0, len = this.m_children.length; i < len; i++) {
                const c = this.m_children[i];
                if ((c instanceof ArtboradDom)) {
                    c.switchOutImage(true);
                }
            }
            this.m_has_image = false;
        } else {
            const ctx = this.m_ctx as DomCtx;
            const focusid = ctx.getFocusLevel1Id();
            for (let i = 0, len = this.m_children.length; i < len; i++) {
                const c = this.m_children[i];
                if ((c instanceof ArtboradDom) && c.id === focusid) {
                    c.switchOutImage(false);
                }
            }
        }
    }

    onRenderIdle(): boolean {
        if (this.nodeCount < MAX_NODE_SUPPORT) return false;
        this.m_has_image = true;
        // 将一些节点转换成image
        const ctx = this.m_ctx as DomCtx;
        const focusid = ctx.getFocusLevel1Id() ?? this.m_last_focusid;
        if (focusid) this.m_last_focusid = focusid;

        const frame_time = 40;
        const startTime = Date.now();

        const force = this.m_first_bind;
        this.m_first_bind = false;
        for (let i = 0, len = this.m_children.length; i < len; i++) {
            const c = this.m_children[i];
            if (c instanceof ArtboradDom && c.id !== focusid && c.switchIntoImage(force)) {
                const endTime = Date.now();
                if (endTime - startTime > frame_time) {
                    return true;
                }
            }
        }

        return false;
    }
}