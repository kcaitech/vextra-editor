import {
    CurveMode,
    CurvePoint,
    Matrix,
    PathShapeView,
    PathType,
    WatchableObject
} from "@kcdesign/data";
import { Context } from ".";
import { Segment } from "@/utils/pathedit";
import { Action } from "./tool";

export type PointEditType = CurveMode | 'INVALID'

export class Path extends WatchableObject {
    static SELECTION_CHANGE = 1;
    static SELECTION_CHANGE_P = 2;
    static SELECTION_CHANGE_S = 3;
    static POINT_TYPE_CHANGE = 4;
    static CLEAR_HIGH_LIGHT = 5;
    static BRIDGING = 6;
    static BRIDGING_COMPLETED = 7;

    private m_context: Context;

    private selected_points: Map<number, number[]> = new Map();
    private selected_sides: Map<number, number[]> = new Map();

    private is_selecting: boolean = false;
    private is_editing: boolean = false;
    private m_segments: Segment[][] = [];

    private m_bridging_events: { segment: number, index: number, event: MouseEvent } | undefined = undefined;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get selectedPoints() {
        return this.selected_points;
    }

    get selectedPointsLength() {
        return Array.from(this.selected_points.values()).flat().length;
    }

    get syntheticPoints() {
        const pathShape = this.m_context.selection.selectedShapes[0];
        const pathType = pathShape?.pathType;

        const result: Map<number, Set<number>> = new Map();

        this.selected_points.forEach((indexes, segment) => {
            result.set(segment, new Set(indexes));
        })

        if (!pathType) {
            return this.selected_points;
        }

        if (!this.selected_sides.size) {
            return this.selected_points;
        }

        this.selected_sides.forEach((indexes, segment) => {
            let points = result.get(segment);
            if (!points) {
                points = new Set<number>();
                result.set(segment, points);
            }

            let max = 0;
            if (pathType === PathType.Editable) {
                max = (pathShape as PathShapeView).segments[segment]?.points?.length - 1;
            }

            if (max > -1) {
                for (let i = 0, l = indexes.length; i < l; i++) {
                    const index = indexes[i];
                    const anther = index === max ? 0 : index + 1;

                    points.add(index);
                    points.add(anther);
                }
            }
        });
        const __result = new Map<number, number[]>();
        result.forEach((indexes, segment) => {
            __result.set(segment, Array.from(indexes.values()));
        })

        return __result;
    }

    is_selected(segment: number, index: number) {
        const points = this.selected_points.get(segment);

        return !!points?.length && points.findIndex((i) => i === index) > -1;
    }

    select_point(segment: number, index: number) {
        this._reset();
        this.selected_points.set(segment, [index]);

        this.notify(Path.SELECTION_CHANGE);
    }

    select_points(segment: number, indexes: number[]) {
        this._reset();
        this.selected_points.set(segment, [...indexes]);

        this.notify(Path.SELECTION_CHANGE);
    }

    adjust_points(segment: number, index: number) {
        const points = this.selected_points.get(segment);

        if (!points?.length) {
            this.selected_points.set(segment, [index]);
        } else {
            let al = -1;
            for (let i = points.length - 1; i > -1; i--) {
                if (points[i] === index) {
                    al = i;
                    break;
                }
            }
            if (al > -1) {
                points.splice(al, 1);
            } else {
                points.push(index);
            }
        }

        this.notify(Path.SELECTION_CHANGE);
    }

    is_selected_segs(segment: number, index: number) {
        const sides = this.selected_sides.get(segment);
        return !!sides?.length && sides.findIndex((i) => i === index) > -1;
    }

    push_after_sort_points(segment: number, index: number) {
        const points = this.selected_points.get(segment);

        if (!points?.length) {
            return;
        }

        for (let i = points.length - 1; i > -1; i--) {
            if (points[i] >= index) {
                points[i]++;
            }
        }
        points.push(index);

        this.notify(Path.SELECTION_CHANGE);
    }

    reset_points() {
        const need_notify = this.selected_points.size;

        this.selected_points.clear();

        if (need_notify) {
            this.notify(Path.SELECTION_CHANGE);
        }
    }

    get selectedSides() {
        return this.selected_sides;
    }

    get selectedSidesLength() {
        return Array.from(this.selected_sides.values()).flat().length;
    }

    select_side(segment: number, index: number) {
        this._reset();

        this.selected_sides.set(segment, [index]);

        this.notify(Path.SELECTION_CHANGE);
    }

    select_sides(segment: number, indexes: number[]) {
        this._reset();

        this.selected_sides.set(segment, [...indexes]);

        this.notify(Path.SELECTION_CHANGE);
    }

    adjust_sides(segment: number, index: number) {
        const sides = this.selected_sides.get(segment);

        if (!sides?.length) {
            this.selected_sides.set(segment, [index]);
        } else {
            let al = -1;
            for (let i = sides.length - 1; i > -1; i--) {
                if (sides[i] === index) {
                    al = i;
                    break;
                }
            }
            if (al > 0) {
                sides.splice(al, 1);
            } else {
                sides.push(index);
            }
        }

        this.notify(Path.SELECTION_CHANGE);
    }

    select(indexes1: Map<number, Set<number>>, indexes2: Map<number, Set<number>>) {
        this._reset();
        indexes1.forEach((v, k) => {
            this.selected_points.set(k, Array.from(v.values()));
        })
        indexes2.forEach((v, k) => {
            this.selected_sides.set(k, Array.from(v.values()));
        })
        this.notify(Path.SELECTION_CHANGE);
    }

    reset_sides() {
        const need_notify = this.selected_sides.size;
        this.selected_sides.clear();

        if (need_notify) {
            this.notify(Path.SELECTION_CHANGE);
        }
    }

    _reset() {
        this.selected_points.clear();
        this.selected_sides.clear();
    }

    reset() {
        const need_notify = this.selected_points.size || this.selected_sides.size;
        this.selected_points.clear();
        this.selected_sides.clear();

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

    set_segments(segments: Segment[][]) {
        this.m_segments = segments;
    }

    get segments() {
        return this.m_segments;
    }

    bridging(event: { segment: number, index: number, event: MouseEvent }) {
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

    getCurvePoints() {
        const points: CurvePoint[] = [];
        const shape = this.m_context.selection.pathshape;
        if (!shape) {
            return points;
        }

        if (shape.pathType === PathType.Editable) {
            const segments = (shape as PathShapeView).segments;
            this.selected_points.forEach((indexes, segment) => {
                const __points = segments[segment]?.points as CurvePoint[];

                if (!__points?.length) {
                    return;
                }

                for (let i = 0; i < indexes.length; i++) {
                    const p = __points[indexes[i]];
                    if (p) {
                        points.push(p);
                    }
                }
            })
        }

        return points;
    }

    get isSingleSelection() {
        if (this.selected_sides.size) {
            return false;
        }
        if (this.selected_points.size === 1) {
            let result = false;
            this.selected_points.forEach(s => {
                result = s.length === 1;
            })
            return result;
        } else {
            return false;
        }
    }
}