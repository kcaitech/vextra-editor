/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ArtboardView, GuideAxis, Matrix, ShapeType, ShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { formatNumber, ReferUnit } from "@/components/Document/Rule/refer";
import { scout } from "@/utils/scout";
import { XY } from "@/context/selection";
import { cloneDeep } from "lodash";
import { IScout } from "@/openapi";

export enum LineTheme {
    Normal = "#ff4400",
    Deep = "#ff2200",
    Active = "#3387f5"
}

interface Path {
    dash: boolean;
    data: string;
}

export interface ActiveGuide {
    id: string;
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
    private readonly m_scout: IScout;
    private readonly m_context: Context;
    private readonly m_line_units: ReferUnit[];
    private readonly m_root_units: ReferUnit;
    private readonly m_selected_guide: ActiveGuide;
    private readonly m_hovered_guide: ActiveGuide;

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

        return this.m_scout.isPointInStrokeByWidth(pathStr, point, 14 / this.m_context.workspace.matrix.m00);
    }

    search(xy: XY) {
        this.m_last_xy = { ...xy };
        return this.__search();
    }

    private __search() {
        const isT = this.isPointInStroke.bind(this);

        const ctx = this.m_context;
        const xy = this.m_last_xy;

        const __xy = ctx.workspace.matrix.computeCoord3(xy);
        const ctrlPath = ctx.workspace.ctrlPath;
        if (this.m_scout.isPointInStrokeByWidth(ctrlPath, __xy, 14 / ctx.workspace.matrix.m00)) {
            return false;
        }

        const hovered = this.m_hovered_guide;
        const selected = this.m_selected_guide;

        const matrix = new Matrix(ctx.workspace.matrix.inverse);

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

                if (line.id === selected.id) continue;

                const s = matrix.computeCoord3(line.start);
                const e = matrix.computeCoord3(line.end);

                if (isT(xy, s, e)) {
                    hovered.id = line.id;

                    hovered.valid = true;
                    hovered.env = unit.shape;
                    hovered.index = line.index;

                    hovered.start = line.start;
                    hovered.end = line.end;
                    hovered.offset = line.offset;

                    hovered.theme = LineTheme.Deep;
                    hovered.axis = line.axis;

                    if (line.axis === GuideAxis.X) {
                        hovered.desc = formatNumber(line.offset);
                        hovered.transform = `translate(${line.start.x + 2}px, 14px)`;
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
            if (line.id === selected.id) continue;

            const s = matrix.computeCoord3(line.start);
            const e = matrix.computeCoord3(line.end);

            if (isT(xy, s, e)) {
                hovered.id = `page-id-/${l}`;

                hovered.valid = true;
                hovered.env = rootUnit.shape;
                hovered.index = line.index;

                hovered.start = line.start;
                hovered.end = line.end;
                hovered.offset = line.offset;

                hovered.theme = LineTheme.Deep;
                hovered.axis = line.axis;

                if (line.axis === GuideAxis.X) {
                    hovered.desc = formatNumber(line.offset);
                    hovered.transform = `translate(${line.start.x + 2}px, 14px)`;
                } else {
                    hovered.desc = formatNumber(line.offset);
                    hovered.transform = `translate(4px ,${line.start.y + 10}px)`;
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

    /**
     * @description 更新选区，触发因素为容器变动
     */
    updateSelectedSelection(envId: string) {
        const selected = this.m_selected_guide;

        // 选区有效时才更新选区
        if (!selected.valid) {
            return;
        }

        // 顺手关一下
        this.m_hovered_guide.valid = false;

        const env = selected.env as unknown as ArtboardView;

        if (env.id !== envId) {
            return;
        }

        const gui = (env as ArtboardView)?.guides?.[selected.index];
        if (!gui) {
            return;
        }

        selected.path.length = 0;

        const offset = gui.offset;
        selected.offset = gui.offset;
        selected.desc = formatNumber(selected.offset);
        if (env.type === ShapeType.Page) {
            const root = this.m_context.workspace.root;
            const matrix = this.m_context.workspace.matrix

            if (selected.axis === GuideAxis.X) {
                const x = matrix.computeCoord2(offset, 0).x;


                if (x < 20 || x > root.width) {
                    return;
                }

                selected.start = { x, y: 0 };
                selected.end = { x, y: root.height };

                selected.transform = `translate(${selected.start.x + 2}px, 14px)`;
            } else {
                const y = matrix.computeCoord2(0, offset).y;


                if (y < 20 || y > root.height) {
                    return;
                }

                selected.start = { x: 0, y };
                selected.end = { x: root.width, y };

                selected.transform = `translate(4px, ${selected.start.y + 10}px)`;
            }

            const path: Path = { dash: false, data: '' };
            path.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;

            selected.path.push(path);
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

                selected.transform = `translate(${selected.start.x + 2}px, 14px)`;

                const clientS = { x: selected.start.x, y: 0 };
                const clientE = { x: selected.start.x, y: root.height };

                path1.data = `M${clientS.x} ${clientS.y} L${selected.start.x} ${selected.start.y}`;
                path2.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;
                path3.data = `M${selected.end.x} ${selected.end.y} L${clientE.x} ${clientE.y}`;
            } else {
                selected.start = matrix.computeCoord2(0, offset);
                selected.end = matrix.computeCoord2(frame.width, offset);

                if (selected.start.y < 20 || selected.start.y > root.height) {
                    return;
                }

                selected.transform = `translate(4px, ${selected.start.y + 10}px)`;

                const clientS = { x: 0, y: selected.start.y };
                const clientE = { x: root.width, y: selected.start.y };

                path1.data = `M${clientS.x} ${clientS.y} L${selected.start.x} ${selected.start.y}`;
                path2.data = `M${selected.start.x} ${selected.start.y} L${selected.end.x} ${selected.end.y}`;
                path3.data = `M${selected.end.x} ${selected.end.y} L${clientE.x} ${clientE.y}`;
            }

            selected.path.push(path2, path1, path3);
        }
    }

    updateHoveredSelection(envId: string) {
        const hovered = this.m_hovered_guide;

        // 选区有效时才更新选区
        if (!hovered.valid) {
            return;
        }

        const env = hovered.env as unknown as ArtboardView;

        if (env.id !== envId) {
            return;
        }

        const gui = (env as ArtboardView)?.guides?.[hovered.index];
        if (!gui) {
            return;
        }

        hovered.path.length = 0;

        const offset = gui.offset;
        hovered.offset = gui.offset;

        hovered.desc = formatNumber(hovered.offset);

        if (env.type === ShapeType.Page) {
            const root = this.m_context.workspace.root;
            const matrix = this.m_context.workspace.matrix

            if (hovered.axis === GuideAxis.X) {
                const x = matrix.computeCoord2(offset, 0).x;


                if (x < 20 || x > root.width) {
                    return;
                }

                hovered.start = { x, y: 0 };
                hovered.end = { x, y: root.height };

                hovered.transform = `translate(${hovered.start.x + 2}px, 14px)`;
            } else {
                const y = matrix.computeCoord2(0, offset).y;


                if (y < 20 || y > root.height) {
                    return;
                }

                hovered.start = { x: 0, y };
                hovered.end = { x: root.width, y };

                hovered.transform = `translate(4px, ${hovered.start.y + 10}px)`;
            }

            const path: Path = { dash: false, data: '' };
            path.data = `M${hovered.start.x} ${hovered.start.y} L${hovered.end.x} ${hovered.end.y}`;

            hovered.path.push(path);
        } else {
            const root = this.m_context.workspace.root;
            const frame = env.frame;

            const matrix = env.matrix2Root();
            matrix.multiAtLeft(this.m_context.workspace.matrix);

            const path1: Path = { dash: true, data: '' };
            const path2: Path = { dash: false, data: '' };
            const path3: Path = { dash: true, data: '' };

            if (hovered.axis === GuideAxis.X) {
                hovered.start = matrix.computeCoord2(offset, 0);
                hovered.end = matrix.computeCoord2(offset, frame.height);

                if (hovered.start.x < 20 || hovered.start.x > root.width) {
                    return;
                }

                hovered.transform = `translate(${hovered.start.x + 2}px, 14px)`;

                const clientS = { x: hovered.start.x, y: 0 };
                const clientE = { x: hovered.start.x, y: root.height };

                path1.data = `M${clientS.x} ${clientS.y} L${hovered.start.x} ${hovered.start.y}`;
                path2.data = `M${hovered.start.x} ${hovered.start.y} L${hovered.end.x} ${hovered.end.y}`;
                path3.data = `M${hovered.end.x} ${hovered.end.y} L${clientE.x} ${clientE.y}`;
            } else {
                hovered.start = matrix.computeCoord2(0, offset);
                hovered.end = matrix.computeCoord2(frame.width, offset);

                if (hovered.start.y < 20 || hovered.start.y > root.height) {
                    return;
                }

                hovered.transform = `translate(4px, ${hovered.start.y + 10}px)`;

                const clientS = { x: 0, y: hovered.start.y };
                const clientE = { x: root.width, y: hovered.start.y };

                path1.data = `M${clientS.x} ${clientS.y} L${hovered.start.x} ${hovered.start.y}`;
                path2.data = `M${hovered.start.x} ${hovered.start.y} L${hovered.end.x} ${hovered.end.y}`;
                path3.data = `M${hovered.end.x} ${hovered.end.y} L${clientE.x} ${clientE.y}`;
            }

            hovered.path.push(path2, path1, path3);
        }
    }

    updateSelectionForDelete(envId: string) {
        this.updateSelectedSelectionForDelete(envId);
        this.updateHoveredSelectionForDelete(envId);
    }

    updateSelectedSelectionForDelete(envId: string) {
        const selected = this.m_selected_guide;

        // 选区有效时才更新选区
        if (!selected.valid) {
            return;
        }

        const env = selected.env as unknown as ArtboardView;

        if (env.id !== envId) {
            return;
        }

        selected.valid = false;
        selected.id = '-1';
    }

    updateHoveredSelectionForDelete(envId: string) {
        const hovered = this.m_hovered_guide;

        // 选区有效时才更新选区
        if (!hovered.valid) {
            return;
        }

        const env = hovered.env as ArtboardView;

        if (env.id !== envId) {
            return;
        }

        hovered.valid = false;
    }

    modifyHoveredIndex(env: ShapeView, index: number, axis: GuideAxis) {
        this.m_hovered_guide.valid = true;
        this.m_hovered_guide.env = env;
        this.m_hovered_guide.index = index;
        this.m_hovered_guide.axis = axis;
    }

    get hovered() {
        return this.m_hovered_guide;
    }

    select() {
        const selected = this.m_selected_guide;
        const hovered = this.m_hovered_guide;

        // 当hovered被激活时，selected才有条件激活
        if (!hovered.valid) {
            return false;
        }

        this.m_context.selection.resetSelectShapes();

        selected.valid = true;
        selected.visible = true;

        selected.id = hovered.id;
        selected.index = hovered.index;
        selected.env = hovered.env;

        selected.path = cloneDeep(hovered.path);
        selected.start = { ...hovered.start };
        selected.end = { ...hovered.end };

        selected.axis = hovered.axis;
        selected.offset = hovered.offset;
        selected.transform = hovered.transform;

        hovered.valid = false;
        hovered.id = '-1';

        return true;
    }

    get selected() {
        return this.m_selected_guide;
    }

    updateByShapesSelected() {
        if (this.m_context.selection.selectedShapes.length) {
            this.m_selected_guide.valid = false;
            this.m_selected_guide.id = '-1';
        }
    }

    resetSelected() {
        this.m_selected_guide.valid = false;
        this.m_selected_guide.id = '-1';
    }

    resetHovered() {
        this.m_hovered_guide.valid = false;
        this.m_hovered_guide.id = '-1';
    }

    removeScout() {
        this.m_scout.remove();
    }
}