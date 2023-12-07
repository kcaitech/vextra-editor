import { Matrix, Watchable } from "@kcdesign/data";
import { Context } from ".";
import { CurveMode } from "@kcdesign/data";
import { Segment } from "@/utils/pathedit";
import { Action } from "./tool";

export type PointEditType = CurveMode | 'INVALID'

export class Path extends Watchable(Object) {
    static SELECTION_CHANGE = 1;
    static SELECTION_CHANGE_P = 2;
    static SELECTION_CHANGE_S = 3;
    static POINT_TYPE_CHANGE = 4;
    static CLEAR_HIGH_LIGHT = 5;
    static BRIDGING = 6;
    static BRIDGING_COMPLETED = 7;

    private m_context: Context;
    private selected_points: number[] = [];
    private selected_sides: number[] = [];
    private is_selecting: boolean = false;
    private is_editing: boolean = false;
    private m_segments: Segment[] = [];
    private m_bridging_events: { index: number, event: MouseEvent } | undefined = undefined;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    get selectedPoints() {
        return this.selected_points;
    }

    get_synthetic_points(max: number) {
        if (!this.selectedSides.length) {
            return this.selected_points;
        }
        const points = [...this.selected_points];
        for (let i = 0, l = this.selected_sides.length; i < l; i++) {
            const index = this.selected_sides[i];
            const anther = index === max ? 0 : index + 1;
            points.push(index, anther);
        }
        return Array.from(new Set(points));
    }

    is_selected(index: number) {
        return this.selectedPoints.findIndex((i) => i === index) > -1;
    }

    select_point(index: number) {
        this._reset();
        this.selected_points.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    select_points(indexes: number[]) {
        this._reset();
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
    is_selected_segs(index: number) {
        return this.selected_sides.findIndex((i) => i === index) > -1;
    }
    push_after_sort_points(index: number) {
        for (let i = this.selected_points.length - 1; i > -1; i--) {
            if (this.selected_points[i] >= index) {
                this.selected_points[i]++;
            }
        }
        this.selected_points.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    reset_points() {
        const need_notify = this.selected_points.length;
        this.selected_points.length = 0;
        if (need_notify) {
            this.notify(Path.SELECTION_CHANGE);
        }
    }

    get selectedSides() {
        return this.selected_sides;
    }

    select_side(index: number) {
        this._reset();
        this.selected_sides.push(index);
        this.notify(Path.SELECTION_CHANGE);
    }

    select_sides(indexes: number[]) {
        this._reset();
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

    select(indexes1: number[], indexes2: number[]) {
        this._reset();
        this.selected_points.push(...indexes1);
        this.selected_sides.push(...indexes2);
        this.notify(Path.SELECTION_CHANGE);
    }

    reset_sides() {
        const need_notify = this.selected_sides.length;
        this.selected_sides.length = 0;
        if (need_notify) {
            this.notify(Path.SELECTION_CHANGE);
        }
    }
    _reset() {
        this.selected_points.length = 0;
        this.selected_sides.length = 0;
    }
    reset() {
        const need_notify = this.selected_points.length || this.selected_sides.length;
        this.selected_points.length = 0;
        this.selected_sides.length = 0;
        if (need_notify) {
            this.notify(Path.SELECTION_CHANGE);
        }
    }

    get matrix_unit_to_root() {
        const path_shape = this.m_context.selection.pathshape;
        if (!path_shape) return new Matrix();
        const f = path_shape.frame;
        const m = new Matrix(path_shape.matrix2Root());
        m.multiAtLeft(this.m_context.workspace.matrix);
        m.preScale(f.width, f.height);
        return m;
    }

    clear_highlight() {
        this.notify(Path.CLEAR_HIGH_LIGHT);
    }
    selecting(_val: boolean) {
        this.is_selecting = _val;
    }
    editing(_val: boolean) {
        this.is_editing = _val;
    }
    get no_hover() {
        return this.is_selecting || this.is_editing;
    }

    get no_add() {
        const action = this.m_context.tool.action;
        return this.no_hover || [Action.Curve, Action.PathClip].includes(action);
    }

    set_segments(segs: Segment[]) {
        this.m_segments = segs;
    }
    get segments() {
        return this.m_segments;
    }

    bridging(event: { index: number, event: MouseEvent }) {
        this.m_bridging_events = event;
        this.notify(Path.BRIDGING);
    }
    bridging_completed() {
        this.m_bridging_events = undefined;
        this.notify(Path.BRIDGING_COMPLETED);
    }
    get bridging_events() {
        return this.m_bridging_events;
    }
}