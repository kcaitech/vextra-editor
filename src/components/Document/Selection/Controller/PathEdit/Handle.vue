/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { __angle, __anther_side_xy, __round_curve_point } from "@/utils/pathedit";
import { Path } from "@/context/path";
import { WorkSpace } from "@/context/workspace";
import { Matrix, PathShapeView, PathType } from "@kcaitech/vextra-core";
import {
    add_blur_for_window,
    add_move_and_up_for_document,
    remove_blur_from_window,
    remove_move_and_up_from_document
} from "@/utils/mouse_interactive";
import { CurvePoint } from "@kcaitech/vextra-core";
import { XY } from "@/context/selection";
import { check_drag_action } from "@/utils/mouse";
import { PathEditor } from "@/path/pathEdit";

interface Props {
    context: Context
}

type ActionHandle = 'pre-to' | 'pre-from' | 'current-to' | 'current-from' | 'next-to' | 'next-from';
const props = defineProps<Props>();

let segment = -1;

const previous = ref<boolean>(false);
const previous_curve_point = ref<CurvePoint>();
const previous_from = ref<boolean>(false);
const previous_to = ref<boolean>(false);
const previous_apex_location_from = reactive({ x: -10, y: -10 });
const previous_apex_location_to = reactive({ x: -10, y: -10 });
const previous_site = reactive({ x: -10, y: -10 });
const __radius_pre_from = ref<number>(0);
const __radius_pre_to = ref<number>(0);
const previous_index = ref<number>(-1);

const current = ref<boolean>(false);
const current_curve_point = ref<CurvePoint>();
const current_from = ref<boolean>(false);
const current_to = ref<boolean>(false);
const apex_location_from = reactive({ x: -10, y: -10 });
const apex_location_to = reactive({ x: -10, y: -10 });
const site = reactive({ x: -10, y: -10 });
const __radius_current_from = ref<number>(0);
const __radius_current_to = ref<number>(0);
const current_index = ref<number>(-1);

const next = ref<boolean>(false);
const next_curve_point = ref<CurvePoint>();
const next_from = ref<boolean>(false);
const next_to = ref<boolean>(false);
const next_apex_location_from = reactive({ x: -10, y: -10 });
const next_apex_location_to = reactive({ x: -10, y: -10 });
const next_site = reactive({ x: -10, y: -10 });
const __radius_next_from = ref<number>(0);
const __radius_next_to = ref<number>(0);
const next_index = ref<number>(-1);

let inverse_matrix_at_down = new Matrix();
let action_curve_point: CurvePoint;
let side: 'from' | 'to';
let drag: boolean = false;
let down_site: XY = { x: 0, y: 0 };
let down_index: number = -1;

let is_bridging_action: boolean = false;

let _move: any;
let _up: any;

let pathModifier: PathEditor | undefined;

let bridgeFromPen: boolean = false;

function reset() {
    previous.value = false;
    previous_from.value = false;
    previous_to.value = false;
    __radius_pre_from.value = 0;
    __radius_pre_to.value = 0;
    previous_index.value = -1;

    current.value = false;
    current_from.value = false;
    current_to.value = false;
    __radius_current_from.value = 0;
    __radius_current_to.value = 0;
    current_index.value = -1;

    next.value = false;
    next_from.value = false;
    next_to.value = false;
    __radius_next_from.value = 0;
    __radius_next_to.value = 0;
    next_index.value = -1;
}

function update() {
    reset();
    const path_shape = props.context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    const m = props.context.path.matrix_unit_to_root;

    let __points: CurvePoint[] = [];
    let selected: number[] = [];

    if (path_shape.pathType !== PathType.Editable) {
        return;
    }

    const __segment = [...props.context.path.selectedPoints.keys()].pop();
    if (__segment === undefined || __segment < 0) {
        return;
    }
    __points = (path_shape as PathShapeView)?.segments[__segment]?.points as CurvePoint[];

    if (!__points?.length) {
        return;
    }

    selected = [...props.context.path.selectedPoints.values()].pop() || [];

    segment = __segment;

    // current
    const index = selected[selected.length - 1];
    if (index < 0) {
        return;
    }

    const current_point = __points[index];
    if (!current_point) {
        return;
    }

    current_curve_point.value = current_point;
    current.value = true;
    current_index.value = index;

    const _p = m.computeCoord2(current_point.x, current_point.y);
    site.x = _p.x;
    site.y = _p.y;

    if (current_point.hasFrom && current_point.fromX !== undefined && current_point.fromY !== undefined) {
        current_from.value = true;
        const _cf = m.computeCoord2(current_point.fromX, current_point.fromY);
        apex_location_from.x = _cf.x;
        apex_location_from.y = _cf.y;
        __radius_current_from.value = __angle(site.x, site.y, apex_location_from.x, apex_location_from.y);
    }

    if (current_point.hasTo && current_point.toX !== undefined && current_point.toY !== undefined) {
        current_to.value = true;
        const _ct = m.computeCoord2(current_point.toX, current_point.toY);
        apex_location_to.x = _ct.x;
        apex_location_to.y = _ct.y;
        __radius_current_to.value = __angle(site.x, site.y, apex_location_to.x, apex_location_to.y);
    }

    const {
        previous: __pre,
        next: __next,
        previous_index: _pi,
        next_index: _ni
    } = __round_curve_point(__points, index);

    // previous
    if (__pre && __pre.id !== current_point.id) {
        previous.value = true;
        previous_curve_point.value = __pre;
        previous_index.value = _pi;
        const __p = m.computeCoord3(__pre);
        previous_site.x = __p.x;
        previous_site.y = __p.y;
        if (__pre.hasFrom && __pre.fromX !== undefined && __pre.fromY !== undefined) {
            previous_from.value = true;
            const __p = m.computeCoord2(__pre.fromX, __pre.fromY);
            previous_apex_location_from.x = __p.x;
            previous_apex_location_from.y = __p.y;
            __radius_pre_from.value = __angle(previous_site.x, previous_site.y, __p.x, __p.y);
        }
    }

    // next
    if (__next && __next.id !== current_point.id) {
        next.value = true;
        next_curve_point.value = __next;
        next_index.value = _ni;
        const __p = m.computeCoord3(__next);
        next_site.x = __p.x;
        next_site.y = __p.y;
        if (__next.hasTo && __next.toX !== undefined && __next.toY !== undefined) {
            next_to.value = true;
            const __p = m.computeCoord2(__next.toX, __next.toY);
            next_apex_location_to.x = __p.x;
            next_apex_location_to.y = __p.y;
            __radius_next_to.value = __angle(next_site.x, next_site.y, __p.x, __p.y);
        }
    }
}

function modify_f_pointer(move: any, up: any) {
    _move = move;
    _up = up;
}

function modify_action_curve_point(side: ActionHandle) {
    if (side.startsWith('pre')) {
        action_curve_point = previous_curve_point.value!;
        down_index = previous_index.value;
    } else if (side.startsWith('current')) {
        action_curve_point = current_curve_point.value!;
        down_index = current_index.value;
    } else if (side.startsWith('next')) {
        action_curve_point = next_curve_point.value!;
        down_index = next_index.value;
    }
}

function down(e: MouseEvent, side: ActionHandle) {
    e.stopPropagation();
    e.preventDefault();
    modify_action_curve_point(side);
    modify_side(side);
    modify_down_site(e);
    modify_inverse_matrix_at_down();
    add_move_and_up_for_document(move, up);
    modify_f_pointer(move, up);
}

function modify_inverse_matrix_at_down() {
    inverse_matrix_at_down = new Matrix(props.context.path.matrix_unit_to_root.inverse);
}

function modify_side(s: ActionHandle) {
    if (s.endsWith('from')) {
        side = 'from';
    } else {
        side = 'to';
    }
}

function modify_down_site(e: MouseEvent) {
    down_site.x = e.clientX;
    down_site.y = e.clientY;
}

function move(e: MouseEvent) {
    if (drag && action_curve_point) {
        const root = props.context.workspace.root;
        const xy = { x: e.clientX - root.x, y: e.clientY - root.y };
        const current_handle_point = inverse_matrix_at_down.computeCoord3(xy);
        const anther = __anther_side_xy(action_curve_point, current_handle_point, side);
        const current_is_from = side === 'from';
        const from = current_is_from ? current_handle_point : anther;
        const to = current_is_from ? anther : current_handle_point;

        pathModifier?.execute4handle(down_index, side, from, to, segment);
    } else if (check_drag_action(down_site, { x: e.clientX, y: e.clientY })) {
        init_editor(e);
        drag = true;
    }
}

function pre_bridging() {
    const path_shape = props.context.selection.pathshape;
    if (!path_shape) return;
    const { event } = props.context.path.bridging_events || {};
    if (!event) {
        bridging_completed();
        return;
    }
    event.stopPropagation();
    event.preventDefault();
    is_bridging_action = true;
    modify_down_site(event);
    modify_action_curve_point('current-from');
    modify_inverse_matrix_at_down();
    add_move_and_up_for_document(move2, up);
    modify_f_pointer(move2, up);
    init_editor(event);
    __pre();
    update();
    modify_side2(event);
}

function init_editor(e: MouseEvent) {
    if (pathModifier) {
        return;
    }
    const param = props.context.path.bridgeParam;
    if (param) {
        pathModifier = param.handler;
        props.context.path.setBridgeParams(undefined);
        bridgeFromPen = true;
    } else {
        pathModifier = new PathEditor(props.context, e, PathEditor.FULL_MAP);
        pathModifier.createApiCaller();
    }
}

function __pre() {
    if (bridgeFromPen) {
        pathModifier?.execute4handlePreForPen(down_index, segment);

    } else {
        pathModifier?.execute4handlePre(down_index, segment);
    }
}

function __distance(e: MouseEvent, p: XY) {
    const root = props.context.workspace.root;
    return Math.hypot(e.clientX - root.x - p.x, e.clientY - root.y - p.y);
}

function modify_side2(e: MouseEvent) {
    const distance_to_from = __distance(e, apex_location_from);
    const distance_to_to = __distance(e, apex_location_to);
    side = distance_to_from > distance_to_to ? 'to' : 'from';
}

function move2(e: MouseEvent) {
    if (!action_curve_point) {
        return;
    }

    const root = props.context.workspace.root;
    const xy = { x: e.clientX - root.x, y: e.clientY - root.y };
    const current_handle_point = inverse_matrix_at_down.computeCoord3(xy);
    const anther = __anther_side_xy(action_curve_point, current_handle_point, side);
    const current_is_from = side === 'from';
    const from = current_is_from ? current_handle_point : anther;
    const to = current_is_from ? anther : current_handle_point;
    pathModifier?.execute4handle(down_index, side, from, to, segment);
}

function bridging_completed() {
    props.context.path.bridging_completed();
    is_bridging_action = false;
}

function clear_state() {
    drag = false;

    pathModifier?.fulfil();
    pathModifier = undefined;

    if (is_bridging_action) {
        bridging_completed();
    }
    remove_move_and_up_from_document(_move, _up);
}

function up() {
    clear_state();
}

function path_selection_watcher(t: number) {
    switch (t) {
        case Path.SELECTION_CHANGE:
            update();
            break;
        case Path.BRIDGING:
            pre_bridging();
            break;
    }
}

function shape_watcher() {
    update();
}

function matrix_watcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

function window_blur() {
    clear_state();
}

onMounted(() => {
    props.context.path.watch(path_selection_watcher);
    props.context.selection.pathshape?.watch(shape_watcher);
    props.context.workspace.watch(matrix_watcher);
    add_blur_for_window(window_blur);
    update();
})
onUnmounted(() => {
    props.context.path.unwatch(path_selection_watcher);
    props.context.selection.pathshape?.unwatch(shape_watcher);
    props.context.workspace.unwatch(matrix_watcher);
    remove_blur_from_window(window_blur);
})
</script>
<template>
    <!-- 前一个点 -->
    <g v-if="previous">
        <g v-if="previous_from">
            <line :x1="previous_site.x" :y1="previous_site.y" :x2="previous_apex_location_from.x"
                  :y2="previous_apex_location_from.y" class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point" @mousedown="(e) => { down(e, 'pre-from') }"
                  :transform="`translate(${previous_apex_location_from.x}, ${previous_apex_location_from.y}) rotate(${__radius_pre_from}) translate(-3, -3)`"/>
        </g>
        <g v-if="previous_to">
            <line :x1="previous_site.x" :y1="previous_site.y" :x2="previous_apex_location_to.x"
                  :y2="previous_apex_location_to.y" class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point"
                  :transform="`translate(${previous_apex_location_to.x}, ${previous_apex_location_to.y}) rotate(${__radius_pre_to}) translate(-3, -3)`"
                  @mousedown="(e) => { down(e, 'pre-to') }"/>
        </g>
    </g>
    <!--  当前点  -->
    <g v-if="current">
        <g v-if="current_from">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_from.x" :y2="apex_location_from.y" class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point" @mousedown="(e) => { down(e, 'current-from') }"
                  :transform="`translate(${apex_location_from.x}, ${apex_location_from.y}) rotate(${__radius_current_from}) translate(-3, -3)`"/>
        </g>
        <g v-if="current_to">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_to.x" :y2="apex_location_to.y" class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point" @mousedown="(e) => { down(e, 'current-to') }"
                  :transform="`translate(${apex_location_to.x}, ${apex_location_to.y}) rotate(${__radius_current_to}) translate(-3, -3)`"/>
        </g>
    </g>
    <!-- 后一个点 -->
    <g v-if="next">
        <g v-if="next_from">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_from.x" :y2="next_apex_location_from.y"
                  class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point" @mousedown="(e) => { down(e, 'next-from') }"
                  :transform="`translate(${next_apex_location_from.x}, ${next_apex_location_from.y}) rotate(${__radius_next_from}) translate(-3, -3)`"/>
        </g>
        <g v-if="next_to">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_to.x" :y2="next_apex_location_to.y"
                  class="line"/>
            <rect x="0" y="0" width="6" height="6" class="point" @mousedown="(e) => { down(e, 'next-to') }"
                  :transform="`translate(${next_apex_location_to.x}, ${next_apex_location_to.y}) rotate(${__radius_next_to}) translate(-3, -3)`"/>
        </g>
    </g>
</template>
<style scoped lang="scss">
.line {
    stroke: #ccc;
    fill: none;
}

.point {
    fill: #fff;
    stroke: var(--active-color);
}
</style>