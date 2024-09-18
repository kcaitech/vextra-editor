import { Context } from "@/context";
import { ArtboradView, PageView, ShapeType, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "./common";
import { getShapeFrame } from "./content";

export function tidyUpShapesOrder(shapes: ShapeView[], verBase: boolean) {
    let shape_rows: ShapeView[][] = [];
    let unassignedShapes: ShapeView[] = [...shapes].filter(shape => shape.isVisible);

    while (unassignedShapes.length > 0) {
        // 找出 y + height 最小的图形作为基准图形
        const baseShape = unassignedShapes.reduce((minShape, shape) => {
            const frame = shape._p_frame;
            const min_frame = minShape._p_frame;
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
                const frame = shape._p_frame;
                const base_frame = baseShape._p_frame;
                return (base_frame.x + base_frame.width) > frame.x && base_frame.x < (frame.x + frame.width);
            });

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a._p_frame;
                const b_frame = b._p_frame;
                if (a_frame.y > b_frame.y) {
                    return 1;
                } else {
                    return -1;
                }
            })
        } else {
            // 将与基准图形相交的图形放入当前行
            currentRow = unassignedShapes.filter(shape => {
                const frame = shape._p_frame;
                const base_frame = baseShape._p_frame;
                return (base_frame.y + base_frame.height) > frame.y && base_frame.y < (frame.y + frame.height);
            });

            // 将当前行按 x 坐标排序
            currentRow.sort((a, b) => {
                const a_frame = a._p_frame;
                const b_frame = b._p_frame;
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
    let totalHorSpacing = 0; // 用于累计所有水平间距
    let totalVerSpacing = 0; // 用于累计所有垂直间距
    let horSpacingCount = 0; // 记录水平间距的总数
    let verSpacingCount = 0; // 记录垂直间距的总数
    // 垂直方向
    if (dir) {
        shape_rows.forEach((row, rowIndex) => {
            row.forEach((shape, index) => {
                let spacing = 0;
                if (index > 0) {
                    const previousShape = row[index - 1];
                    spacing = shape._p_frame.y - (previousShape._p_frame.y + previousShape._p_frame.height);
                    totalVerSpacing += spacing; // 累加垂直间距
                    verSpacingCount += 1; // 增加垂直间距计数
                }
            });
            if (rowIndex > 0) {
                // 计算当前列与上一列之间的水平间距
                const previousRow = shape_rows[rowIndex - 1];
                const minXOfCurrentRow = Math.min(...row.map(shape => shape._p_frame.x));
                const maxXOfPreviousRow = Math.max(...previousRow.map(shape => shape._p_frame.x + shape._p_frame.width));
                const horSpacing = minXOfCurrentRow - maxXOfPreviousRow;

                totalHorSpacing += horSpacing; // 累加水平间距
                horSpacingCount += 1; // 增加水平间距计数
            }
        });
    } else {
        shape_rows.forEach((row, rowIndex) => {
            row.forEach((shape, index) => {
                let spacing = 0;
                if (index > 0) {
                    const previousShape = row[index - 1];
                    spacing = shape._p_frame.x - (previousShape._p_frame.x + previousShape._p_frame.width);
                    totalHorSpacing += spacing; // 累加水平间距
                    horSpacingCount += 1; // 增加水平间距计数
                }
            });
            if (rowIndex > 0) {
                // 计算当前行与上一行之间的垂直间距
                const previousRow = shape_rows[rowIndex - 1];
                const minYOfCurrentRow = Math.min(...row.map(shape => shape._p_frame.y));
                const maxYOfPreviousRow = Math.max(...previousRow.map(shape => shape._p_frame.y + shape._p_frame.height));
                const verSpacing = minYOfCurrentRow - maxYOfPreviousRow;

                totalVerSpacing += verSpacing; // 累加垂直间距
                verSpacingCount += 1; // 增加垂直间距计数
            }
        });
    }
    // 计算平均水平间距并向下取整
    const averageHorSpacing = horSpacingCount > 0 ? totalHorSpacing / horSpacingCount : 0;

    // 计算平均垂直间距并向下取整
    let averageVerSpacing = verSpacingCount > 0 ? totalVerSpacing / verSpacingCount : 0;
    averageVerSpacing = averageVerSpacing > 0 ? averageVerSpacing : 0;
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
    const selected = context.selection.selectedShapes;
    if (hiddenTidyUp(selected)) return;
    const shape_rows = tidyUpShapesOrder(selected, true);
    const shape_rows2 = tidyUpShapesOrder(selected, false);
    const space = layoutSpacing(shape_rows, true);
    const space2 = layoutSpacing(shape_rows2, false);
    const verInfo = verFindTidyUp(shape_rows, space.hor, space.ver);
    if (!verInfo.tidyup) {
        return verInfo;
    } else {
        const verInfo2 = verFindTidyUp(shape_rows2, space2.hor, space2.ver);
        if (!verInfo2.tidyup) return verInfo2;
    }

    const horInfo = horFindTidyUp(shape_rows, space.hor, space.ver);
    if (!horInfo.tidyup) {
        return horInfo;
    } else {
        const horInfo2 = horFindTidyUp(shape_rows2, space2.hor, space2.ver);
        if (!horInfo2.tidyup) return horInfo2;
    }
    return horInfo;
}

export const hiddenTidyUp = (shapes: ShapeView[]) => {
    const pId = shapes[0].parent!.id;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const parent = shape.parent!
        if ((parent as ArtboradView).autoLayout || pId !== parent.id) {
            return true;
        }
    }
    return false;
}

function verFindTidyUp(shape_rows: ShapeView[][], hor: number, ver: number) {
    const minX = Math.min(...shape_rows[0].map(s => s._p_frame.x));
    const minY = Math.min(...shape_rows[0].map(s => s._p_frame.y));
    let leftTrans = minX;
    let topTrans = minY;
    let istidyup = false;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        // 更新当前行的最大宽度
        const maxWidthInRow = Math.max(...shape_row.map(s => s._p_frame.width));
        for (let i = 0; i < shape_row.length; i++) {
            const shape = shape_row[i];
            const frame = shape._p_frame;
            const parent = shape.parent!;
            let transx = 0;
            let transy = 0;
            // 设置新的 x 和 y 坐标
            const horizontalOffset = (maxWidthInRow - frame.width) / 2;
            if (parent.type === ShapeType.Page) {
                const m = parent.matrix2Root();
                const box = m.computeCoord2(shape._p_frame.x, shape._p_frame.y);
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
    return { tidyup: istidyup, hor, ver, shapes: shape_rows, dir: true };
}
function horFindTidyUp(shape_rows: ShapeView[][], hor: number, ver: number) {
    const minX = Math.min(...shape_rows[0].map(s => s._p_frame.x));
    const minY = Math.min(...shape_rows[0].map(s => s._p_frame.y));
    let leftTrans = minX;
    let topTrans = minY;
    let istidyup = false;
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        // 更新当前行的最大高度
        const maxHeightInRow = Math.max(...shape_row.map(s => s._p_frame.height));
        for (let j = 0; j < shape_row.length; j++) {
            const shape = shape_row[j];
            const frame = shape._p_frame;
            const parent = shape.parent!;
            let transx = 0;
            let transy = 0;
            // 设置新的 x 和 y 坐标
            const verticalOffset = (maxHeightInRow - frame.height) / 2;
            if (parent.type === ShapeType.Page) {
                const m = parent.matrix2Root();
                const box = m.computeCoord2(shape._p_frame.x, shape._p_frame.y);
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
    return { tidyup: istidyup, hor, ver, shapes: shape_rows, dir: false };
}

export const getFrame = (shape: ShapeView) => {
    let f = getShapeFrame(shape.data);
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
