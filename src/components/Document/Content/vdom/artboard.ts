import { GroupShapeDom } from "./groupshape";

export class ArtboradDom extends GroupShapeDom {

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

    toSVGString(): string {
        return this.m_el?.outerHTML || "";
    }
}