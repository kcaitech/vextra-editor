import { EL, GroupShapeView } from "@kcdesign/data";
import { optiRender } from "./optinode";

export class GroupShapeDom extends (GroupShapeView) {
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    hasOptiNode = true;
    optiel?: HTMLElement | SVGElement; // 绘制优化，不可见的节点暂存不显示

    render(): number {
        const version: number = super.render();
        optiRender(this, version);
        return version;
    }

    protected checkAndResetDirty(): boolean {
        if (super.checkAndResetDirty()) return true;
        return !this.el;
    }
}