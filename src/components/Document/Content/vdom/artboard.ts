import { ArtboradView, DViewCtx, EL, PropsType } from "@kcdesign/data";
import { elpatch } from "./patch";

export class ArtboradDom extends (ArtboradView) {

    // 检查显示区域
    // 1. 太小时显示成image
    // 2. 

    constructor(ctx: DViewCtx, props: PropsType) {
        super(ctx, props);
        this._bubblewatcher = this._bubblewatcher.bind(this);
        this.m_data.bubblewatch(this._bubblewatcher);
    }

    private _bubblewatcher(...args: any[]) {

    }

    onDestory(): void {
        super.onDestory();
        this.m_data.bubbleunwatch(this._bubblewatcher);
    }

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