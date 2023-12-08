import { ShapeFrame, Matrix, Path, parsePath } from "@kcdesign/data";
import { ShapeDom, matrix2parent, transformPoints } from "./shape";

export class PathShapeDom extends ShapeDom {

    updateRectangle(scaleX: number, scaleY: number): void {

    }

    updateDiamond(scaleX: number, scaleY: number, rotate: number, vflip: boolean, hflip: boolean, bbox: ShapeFrame, m: Matrix): void {
        const shape = this.m_data;
        m.preScale(shape.frame.width, shape.frame.height); // points投影到parent坐标系的矩阵

        const matrix2 = matrix2parent(bbox.x, bbox.y, bbox.width, bbox.height, 0, false, false);
        matrix2.preScale(bbox.width, bbox.height); // 当对象太小时，求逆矩阵会infinity
        m.multiAtLeft(matrix2.inverse); // 反向投影到新的坐标系

        const points = transformPoints(shape.points, m); // 新的points
        this.m_path = new Path(parsePath(points, shape.isClosed, 0, 0, this.m_frame.width, this.m_frame.height, shape.fixedRadius)).toString()
    }
}