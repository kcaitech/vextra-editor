import { VariableType, OverrideType, Variable, renderFills, ShapeFrame, renderBorders } from "@kcdesign/data";
import { VDom, findOverrideAndVar, h } from "./basic";

export class ShapeDom extends VDom {

    m_fills?: string;
    m_borders?: string;
    m_path?: string;
    m_contents?: string;
    m_frame?: ShapeFrame;

    onDataChange(...args: any[]): void {
        if (args.includes('points')) this.m_path = undefined;
        if (args.includes('fills')) this.m_fills = undefined;
        if (args.includes('borders')) this.m_borders = undefined;
    }

    private _findOV(ot: OverrideType, vt: VariableType): Variable | undefined {
        if (!this.m_varsContainer) return;
        const _vars = findOverrideAndVar(this.m_data, ot, this.m_varsContainer);
        if (!_vars) return;
        const _var = _vars[_vars.length - 1];
        if (_var && _var.type === vt) {
            return _var;
        }
    }

    getFills() {
        const v = this._findOV(OverrideType.Fills, VariableType.Fills);
        return v ? v.value : this.m_data.style.fills;
    }

    getBorders() {
        const v = this._findOV(OverrideType.Borders, VariableType.Borders);
        return v ? v.value : this.m_data.style.borders;
    }

    isVisible(): boolean {
        const v = this._findOV(OverrideType.Visible, VariableType.Visible);
        return v ? v.value : !!this.m_data.isVisible;
    }

    isLocked(): boolean {
        const v = this._findOV(OverrideType.Lock, VariableType.Lock);
        return v? v.value :!!this.m_data.isLocked;
    }

    prepare() {
        // prepare path
        // prepare frame
    }

    renderFills() {
        if (!this.m_fills && this.m_path && this.m_frame) {
            this.m_fills = renderFills(h, this.getFills(), this.m_frame, this.m_path).join('');
        }
    }

    renderBorders() {
        if (!this.m_borders && this.m_path && this.m_frame) {
            this.m_borders = renderBorders(h, this.getBorders(), this.m_frame, this.m_path).join('');
        }
    }

    renderContents() {

    }
}