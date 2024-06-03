import { GuideAxis, Matrix, ShapeType, ShapeView } from "@kcdesign/data";
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
    offset: number;
    transform: string;
    desc: number | string;
}

export class ReferLineSelection {
    readonly m_scout: Scout;
    readonly m_context: Context;
    readonly m_line_units: ReferUnit[];
    readonly m_root_units: ReferUnit;
    readonly m_selected_guide: ActiveGuide;
    readonly m_hovered_guide: ActiveGuide;

    private m_last_xy: XY;

    constructor(ctx: Context, lineUnits: ReferUnit[], rootUnit: ReferUnit, selected: ActiveGuide, hovered: ActiveGuide) {
        this.m_context = ctx;
        this.m_line_units = lineUnits;
        this.m_root_units = rootUnit;
        this.m_selected_guide = selected;
        this.m_hovered_guide = hovered;

        this.m_scout = scout(ctx);

        this.m_last_xy = { x: 0, y: 0 };
    }

    private isPointInStroke(point: XY, start: XY, end: XY) {
        const pathStr = `M${start.x} ${start.y} L${end.x} ${end.y}`;

        return this.m_scout.isPointInStroke(pathStr, point);
    }

    search(xy: XY) {
        this.m_last_xy = { ...xy };
        return this.__search();
    }

    searchPassive() {
        return this.__search();
    }

    private __search() {
        const xy = this.m_last_xy;

        const hovered = this.m_hovered_guide;

        const isT = this.isPointInStroke.bind(this);

        const matrix = new Matrix(this.m_context.workspace.matrix.inverse);

        if (hovered.valid && isT(xy, matrix.computeCoord3(hovered.start), matrix.computeCoord3(hovered.end))) {
            return true;
        }

        hovered.valid = false;

        // 先查找容器里的参考线
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
                    hovered.index = l;

                    hovered.start = line.start;
                    hovered.end = line.end;

                    hovered.theme = LineTheme.Deep;
                    hovered.axis = line.axis;

                    if (line.axis === GuideAxis.X) {
                        hovered.desc = formatNumber(line.offset);
                        hovered.transform = `translate(${line.start.x + 2}px, 10px)`;
                    } else {
                        hovered.desc = formatNumber(line.offset);
                        hovered.transform = `translateY(${line.start.y + 10}px)`;
                    }

                    const clientS = line.start;
                    const clientE = line.end;

                    const root = this.m_context.workspace.root;

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
                    hovered.path.push(path2, path1, path3);

                    return true;
                }
            }
        }

        // 再查找Root下的参考线
        const rootUnit = this.m_root_units;
        const rootLines = rootUnit.lines;
        for (let l = 0; l < rootLines.length; l++) {
            const line = rootLines[l];

            const s = matrix.computeCoord3(line.start);
            const e = matrix.computeCoord3(line.end);

            if (isT(xy, s, e)) {
                hovered.valid = true;
                hovered.env = rootUnit.shape;
                hovered.index = l;

                hovered.start = line.start;
                hovered.end = line.end;

                hovered.theme = LineTheme.Deep;
                hovered.axis = line.axis;

                if (line.axis === GuideAxis.X) {
                    hovered.desc = formatNumber(line.offset);
                    hovered.transform = `translate(${line.start.x + 2}px, 10px)`;
                } else {
                    hovered.desc = formatNumber(line.offset);
                    hovered.transform = `translateY(${line.start.y + 10}px)`;
                }

                const clientS = line.start;
                const clientE = line.end;

                const path: Path = { dash: false, data: '' };

                if (line.axis === GuideAxis.X) {
                    path.data = `M${clientS.x} ${clientS.y} L${clientE.x} ${clientE.y}`;
                } else {
                    path.data = `M${clientS.x} ${clientS.y} L${clientE.x} ${clientE.y}`;
                }

                hovered.path.length = 0;
                hovered.path.push(path);

                return true;
            }
        }

        return false;
    }


    updateReferSelection() {
        const selected = this.m_selected_guide;
        if (selected.valid) {

            const offset = selected.offset;
            const env = selected.env;

            selected.path.length = 0;

            if (env.type === ShapeType.Page) {
                const root = this.m_context.workspace.root;
                const matrix = this.m_context.workspace.matrix

                if (selected.axis === GuideAxis.X) {
                    selected.start = matrix.computeCoord2(offset, 0);
                    selected.end = matrix.computeCoord2(offset, root.height);

                    if (selected.start.x < 20 || selected.start.x > root.width) {
                        return;
                    }

                    selected.transform = `translate(${selected.start.x + 2}px, 10px)`;
                } else {
                    selected.start = matrix.computeCoord2(0, offset);
                    selected.end = matrix.computeCoord2(root.width, offset);

                    if (selected.start.y < 20 || selected.start.y > root.height) {
                        return;
                    }

                    selected.transform = `translateY(${selected.start.y + 10}px)`;
                }

                const path: Path = { dash: false, data: '' };
                path.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;
            } else {
                const root = this.m_context.workspace.root;
                const frame = env.frame;

                const matrix = env.matrix2Root();
                matrix.multiAtLeft(this.m_context.workspace.matrix);

                const path1: Path = { dash: true, data: '' };
                const path2: Path = { dash: false, data: '' };
                const path3: Path = { dash: true, data: '' };

                if (selected.axis === GuideAxis.X) {
                    selected.start = matrix.computeCoord2(offset, 0);
                    selected.end = matrix.computeCoord2(offset, frame.height);

                    if (selected.start.x < 20 || selected.start.x > root.width) {
                        return;
                    }

                    selected.transform = `translate(${selected.start.x + 2}px, 10px)`;

                    const clientS = { x: selected.start.x, y: 0 };
                    const clientE = { x: selected.start.x, y: root.height };

                    path1.data = `M${clientS.x} ${clientS.y} L${clientS.x} ${selected.start.y}`;
                    path2.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;
                    path3.data = `M${selected.end.x} ${selected.end.y} L${clientE.x} ${clientE.y}`;
                } else {
                    selected.start = matrix.computeCoord2(0, offset);
                    selected.end = matrix.computeCoord2(root.width, offset);

                    if (selected.start.y < 20 || selected.start.y > root.height) {
                        return;
                    }

                    selected.transform = `translateY(${selected.start.y + 10}px)`;

                    const clientS = { x: 0, y: selected.start.y };
                    const clientE = { x: root.width, y: selected.start.y };

                    path1.data = `M${clientS.x} ${clientS.y} L${clientS.x} ${selected.start.y}`;
                    path2.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;
                    path3.data = `M${selected.end.x} ${selected.end.y} L${clientE.x} ${clientE.y}`;
                }

                selected.path.push(path2, path1, path3);
            }
        }
    }
}