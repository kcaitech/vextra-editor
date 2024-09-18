import { ColVector3D, makeShapeTransform2By1, Matrix, ShapeView } from "@kcdesign/data";
import { TransformHandler } from "./handler";
import { Context } from "@/context";
import { tidyUpShapesOrder } from "@/utils/tidy_up";
import { XY } from "@/context/selection";

export class TidyUpHandle extends TransformHandler {
    private m_shapes: ShapeView[] = [];
    private m_dir: boolean = false;
    private m_shape_rows: ShapeView[][] = [];
    private m_shapes_map_points: XY[][] = [];
    private cur_at_index: { row: number, col: number } = { row: 0, col: 0 }

    constructor(context: Context, event: MouseEvent, dir: boolean) {
        super(context, event);
        this.m_dir = dir;
        this.getOrderShapes();
        this.getShapeAtIndex(event);
    }

    getOrderShapes() {
        const selected = this.context.selection.selectedShapes;
        const shape_rows = tidyUpShapesOrder(selected, this.m_dir);
        this.m_shape_rows = shape_rows;
        if (this.m_dir) {
            this.m_shapes_map_points = this.getShapesColsMapPosition(shape_rows);
        } else {
            this.m_shapes_map_points = this.getShapesRowsMapPosition(shape_rows);
        }
    }

    getShapeAtIndex(e: MouseEvent) {
        const xy = this.context.workspace.getContentXY(e);
        for (let i = 0; i < this.m_shapes_map_points.length; i++) {
            const points = this.m_shapes_map_points[i];
            let exit = false;
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                if (xy.x < point.x && xy.y < point.y) {
                    this.cur_at_index = { row: i, col: j }
                    exit = true;
                    break;
                }
            }
            if (exit) break;
        }
    }



    getShapesRowsMapPosition(shape_rows: ShapeView[][]): XY[][] {
        const shapes_rows_point_map = [];
        for (let i = 0; i < shape_rows.length - 1; i++) {
            const shape_row = shape_rows[i];
            const row = [];
            const cur_row_h = Math.max(...shape_row.map(s => s._p_frame.y + s._p_frame.height));
            const next_min_y = Math.min(...shape_rows[i + 1].map(s => s._p_frame.y));
            const col_space = next_min_y - cur_row_h;
            const maxh_shape = shape_row.find(s => s._p_frame.y + s._p_frame.height === cur_row_h);
            if (!maxh_shape) continue;
            const matrix = new Matrix();
            const matrix2 = new Matrix(this.context.workspace.matrix);
            matrix.reset(matrix2);
            const shape_root_m = maxh_shape.matrix2Root();
            const m = makeShapeTransform2By1(shape_root_m).clone();
            const clientTransform = makeShapeTransform2By1(matrix2);
            m.addTransform(clientTransform); //root到视图
            const grid_point_y = m.transform([
                ColVector3D.FromXY(0, maxh_shape._p_frame.height + (col_space / 2)),
            ]).col0.y;
            for (let j = 0; j < shape_row.length; j++) {
                const shape = shape_row[j];
                const matrix = new Matrix();
                const matrix2 = new Matrix(this.context.workspace.matrix);
                matrix.reset(matrix2);
                const shape_root_m = shape.matrix2Root();
                const m = makeShapeTransform2By1(shape_root_m).clone();
                const clientTransform = makeShapeTransform2By1(matrix2);
                m.addTransform(clientTransform); //root到视图
                const { x, width } = shape._p_frame;
                let grid_point_x = 0;
                if (j === shape_row.length - 1) {
                    grid_point_x = Infinity;
                } else {
                    const row_space = shape_row[j + 1]._p_frame.x - (x + width);
                    grid_point_x = m.transform([
                        ColVector3D.FromXY(width + (row_space / 2), 0),
                    ]).col0.x;
                }
                const point = { x: grid_point_x, y: grid_point_y }
                row.push(point);
            }
            shapes_rows_point_map.push(row);
        }
        const end_row = [];
        const end_shape_row = shape_rows[shape_rows.length - 1];
        for (let j = 0; j < end_shape_row.length; j++) {
            const shape = end_shape_row[j];
            const matrix = new Matrix();
            const matrix2 = new Matrix(this.context.workspace.matrix);
            matrix.reset(matrix2);
            const shape_root_m = shape.matrix2Root();
            const m = makeShapeTransform2By1(shape_root_m).clone();
            const clientTransform = makeShapeTransform2By1(matrix2);
            m.addTransform(clientTransform); //root到视图
            const { x, width } = shape._p_frame;
            let grid_point_x = 0;
            if (j === end_shape_row.length - 1) {
                grid_point_x = Infinity;
            } else {
                const row_space = end_shape_row[j + 1]._p_frame.x - (x + width);
                grid_point_x = m.transform([
                    ColVector3D.FromXY(width + (row_space / 2), 0),
                ]).col0.x;
            }
            const point = { x: grid_point_x, y: Infinity }
            end_row.push(point);
        }
        shapes_rows_point_map.push(end_row);
        return shapes_rows_point_map;
    }
    getShapesColsMapPosition(shape_rows: ShapeView[][]): XY[][] {
        const shapes_cols_point_map = [];
        for (let i = 0; i < shape_rows.length - 1; i++) {
            const shape_row = shape_rows[i];
            const col = [];
            const cur_col_w = Math.max(...shape_row.map(s => s._p_frame.x + s._p_frame.width));
            const next_min_x = Math.min(...shape_rows[i + 1].map(s => s._p_frame.x));
            const row_space = next_min_x - cur_col_w;
            const maxw_shape = shape_row.find(s => s._p_frame.x + s._p_frame.width === cur_col_w);
            if (!maxw_shape) continue;
            const matrix = new Matrix();
            const matrix2 = new Matrix(this.context.workspace.matrix);
            matrix.reset(matrix2);
            const shape_root_m = maxw_shape.matrix2Root();
            const m = makeShapeTransform2By1(shape_root_m).clone();
            const clientTransform = makeShapeTransform2By1(matrix2);
            m.addTransform(clientTransform); //root到视图
            const grid_point_x = m.transform([
                ColVector3D.FromXY(maxw_shape._p_frame.width + (row_space / 2), 0),
            ]).col0.x;
            for (let j = 0; j < shape_row.length; j++) {
                const shape = shape_row[j];
                const matrix = new Matrix();
                const matrix2 = new Matrix(this.context.workspace.matrix);
                matrix.reset(matrix2);
                const shape_root_m = shape.matrix2Root();
                const m = makeShapeTransform2By1(shape_root_m).clone();
                const clientTransform = makeShapeTransform2By1(matrix2);
                m.addTransform(clientTransform); //root到视图
                const { y, height } = shape._p_frame;
                let grid_point_y = 0;
                if (j === shape_row.length - 1) {
                    grid_point_y = Infinity;
                } else {
                    const clo_space = shape_row[j + 1]._p_frame.y - (y + height);
                    grid_point_y = m.transform([
                        ColVector3D.FromXY(0, height + (clo_space / 2)),
                    ]).col0.y;
                }
                const point = { x: grid_point_x, y: grid_point_y }
                col.push(point);
            }
            shapes_cols_point_map.push(col);
        }
        const end_col = [];
        const end_shape_col = shape_rows[shape_rows.length - 1];
        for (let j = 0; j < end_shape_col.length; j++) {
            const shape = end_shape_col[j];
            const matrix = new Matrix();
            const matrix2 = new Matrix(this.context.workspace.matrix);
            matrix.reset(matrix2);
            const shape_root_m = shape.matrix2Root();
            const m = makeShapeTransform2By1(shape_root_m).clone();
            const clientTransform = makeShapeTransform2By1(matrix2);
            m.addTransform(clientTransform); //root到视图
            const { y, height } = shape._p_frame;
            let grid_point_y = 0;
            if (j === end_shape_col.length - 1) {
                grid_point_y = Infinity;
            } else {
                const clo_space = end_shape_col[j + 1]._p_frame.y - (y + height);
                grid_point_y = m.transform([
                    ColVector3D.FromXY(0, height + (clo_space / 2)),
                ]).col0.y;
            }
            const point = { x: Infinity, y: grid_point_y }
            end_col.push(point);
        }
        shapes_cols_point_map.push(end_col);
        return shapes_cols_point_map;
    }
}