import { GuideAxis, Matrix, ShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { formatNumber, ReferUnit } from "@/components/Document/Rule/refer";
import { scout, Scout } from "@/utils/scout";
import { XY } from "@/context/selection";

export enum LineTheme {
    Normal = "#ff4400",
    Deep = "#ff0000",
    Active = "#3387f5"
}

interface Path {
    dash: boolean;
    data: string;
}

export interface ActiveGuide {
    valid: boolean;
    index: number;
    env: ShapeView;
    path: Path[];
    theme: LineTheme;
    visible: boolean;
    start: XY;
    end: XY;
    axis: GuideAxis;
    offset: number | string;
    transform: string;
}

export class ReferLineFinder {
    readonly m_scout: Scout;
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

        this.m_scout = scout(ctx);
    }

    private isPointInStroke(point: XY, start: XY, end: XY) {
        const pathStr = `M${start.x} ${start.y} L${end.x} ${end.y}`;

        return this.m_scout.isPointInStroke(pathStr, point);
    }

    search(xy: XY) {
        const hovered = this.m_hovered_guide;

        const isT = this.isPointInStroke.bind(this);

        const matrix = new Matrix(this.m_context.workspace.matrix.inverse);

        if (hovered.valid && isT(xy, matrix.computeCoord3(hovered.start), matrix.computeCoord3(hovered.end))) {
            return true;
        }

        hovered.valid = false;

        const units = this.m_line_units;
        for (let ui = 0; ui < units.length; ui++) {
            const unit = units[ui];
            const lines = unit.lines;

            for (let l = 0; l < lines.length; l++) {
                const line = lines[l];

                const s = matrix.computeCoord3(line.start);
                const e = matrix.computeCoord3(line.end);

                if (isT(xy, s, e)) {
                    hovered.valid = true;
                    hovered.env = unit.shape;
                    hovered.start = line.start;
                    hovered.end = line.end;
                    hovered.theme = LineTheme.Deep;
                    hovered.axis = line.axis;

                    if (line.axis === GuideAxis.X) {
                        hovered.offset = formatNumber(line.offset);
                        hovered.transform = `translateX(${line.start.x + 10}px)`;
                    } else {
                        hovered.offset = formatNumber(line.offset);
                        hovered.transform = `translateY(${line.start.y + 10}px)`
                    }

                    const ctx = this.m_context;

                    const clientS = line.start;
                    const clientE = line.end;

                    const root = ctx.workspace.root;

                    const path1: Path = { dash: true, data: '' };
                    const path2: Path = { dash: false, data: '' };
                    const path3: Path = { dash: true, data: '' };

                    if (line.axis === GuideAxis.X) {
                        path1.data = `M${clientS.x} 0 L${clientS.x} ${clientS.y}`;
                        path2.data = `M${clientS.x} ${clientS.y} L${clientE.x} ${clientE.y}`;
                        path3.data = `M${clientE.x} ${clientE.y} L${clientE.x} ${root.height}`;
                    } else {
                        path1.data = `M0 ${clientS.y} L${clientS.x} ${clientS.y}`;
                        path2.data = `M${clientS.x} ${clientS.y} L${clientE.x} ${clientE.y}`;
                        path3.data = `M${clientE.x} ${clientE.y} L${root.width} ${clientE.y}`;
                    }

                    hovered.path.length = 0;
                    hovered.path.push(path1, path2, path3);

                    return true;
                }
            }
        }
        return false;
    }
}