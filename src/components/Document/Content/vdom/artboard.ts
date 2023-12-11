import { ArtboradView, EL, ShapeView } from "@kcdesign/data";
import { GroupShapeDom } from "./groupshape";
import { patch } from "./patch";
import { DomBasic } from "./basic";

export class ArtboradDom extends DomBasic(ArtboradView) {

    // 检查显示区域
    // 1. 太小时显示成image
    // 2. 

    private _bubblewatcher(...args: any[]) {
        
    }

    onCreate(): void {
        super.onCreate();
        this._bubblewatcher = this._bubblewatcher.bind(this);
        this.m_data.bubblewatch(this._bubblewatcher);
    }

    onDestory(): void {
        super.onDestory();
        this.m_data.unbubblewatch(this._bubblewatcher);
    }

}