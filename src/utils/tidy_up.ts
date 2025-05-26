/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { ArtboardView, ColVector3D, Matrix, ShapeType, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "./common";
import { getShapeFrame } from "./content";
import { Selection, XY } from "@/context/selection";

export function tidyUpShapesOrder(shapes: ShapeView[], verBase: boolean) {
    let shape_rows: ShapeView[][] = [];
    let unassignedShapes: ShapeView[] = [...shapes].filter(shape => shape.isVisible);

    while (unassignedShapes.length > 0) {
        // 找出 y + height 最小的图形作为基准图形
        const baseShape = unassignedShapes.reduce((minShape, shape) => {
            const frame = shape.relativeFrame;
            const min_frame = minShape.relativeFrame;
            if (verBase) {
                if (frame.x < min_frame.x) {
                    return shape;
                } else if (frame.x === min_frame.x) {
                    return frame.y <= min_frame.y ? shape : minShape;
                } else {
                    return minShape;
                }
            } else {
                return frame.y <= min_frame.y ? shape : minShape;
            }
        });
        let currentRow: ShapeView[] = [];
        if (verBase) {
            // 将与基准图形相交的图形放入当前列
            currentRow = unassignedShapes.filter(shape => {
                const frame = shape.relativeFrame;
                const base_frame = baseShape.relativeFrame;
                return (base_frame.x + base_frame.width) > frame.x && base_frame.x < (frame.x + frame.width);
            });

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a.relativeFrame;
                const b_frame = b.relativeFrame;
                if (a_frame.y > b_frame.y) {
                    return 1;
                } else {
                    return -1;
                }
            })
        } else {
            // 将与基准图形相交的图形放入当前行
            currentRow = unassignedShapes.filter(shape => {
                const frame = shape.relativeFrame;
                const base_frame = baseShape.relativeFrame;
                return (base_frame.y + base_frame.height) > frame.y && base_frame.y < (frame.y + frame.height);
            });

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a.relativeFrame;
                const b_frame = b.relativeFrame;
                if (a_frame.x > b_frame.x) {
                    return 1;
                } else {
                    return -1;
                }
            })
        }
        // 保存当前行的图形
        shape_rows.push(currentRow);

        // 从未分配图形中移除当前行的图形
        unassignedShapes = unassignedShapes.filter(shape => !currentRow.includes(shape));
    }
    return shape_rows;
}

export function layoutSpacing(shape_rows: ShapeView[][], dir: boolean) {
    if (shape_rows.length === 0) return { hor: 0, ver: 0 }
    let totalHorSpacing = 0; // 用于累计所有水平间距
    let totalVerSpacing = 0; // 用于累计所有垂直间距
    let horSpacingCount = 0; // 记录水平间距的总数
    let verSpacingCount = 0; // 记录垂直间距的总数
    // 垂直方向
    if (dir) {
        let totalWidth = 0;
        shape_rows.forEach((row, rowIndex) => {
            row.forEach((shape, index) => {
                let spacing = 0;
                if (index > 0) {
                    const previousShape = row[index - 1];
                    spacing = shape.relativeFrame.y - (previousShape.relativeFrame.y + previousShape.relativeFrame.height);
                    totalVerSpacing += spacing; // 累加垂直间距
                    verSpacingCount += 1; // 增加垂直间距计数
                }
            });
            const maxOfCurrentRowW = Math.max(...row.map(shape => shape.relativeFrame.width));
            totalWidth += maxOfCurrentRowW;
            horSpacingCount += 1; // 增加水平间距计数
        });
        const minx = Math.min(...shape_rows[0].map(shape => shape.relativeFrame.x));
        const minw = Math.max(...shape_rows[shape_rows.length - 1].map(shape => shape.relativeFrame.x + shape.relativeFrame.width));
        horSpacingCount -= 1;
        totalHorSpacing = ((minw - minx) - totalWidth);
    } else {
        let totalHeight = 0;
        shape_rows.forEach((row, rowIndex) => {
            row.forEach((shape, index) => {
                let spacing = 0;
                if (index > 0) {
                    const previousShape = row[index - 1];
                    spacing = shape.relativeFrame.x - (previousShape.relativeFrame.x + previousShape.relativeFrame.width);
                    totalHorSpacing += spacing; // 累加水平间距
                    horSpacingCount += 1; // 增加水平间距计数
                }
            });
            const maxOfPreviousRowH = Math.max(...row.map(shape => shape.relativeFrame.height));
            totalHeight += maxOfPreviousRowH;
            verSpacingCount += 1; // 增加垂直间距计数
        });
        const miny = Math.min(...shape_rows[0].map(shape => shape.relativeFrame.y));
        const minh = Math.max(...shape_rows[shape_rows.length - 1].map(shape => shape.relativeFrame.y + shape.relativeFrame.height));
        verSpacingCount -= 1;
        totalVerSpacing = (minh - miny - totalHeight);
    }
    // 计算平均水平间距并向下取整
    const averageHorSpacing = horSpacingCount > 0 ? totalHorSpacing / horSpacingCount : 0;

    // 计算平均垂直间距并向下取整
    const averageVerSpacing = verSpacingCount > 0 ? totalVerSpacing / verSpacingCount : 0;
    return { hor: averageHorSpacing, ver: averageVerSpacing }
}

export const getSelectedWidthHeight = (context: Context, shapes: ShapeView[]) => {
    const matrix = context.workspace.matrix;
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(matrix);
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const width = Math.abs(b.right - b.left);
    const height = Math.abs(b.bottom - b.top);

    return { width, height, box: b }
}

export const whetherNeedTidyUp = (context: Context) => {
    const selected = getVisibleShapes(context.selection.selectedShapes);
    if (hiddenTidyUp(selected) || selected.length < 2) return;
    const { width, height } = getSelectedWidthHeight(context, selected);
    if (height > width) {
        const Info1 = checkVerTidyUp(selected, true);
        if (Info1) return Info1;
        const Info2 = checkHorTidyUp(selected, false);
        if (Info2) return Info2;
    } else {
        const Info1 = checkHorTidyUp(selected, false);
        if (Info1) return Info1;
        const Info2 = checkVerTidyUp(selected, true);
        if (Info2) return Info2;
    }
    return;
}
const checkHorTidyUp = (selected: ShapeView[], dir: boolean) => {
    const shape_rows2 = checkTidyUpShapesOrder(selected, dir);
    if (shape_rows2.length === 1) {
        let rows = shape_rows2[0];
        const frame = rows[0].relativeFrame;
        const start_equal = rows.every(s => getDiff(frame.y, s.relativeFrame.y) < 1);
        const center_equal = rows.every(s => getDiff((frame.y + (frame.height / 2)), (s.relativeFrame.y + (s.relativeFrame.height / 2))) < 1);
        const end_equal = rows.every(s => getDiff((frame.y + frame.height), (s.relativeFrame.y + s.relativeFrame.height)) < 1);
        if (start_equal || center_equal || end_equal) {
            let gap_equal = true;
            const space = rows[1].relativeFrame.x - (rows[0].relativeFrame.x + rows[0].relativeFrame.width);
            for (let i = 0; i < rows.length - 1; i++) {
                const cur_f = rows[i].relativeFrame;
                const next_f = rows[i + 1].relativeFrame;
                if (getDiff((next_f.x - (cur_f.x + cur_f.width)), space) > 1) {
                    gap_equal = false;
                    break;
                }
            }
            if (gap_equal) {
                const align = center_equal ? 'center' : start_equal ? 'start' : 'end';
                return { tidyup: false, hor: space, ver: 0, shapes: [rows], dir: false, align };
            }
        }
    } else {
        const top_equal = shape_rows2.every(row => row[0].relativeFrame.y === shape_rows2[0][0].relativeFrame.y);
        const left_equal = shape_rows2.every(row => row[0].relativeFrame.x === shape_rows2[0][0].relativeFrame.x);
        const space2 = layoutSpacing(shape_rows2, dir);
        if (left_equal) {
            const horInfo2 = horFindTidyUp(shape_rows2, space2.hor, space2.ver);
            if (!horInfo2.tidyup) return horInfo2;
        }
        if (top_equal) {
            const verInfo2 = verFindTidyUp(shape_rows2, space2.hor, space2.ver);
            if (!verInfo2.tidyup) return verInfo2;
        }
    }
}
const checkVerTidyUp = (selected: ShapeView[], dir: boolean) => {
    const shape_rows = checkTidyUpShapesOrder(selected, dir);
    
    if (shape_rows.length === 1) {
        let rows = shape_rows[0];
        const frame = rows[0].relativeFrame;
        const start_equal = rows.every(s => getDiff(frame.x, s.relativeFrame.x) < 1);
        const center_equal = rows.every(s => getDiff((frame.x + (frame.width / 2)), (s.relativeFrame.x + (s.relativeFrame.width / 2))) < 1);
        const end_equal = rows.every(s => getDiff((frame.x + frame.width), (s.relativeFrame.x + s.relativeFrame.width)) < 1);
        if (start_equal || center_equal || end_equal) {
            let gap_equal = true;
            const space = rows[1].relativeFrame.y - (rows[0].relativeFrame.y + rows[0].relativeFrame.height);
            for (let i = 0; i < rows.length - 1; i++) {
                const cur_f = rows[i].relativeFrame;
                const next_f = rows[i + 1].relativeFrame;
                if (getDiff((next_f.y - (cur_f.y + cur_f.height)), space) > 1) {
                    gap_equal = false;
                    break;
                }
            }
            if (gap_equal) {
                const align = center_equal ? 'center' : start_equal ? 'start' : 'end'
                return { tidyup: false, hor: 0, ver: space, shapes: [rows], dir: true, align }
            }
        }
    } else {
        const top_equal = shape_rows.every(row => row[0].relativeFrame.y === shape_rows[0][0].relativeFrame.y);
        const left_equal = shape_rows.every(row => row[0].relativeFrame.x === shape_rows[0][0].relativeFrame.x);
        const space = layoutSpacing(shape_rows, dir);
        if (top_equal) {
            const verInfo = verFindTidyUp(shape_rows, space.hor, space.ver);
            if (!verInfo.tidyup) return verInfo;
        }
        if (left_equal) {
            const horInfo = horFindTidyUp(shape_rows, space.hor, space.ver);
            if (!horInfo.tidyup) return horInfo;
        }
    }
}

export const hiddenTidyUp = (shapes: ShapeView[]) => {
    const pId = shapes[0].parent?.id;
    if (!pId) return true;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const parent = shape.parent!
        if ((parent as ArtboardView).autoLayout || pId !== parent.id) {
            return true;
        }
    }
    return false;
}

function verFindTidyUp(shape_rows: ShapeView[][], hor: number, ver: number) {
    const minX = Math.min(...shape_rows[0].map(s => s.relativeFrame.x));
    const minY = Math.min(...shape_rows[0].map(s => s.relativeFrame.y));
    let leftTrans = minX;
    let topTrans = minY;
    let istidyup = false;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        // 更新当前行的最大宽度
        const maxWidthInRow = Math.max(...shape_row.map(s => s.relativeFrame.width));
        for (let i = 0; i < shape_row.length; i++) {
            const shape = shape_row[i];
            const frame = shape.relativeFrame;
            const parent = shape.parent!;
            let transx = 0;
            let transy = 0;
            // 设置新的 x 和 y 坐标
            const horizontalOffset = (maxWidthInRow - frame.width) / 2;
            if (parent.type === ShapeType.Page) {
                const m = parent.matrix2Root();
                const box = m.computeCoord2(shape.relativeFrame.x, shape.relativeFrame.y);
                transx = leftTrans + horizontalOffset - box.x;
                transy = topTrans - box.y;
            } else {
                transx = leftTrans + horizontalOffset - frame.x;
                transy = topTrans - frame.y;
            }

            if (transx > 1 || transy > 1 || transx < -1 || transy < -1) {
                istidyup = true;
                break;
            }
            // 更新下一个图形的 y 坐标
            topTrans += frame.height + ver;
        }
        if (istidyup) break;
        topTrans = minY; // 重置为上边距
        leftTrans += maxWidthInRow + hor; // 换列，增加 x 坐标
    }
    return { tidyup: istidyup, hor, ver, shapes: shape_rows, dir: true, align: 'center' };
}
function horFindTidyUp(shape_rows: ShapeView[][], hor: number, ver: number) {
    const minX = Math.min(...shape_rows[0].map(s => s.relativeFrame.x));
    const minY = Math.min(...shape_rows[0].map(s => s.relativeFrame.y));
    let leftTrans = minX;
    let topTrans = minY;
    let istidyup = false;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        // 更新当前行的最大高度
        const maxHeightInRow = Math.max(...shape_row.map(s => s.relativeFrame.height));
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const frame = shape.relativeFrame;
            const parent = shape.parent!;
            let transx = 0;
            let transy = 0;
            // 设置新的 x 和 y 坐标
            const verticalOffset = (maxHeightInRow - frame.height) / 2;
            if (parent.type === ShapeType.Page) {
                const m = parent.matrix2Root();
                const box = m.computeCoord2(shape.relativeFrame.x, shape.relativeFrame.y);
                transx = leftTrans - box.x;
                transy = topTrans + verticalOffset - box.y;
            } else {
                transx = leftTrans - frame.x;
                transy = topTrans + verticalOffset - frame.y;
            }
            if (transx > 1 || transy > 1 || transx < -1 || transy < -1) {
                istidyup = true;
                break;
            }
            leftTrans += frame.width + hor;
        }
        if (istidyup) break;
        leftTrans = minX; // 重置为左边距
        topTrans += maxHeightInRow + ver; // 换行，增加 y 坐标
    }
    return { tidyup: istidyup, hor, ver, shapes: shape_rows, dir: false, align: 'center' };
}

export const getFrame = (shape: ShapeView) => {
    let f = getShapeFrame(shape);
    const m = shape.transform;
    if (shape.isNoTransform()) {
        f.x = f.x + m.translateX, f.y = f.y + m.translateY
    } else {
        const corners = [
            { x: f.x, y: f.y },
            { x: f.x + f.width, y: f.y },
            { x: f.x + f.width, y: f.y + f.height },
            { x: f.x, y: f.y + f.height }]
            .map((p) => m.computeCoord(p));
        const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
        const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
        const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
        const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
        f.x = minx, f.y = miny, f.width = maxx - minx, f.height = maxy - miny
    }
    return f;
}

export function getShapesRowsMapPosition(context: Context, shape_rows: ShapeView[][], space: { hor: number, ver: number }, startXY: { x: number, y: number }): XY[][] {
    const shapes_rows_point_map = [];
    const minWidth = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.width)))) - 1;
    const minHeight = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.height)))) - 1;
    const rows = shape_rows.find(rows => rows.length > 0);
    if (!rows) return [];
    const parent = rows[0]?.parent;
    if (!parent) return [];
    const matrix = new Matrix();
    const matrix2 = new Matrix(context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    let startY = startXY.y;
    let startX = startXY.x;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        const row = [];
        const maxHeight = Math.max(...shape_row.map(s => s.relativeFrame.height));
        const grid_point_y = m.transform([
            ColVector3D.FromXY(0, startY + maxHeight + (Math.max(space.ver, -minHeight) / 2)),
        ])[0].y;
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const { width } = shape.relativeFrame;
            if (j !== shape_row.length - 1) {
                const next_s = shape_row[j + 1].relativeFrame;
                const centerX = (width + Math.max(space.hor, -minWidth) + next_s.width) / 2;
                const grid_point_x = m.transform([
                    ColVector3D.FromXY(startX + centerX, 0),
                ])[0].x;
                const point = { x: grid_point_x, y: i === shape_rows.length - 1 ? Infinity : grid_point_y }
                row.push(point);
            } else {
                const grid_point_x = m.transform([
                    ColVector3D.FromXY(startX + width + (Math.max(space.hor, -minWidth) / 2), 0),
                ])[0].x;
                const point = { x: grid_point_x, y: i === shape_rows.length - 1 ? Infinity : grid_point_y }
                row.push(point);
            }
            startX += width + Math.max(space.hor, -minWidth);
        }
        startY += maxHeight + Math.max(space.ver, -minHeight);
        startX = startXY.x;
        shapes_rows_point_map.push(row);
    }
    return shapes_rows_point_map;
}
export function getShapesColsMapPosition(context: Context, shape_rows: ShapeView[][], space: { hor: number, ver: number }, startXY: { x: number, y: number }): XY[][] {
    const shapes_cols_point_map = [];
    const minWidth = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.width)))) - 1;
    const minHeight = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.height)))) - 1;
    const rows = shape_rows.find(rows => rows.length > 0);
    if (!rows) return [];
    const parent = rows[0]?.parent;
    if (!parent) return [];
    const matrix = new Matrix();
    const matrix2 = new Matrix(context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    let startY = startXY.y;
    let startX = startXY.x;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        const col = [];
        const maxWidth = Math.max(...shape_row.map(s => s.relativeFrame.width));
        const grid_point_x = m.transform([
            ColVector3D.FromXY(startX + maxWidth + (Math.max(space.hor, -minWidth) / 2), 0),
        ])[0].x;
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const { height } = shape.relativeFrame;
            if (j !== shape_row.length - 1) {
                const next_s = shape_row[j + 1].relativeFrame;
                const centerY = (height + Math.max(space.ver, -minHeight) + next_s.height) / 2;
                const grid_point_y = m.transform([
                    ColVector3D.FromXY(0, startY + centerY),
                ])[0].y;
                const point = { x: i === shape_rows.length - 1 ? Infinity : grid_point_x, y: grid_point_y }
                col.push(point);
            } else {
                const grid_point_y = m.transform([
                    ColVector3D.FromXY(0, startY + height + (Math.max(space.ver, -minHeight) / 2)),
                ])[0].y;
                const point = { x: i === shape_rows.length - 1 ? Infinity : grid_point_x, y: grid_point_y }
                col.push(point);
            }
            startY += height + Math.max(space.ver, -minHeight);
        }
        shapes_cols_point_map.push(col);
        startX += maxWidth + Math.max(space.hor, -minWidth);
        startY = startXY.y;
    }
    return shapes_cols_point_map;
}

export function getVerShapeOutlineFrame(context: Context, shape_rows: ShapeView[][], space: { hor: number, ver: number }, startXY: { x: number, y: number }, target: string) {
    const minWidth = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.width)))) - 1;
    const minHeight = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.height)))) - 1;
    const rows = shape_rows.find(rows => rows.length > 0);
    if (!rows) return [];
    const parent = rows[0]?.parent;
    if (!parent) return [];
    const matrix = new Matrix();
    const matrix2 = new Matrix(context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    let startY = startXY.y;
    let startX = startXY.x;
    const align = context.selection.tidyUpAlign;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        const maxWidth = Math.max(...shape_row.map(s => s.relativeFrame.width));
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const { width, height } = shape.relativeFrame;
            let horizontalOffset = 0;
            if (align === 'center') {
                horizontalOffset = (maxWidth - width) / 2;
            } else if (align === 'end') {
                horizontalOffset = maxWidth - width;
            }
            const transx = startX + horizontalOffset;
            if (shape.id === target) {
                context.selection.notify(Selection.CHANGE_TIDY_UP_SHAPE, { x: transx, y: startY, width, height });
                return;
            }
            startY += height + Math.max(space.ver, -minHeight);
        }
        startX += maxWidth + Math.max(space.hor, -minWidth);
        startY = startXY.y;
    }
}

export function getHorShapeOutlineFrame(context: Context, shape_rows: ShapeView[][], space: { hor: number, ver: number }, startXY: { x: number, y: number }, target: string) {
    const minWidth = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.width)))) - 1;
    const minHeight = Math.min(...shape_rows.map(row => Math.min(...row.map(s => s.relativeFrame.height)))) - 1;
    const rows = shape_rows.find(rows => rows.length > 0);
    if (!rows) return [];
    const parent = rows[0]?.parent;
    if (!parent) return [];
    const matrix = new Matrix();
    const matrix2 = new Matrix(context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    let startY = startXY.y;
    let startX = startXY.x;
    const align = context.selection.tidyUpAlign;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        const maxHeight = Math.max(...shape_row.map(s => s.relativeFrame.height));
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const { width, height } = shape.relativeFrame;
            let verticalOffset = 0;
            if (align === 'center') {
                verticalOffset = (maxHeight - height) / 2;
            } else if (align === 'end') {
                verticalOffset = maxHeight - height;
            }
            const transy = startY + verticalOffset;
            if (shape.id === target) {
                context.selection.notify(Selection.CHANGE_TIDY_UP_SHAPE, { x: startX, y: transy, width, height });
                return;
            }
            startX += width + Math.max(space.hor, -minWidth);
        }
        startY += maxHeight + Math.max(space.ver, -minHeight);
        startX = startXY.x;
    }
}

export function checkTidyUpShapesOrder(shapes: ShapeView[], verBase: boolean) {
    let shape_rows: ShapeView[][] = [];
    let unassignedShapes: ShapeView[] = [...shapes].filter(shape => shape.isVisible);
    const shapes_row_length = unassignedShapes.length;
    if (shapes_row_length < 2) return [];
    while (unassignedShapes.length > 0) {
        // 找出 y + height 最小的图形作为基准图形
        const baseShape = unassignedShapes.reduce((minShape, shape) => {
            const frame = shape.relativeFrame;
            const min_frame = minShape.relativeFrame;
            if (verBase) {
                if (frame.x < min_frame.x) {
                    return shape;
                } else if (frame.x === min_frame.x) {
                    return frame.y <= min_frame.y ? shape : minShape;
                } else {
                    return minShape;
                }
            } else {
                return frame.y <= min_frame.y ? shape : minShape;
            }
        });
        let currentRow: ShapeView[] = [];
        if (verBase) {
            currentRow = unassignedShapes.filter(shape => {
                const frame = shape.relativeFrame;
                const base_frame = baseShape.relativeFrame;
                return (base_frame.x + base_frame.width) > frame.x && base_frame.x < (frame.x + frame.width);
            });

            if (currentRow.length !== shapes_row_length) {
                // 将与基准图形相交的图形放入当前列
                currentRow = unassignedShapes.filter(shape => {
                    const frame = shape.relativeFrame;
                    const base_frame = baseShape.relativeFrame;
                    return Math.abs((base_frame.x + (base_frame.width / 2)) - (frame.x + (frame.width / 2))) < 1;
                });
            }

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a.relativeFrame;
                const b_frame = b.relativeFrame;
                if (a_frame.y > b_frame.y) {
                    return 1;
                } else {
                    return -1;
                }
            })
        } else {
            currentRow = unassignedShapes.filter(shape => {
                const frame = shape.relativeFrame;
                const base_frame = baseShape.relativeFrame;
                return (base_frame.y + base_frame.height) > frame.y && base_frame.y < (frame.y + frame.height);
            });
            if (currentRow.length !== shapes_row_length) {
                // 将与基准图形相交的图形放入当前行
                currentRow = unassignedShapes.filter(shape => {
                    const frame = shape.relativeFrame;
                    const base_frame = baseShape.relativeFrame;
                    return Math.abs((base_frame.y + (base_frame.height / 2)) - (frame.y + (frame.height / 2))) < 1;
                });
            }

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a.relativeFrame;
                const b_frame = b.relativeFrame;
                if (a_frame.x > b_frame.x) {
                    return 1;
                } else {
                    return -1;
                }
            })
        }
        // 保存当前行的图形
        shape_rows.push(currentRow);

        // 从未分配图形中移除当前行的图形
        unassignedShapes = unassignedShapes.filter(shape => !currentRow.includes(shape));
    }
    const row_single = shape_rows.every(row => row.length === 1);
    if (row_single) {
        const row = shape_rows.map(s => s[0])
        row.sort((a, b) => {
            const a_frame = a.relativeFrame;
            const b_frame = b.relativeFrame;
            if (verBase) {
                if (a_frame.y > b_frame.y) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                if (a_frame.x > b_frame.x) {
                    return 1;
                } else {
                    return -1;
                }
            }

        })
        shape_rows = [row];
    }
    return shape_rows;
}


const getDiff = (a: number, b: number) => {
    return Math.abs(a - b);
}


export const getVisibleShapes = (shapes: ShapeView[])=> {
    return shapes.filter(s => s.isVisible);
}