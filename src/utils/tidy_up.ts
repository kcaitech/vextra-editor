import { Context } from "@/context";
import { PageView, ShapeType, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "./common";

export function tidyUpShapesOrder(shapes: ShapeView[], verBase: boolean) {
    let shape_rows: ShapeView[][] = [];
    let unassignedShapes: ShapeView[] = [...shapes].filter(shape => shape.isVisible);

    while (unassignedShapes.length > 0) {
        // 找出 y + height 最小的图形作为基准图形
        const baseShape = unassignedShapes.reduce((minShape, shape) => {
            const frame = shape._p_frame;
            const min_frame = minShape._p_frame;
            if (verBase) {
                if(frame.x < min_frame.x) {
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
        // 将与基准图形相交的图形放入当前行
        const currentRow = unassignedShapes.filter(shape => {
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
        // 保存当前行的图形
        shape_rows.push(currentRow);

        // 从未分配图形中移除当前行的图形
        unassignedShapes = unassignedShapes.filter(shape => !currentRow.includes(shape));
    }
    return shape_rows;
}

export function layoutSpacing(shape_rows: ShapeView[][]) {
    let totalHorSpacing = 0; // 用于累计所有水平间距
    let totalVerSpacing = 0; // 用于累计所有垂直间距
    let horSpacingCount = 0; // 记录水平间距的总数
    let verSpacingCount = 0; // 记录垂直间距的总数

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
    // 计算平均水平间距并向下取整
    const averageHorSpacing = horSpacingCount > 0 ? Math.floor(totalHorSpacing / horSpacingCount) : 0;

    // 计算平均垂直间距并向下取整
    let averageVerSpacing = verSpacingCount > 0 ? Math.floor(totalVerSpacing / verSpacingCount) : 0;
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
    const lt = matrix.inverseCoord(b.left, b.top);
    const rb = matrix.inverseCoord(b.right, b.bottom);
    const width = Math.abs(rb.x - lt.x);
    const height = Math.abs(rb.y - lt.y);

    return { width, height }
}

export const whetherNeedTidyUp = (context: Context) => {
    const selected = context.selection.selectedShapes;
    const { width, height } = getSelectedWidthHeight(context, selected);
    const shape_rows = tidyUpShapesOrder(selected, height > width);
    const { ver, hor } = layoutSpacing(shape_rows);

    const frast_frame = shape_rows[0][0]._p_frame;
    let leftTrans = frast_frame.x; //水平起点
    let topTrans = frast_frame.y; //垂直起点
    for (let i = 0; i < shape_rows.length; i++) {
        const shape_row = shape_rows[i];
        // 更新当前行的最大高度
        const maxHeightInRow = Math.max(...shape_row.map(s => s._p_frame.height));
        for (let i = 0; i < shape_row.length; i++) {
            const shape = shape_row[i];
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
            if (transx !== 0 || transy !== 0) return { tidyup: true, hor, ver, shapes: shape_rows };
            leftTrans += frame.width + hor;
        }
        leftTrans = frast_frame.x; // 重置为左边距
        topTrans += maxHeightInRow + ver; // 换行，增加 y 坐标
    }
    return { tidyup: false, hor, ver, shapes: shape_rows };
}