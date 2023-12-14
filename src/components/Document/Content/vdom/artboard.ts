import { ArtboradView, DViewCtx, PropsType } from "@kcdesign/data";
import { DomBasic } from "./basic";

export class ArtboradDom extends DomBasic(ArtboradView) {

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
        this.m_data.unbubblewatch(this._bubblewatcher);
    }

}