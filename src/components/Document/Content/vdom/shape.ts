import { EL, ShapeView } from "@kcdesign/data";
import { elpatch } from "./patch";

export class ShapeDom extends (ShapeView) {
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL = EL.make("");

    render(): number {
        const version: number = super.render();
        if (version !== this.m_save_version || !this.el) {
            elpatch(this, this.m_save_render);
            this.m_save_version = version;
            this.m_save_render.reset(this.eltag, this.elattr, this.elchilds);
        }
        return version;
    }
}