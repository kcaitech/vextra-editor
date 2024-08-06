import { EL, GroupShapeView } from "@kcdesign/data";
import { createElement, elpatch } from "./patch";

export class GroupShapeDom extends (GroupShapeView) {
    saveel?: HTMLElement | SVGElement; // 绘制优化，不可见的节点暂存不显示
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    dropNode() {
        if (this.saveel) return;
        if (!this.eltag) return;
        this.saveel = createElement(this.eltag);

        const saveel = this.el;
        this.el = this.saveel;
        this.saveel = saveel;

        if (saveel && saveel.parentNode) {
            saveel.parentNode.replaceChild(this.el, saveel);
        }
    }
    appendNode() {
        if (!this.saveel) return;

        const saveel = this.el;
        this.el = this.saveel;
        this.saveel = undefined;

        if (saveel && saveel.parentNode && this.el) {
            saveel.parentNode.replaceChild(this.el, saveel);
        }
    }

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version || !this.el) {
            if (this.saveel) {
                const saveel = this.el;
                this.el = this.saveel;
                this.saveel = saveel;
                elpatch(this, this.m_save_render); // 这里才转化为html或者svg节点
                this.saveel = this.el;
                this.el = saveel;
            } else {
                elpatch(this, this.m_save_render); // 这里才转化为html或者svg节点
            }
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
            this.m_save_render.el = this.el;
        }
        return version;
    }

    protected checkAndResetDirty(): boolean {
        if (super.checkAndResetDirty()) return true;
        return !this.el;
    }
}