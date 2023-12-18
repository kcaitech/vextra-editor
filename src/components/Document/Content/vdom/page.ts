import { EL, PageView, PropsType } from "@kcdesign/data";
import { elpatch } from "./patch";
import { DomCtx } from "./domctx";
import { ArtboradDom } from "./artboard";

const MAX_NODE_SUPPORT = 5000;

export class PageDom extends (PageView) {

    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL = EL.make("");

    constructor(ctx: DomCtx, props: PropsType) {
        super(ctx, props);
        this.onRenderIdle = this.onRenderIdle.bind(this);
        this.onBeforeRender = this.onBeforeRender.bind(this);
        ctx.setBeforeRenderCallback(this.onBeforeRender);
        ctx.setIdleCallback(this.onRenderIdle);
    }

    bind(node: HTMLElement /* old, for reuse */) { // 
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
        //     el.childs.forEach((el) => ub(el));
        // }
        // ub(this as any);
    }

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version || !this.el) {
            elpatch(this, this.m_save_render);
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
        }
        return version;
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
        }
        else {
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