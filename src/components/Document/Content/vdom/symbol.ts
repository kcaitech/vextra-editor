import { EL, SymbolView } from "@kcdesign/data";
import { NodeType, optiRender, OptiType } from "./optinode";

export class SymbolDom extends (SymbolView) {
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");
    canOptiNode = true;
    optiel?: HTMLElement | SVGElement; // 绘制优化，不可见的节点暂存不显示
    set optiel_dirty(dirty: boolean) {
        const _this = this as NodeType
        if (_this.optis?.records[OptiType.image]) _this.optis.records[OptiType.image].dirty = dirty;
    }
    protected onChildChange(...args: any[]) {
        super.onChildChange(...args);
        this.optiel_dirty = true;
    }

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