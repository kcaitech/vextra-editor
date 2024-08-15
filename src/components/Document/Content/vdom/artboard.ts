import { ArtboradView, EL } from "@kcdesign/data";
import { optiRender } from "./optinode";

// const MAX_NODE_SUPPORT = 50; // 小于这个的不转成image了
export class ArtboradDom extends (ArtboradView) {

    // 检查显示区域
    // 1. 太小时显示成image
    // 2. 

    // protected onChildChange(...args: any[]) {
    //     super.onChildChange(...args);
    //     this.m_childs_changed = true;
    // }

    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    protected checkAndResetDirty(): boolean {
        if (super.checkAndResetDirty()) return true;
        return !this.el;
    }

    canOptiNode = true;
    optiel?: HTMLElement | SVGElement; // 绘制优化，不可见的节点暂存不显示

    render(): number {
        const version: number = super.render();
        optiRender(this, version);
        return version;
    }

    // m_childs_changed: boolean = false;
    // m_image_version: number = -1;
    // imageel?: HTMLElement | SVGElement;
    // m_save_image_props: any;

    // switchIntoImage(force: boolean): boolean {
    //     if (this.nodeCount < MAX_NODE_SUPPORT) {
    //         return false;
    //     }
    //     if (!this.el) {
    //         return false;
    //     }
    //     if (!((this.m_image_version !== this.m_save_version || this.m_childs_changed || force))) {
    //         return false;
    //     }

    //     // 仅替换内部svg，以保留阴影
    //     const svgnode = this._svgnode as EL & { el?: HTMLElement | SVGElement };
    //     if (!svgnode || !svgnode.el || svgnode.eltag !== 'svg') {
    //         return false;
    //     }

    //     if (!this.imageel) this.imageel = createElement('image');
    //     const imageel = this.imageel;
    //     if (this.m_image_version !== this.m_save_version || this.m_childs_changed) {

    //         const frame = this.frame;

    //         const svg = svgnode.el.outerHTML.replaceAll("#", "%23");
    //         const href = "data:image/svg+xml," + svg;
    //         setAttribute(imageel, "href", href);
    //         const props: any = {};
    //         props.x = 0;
    //         props.y = 0;
    //         props.width = frame.width;
    //         props.height = frame.height;
    //         props.filter = svgnode.elattr.filter; // 阴影
    //         batchSetAttribute(imageel, props, this.m_save_image_props);
    //         this.m_save_image_props = props;

    //         this.m_image_version = this.m_save_version;
    //         this.m_childs_changed = false;
    //     }

    //     if (svgnode.el && svgnode.el.parentNode) {
    //         svgnode.el.parentNode.replaceChild(imageel, svgnode.el);
    //     }

    //     return true;
    // }

    // switchOutImage(force: boolean) {
    //     if (this.imageel && this.imageel.parentNode && (this.m_childs_changed || force)) {
    //         const svgnode = this._svgnode as EL & { el?: HTMLElement | SVGElement };
    //         if (!svgnode || !svgnode.el || svgnode.eltag !== 'svg') {
    //             return;
    //         }
    //         if (svgnode.el) this.imageel.parentNode.replaceChild(svgnode.el, this.imageel);
    //         else this.imageel.parentNode.removeChild(this.imageel);
    //     }
    // }
}