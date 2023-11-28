import {Watchable} from "@kcdesign/data";
import {Context} from ".";

export type PointEditType = 'RA' | 'CS' | 'AS' | 'A' | 'INVALID'

export class Path extends Watchable(Object) {
    static SELECTION_CHANGE = 1;
    static SELECTION_CHANGE_P = 2;
    static SELECTION_CHANGE_S = 3;
    static POINT_TYPE_CHANGE = 4;
    private m_context: Context;
    private selected_points: number[] = [];
    private selected_sides: number[] = [];
    private point_type: PointEditType = 'INVALID';

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get pointType() {
        return this.point_type;
    }

    setPointType(v: PointEditType) {
        this.point_type = v;
        this.notify(Path.POINT_TYPE_CHANGE);
    }

    get selectedPoints() {
        return this.selected_points;
    }

    is_selected(index: number) {
        return this.selectedPoints.findIndex((i) => i === index) > -1;
    }

    select_point(index: number) {
        this.selected_points.length = 0;
        this.selected_points.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    select_points(indexes: number[]) {
        this.selected_points.length = 0;
        this.selected_points.push(...indexes);
        this.notify(Path.SELECTION_CHANGE);
    }

    adjust_points(index: number) {
        let al = -1;
        for (let i = this.selected_points.length - 1; i > -1; i--) {
            if (this.selected_points[i] === index) {
                al = i;
                break;
            }
        }
        if (al > -1) {
            this.selected_points.splice(al, 1);
        } else {
            this.selected_points.push(index);
        }
        this.notify(Path.SELECTION_CHANGE);
    }

    push_after_sort_points(index: number) {
        for (let i = this.selected_points.length - 1; i > -1; i--) {
            if (this.selected_points[i] >= index) this.selected_points[i]++;
        }
        this.selected_points.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    reset_points() {
        this.selected_points.length = 0;
        this.notify(Path.SELECTION_CHANGE);
    }

    select_side(index: number) {
        this.selected_sides.length = 0;
        this.selected_sides.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    select_sides(indexes: number[]) {
        this.selected_sides.length = 0;
        this.selected_sides.push(...indexes);
        this.notify(Path.SELECTION_CHANGE);
    }

    adjust_sides(index: number) {
        let al = -1;
        for (let i = this.selected_sides.length - 1; i > -1; i--) {
            if (this.selected_sides[i] === index) {
                al = i;
                break;
            }
        }
        if (al > 0) {
            this.selected_sides.splice(al, 1);
        } else {
            this.selected_sides.push(index);
        }
        this.notify(Path.SELECTION_CHANGE);
    }
}