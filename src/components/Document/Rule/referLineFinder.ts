import { Guide, ShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { ReferUnit } from "@/components/Document/Rule/refer";

interface Path {
    style: string;
    data: string;
}

export interface ActiveGuide {
    valid: boolean;
    guide: Guide;
    index: number;
    env: ShapeView;
    path: Path;
    theme: string;
    visible: boolean;
}

export class ReferLineFinder {
    private m_context: Context;
    private m_line_units: ReferUnit[];
    private m_root_units: ReferUnit;
    private m_selected_guide: ActiveGuide;
    private m_hovered_guide: ActiveGuide;

    constructor(ctx: Context, lineUnits: ReferUnit[], rootUnit: ReferUnit, selected: ActiveGuide, hovered: ActiveGuide) {
        this.m_context = ctx;
        this.m_line_units = lineUnits;
        this.m_root_units = rootUnit;
        this.m_selected_guide = selected;
        this.m_hovered_guide = hovered;
    }
}