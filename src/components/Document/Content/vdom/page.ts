import { EL, PageView } from "@kcdesign/data";
import { elpatch } from "./patch";

const MAX_NODE_SUPPORT = 5000;

export class PageDom extends (PageView) {

    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL = EL.make("");

    bind(node: HTMLElement /* old, for reuse */) { // 
        if (this.el) throw new Error("already binded");
        this.el = node;
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

    // render(): number {
    //     const ret = super.render();        
    //     if (this.nodeCount > MAX_NODE_SUPPORT) {
    //         //  将一些节点转换成image

    //     }
    //     return ret;
    // }
}