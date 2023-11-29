<script setup lang="ts">
import Rect from "@/components/Document/Toolbar/Buttons/Rect.vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { __angle, __anther_side_xy, __round_curve_point } from "@/utils/pathedit";
import { Path } from "@/context/path";
import { WorkSpace } from "@/context/workspace";
import { AsyncPathHandle, Matrix } from "@kcdesign/data";
import { add_blur_for_window, add_move_and_up_for_document, remove_blur_from_window, remove_move_and_up_from_document } from "@/utils/mouse_interactive";
import { CurvePoint } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { check_drag_action } from "@/utils/mouse";

interface Props {
    context: Context
}
type ActionHandle = 'pre-to' | 'pre-from' | 'current-to' | 'current-from' | 'next-to' | 'next-from';
const props = defineProps<Props>();

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

let matrix_at_down = new Matrix();
let inverse_matrix_at_down = new Matrix();
let action_curve_point: CurvePoint;
let side: 'from' | 'to';
let drag: boolean = false;
let down_site: XY = {x: 0, y: 0};
let asyncEditor: AsyncPathHandle | undefined = undefined;
let down_index: number = -1;
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
    const __points = path_shape.points;
    const selected = props.context.path.selectedPoints;
    if (selected.length !== 1) {
        return;
    }
    // current
    const index = selected[0];
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

    const { previous: __pre, next: __next, previous_index: _pi, next_index: _ni } = __round_curve_point(path_shape, index);

    // previous
    if (__pre && __pre.id !== current_point.id) {
        previous.value = true;
        previous_curve_point.value = __pre;
        previous_index.value = _pi;
        const __p = m.computeCoord2(__pre.x, __pre.y);
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
        const __p = m.computeCoord2(__next.x, __next.y);
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

function down(e: MouseEvent, side: ActionHandle) {
    e.stopPropagation();
    e.preventDefault();
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
    modify_side(side);
    modify_down_site(e);
    inverse_matrix_at_down = new Matrix(props.context.path.matrix_unit_to_root.inverse);
    add_move_and_up_for_document(move, up);
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
    if (drag && asyncEditor) {
        const root = props.context.workspace.root;
        const xy = { x: e.clientX - root.x, y: e.clientY - root.y };
        const current_handle_point = inverse_matrix_at_down.computeCoord3(xy);
        const anther = __anther_side_xy(action_curve_point, current_handle_point, side);
        const current_is_from = side === 'from';
        const from = current_is_from ? current_handle_point : anther;
        const to = current_is_from ? anther : current_handle_point;
        asyncEditor.execute(side, from, to);

    } else if (check_drag_action(down_site, {x: e.clientX, y: e.clientY})) {
        const page = props.context.selection.selectedPage!;
        const path_shape = props.context.selection.pathshape;
        if (!path_shape) {
            return;
        }
        asyncEditor = props.context.editor.controller().asyncPathHandle(path_shape, page, down_index);
        drag = true;
    }
}
function up() {
    drag = false;
    if (asyncEditor) {
        asyncEditor.close();
        asyncEditor = undefined;
    }
    remove_move_and_up_from_document(move, up);
}

function path_selection_watcher(t: number) {
    if (t === Path.SELECTION_CHANGE) {
        update();
    }
}

function shape_watcher(t: any) {
    update();
}

function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

function window_blur() {
    drag = false;
    if (asyncEditor) {
        asyncEditor.abort();
        asyncEditor = undefined;
    }
    remove_move_and_up_from_document(move, up);
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
                :y2="previous_apex_location_from.y" class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point" @mousedown="(e) => { down(e, 'pre-from') }"
                :transform="`translate(${previous_apex_location_from.x}, ${previous_apex_location_from.y}) rotate(${__radius_pre_from}) translate(-4, -4)`">
            </rect>
        </g>
        <g v-if="previous_to">
            <line :x1="previous_site.x" :y1="previous_site.y" :x2="previous_apex_location_to.x"
                :y2="previous_apex_location_to.y" class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point"
                :transform="`translate(${previous_apex_location_to.x}, ${previous_apex_location_to.y}) rotate(${__radius_pre_to}) translate(-4, -4)`"
                @mousedown="(e) => { down(e, 'pre-to') }"></rect>
        </g>
    </g>
    <!--  当前点  -->
    <g v-if="current">
        <g v-if="current_from">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_from.x" :y2="apex_location_from.y" class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point" @mousedown="(e) => { down(e, 'current-from') }"
                :transform="`translate(${apex_location_from.x}, ${apex_location_from.y}) rotate(${__radius_current_from}) translate(-4, -4)`">
            </rect>
        </g>
        <g v-if="current_to">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_to.x" :y2="apex_location_to.y" class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point" @mousedown="(e) => { down(e, 'current-to') }"
                :transform="`translate(${apex_location_to.x}, ${apex_location_to.y}) rotate(${__radius_current_to}) translate(-4, -4)`">
            </rect>
        </g>
    </g>
    <!-- 后一个点 -->
    <g v-if="next">
        <g v-if="next_from">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_from.x" :y2="next_apex_location_from.y"
                class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point" @mousedown="(e) => { down(e, 'next-from') }"
                :transform="`translate(${next_apex_location_from.x}, ${next_apex_location_from.y}) rotate(${__radius_next_from}) translate(-4, -4)`">
            </rect>
        </g>
        <g v-if="next_to">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_to.x" :y2="next_apex_location_to.y"
                class="line"></line>
            <rect x="0" y="0" width="8" height="8" class="point" @mousedown="(e) => { down(e, 'next-to') }"
                :transform="`translate(${next_apex_location_to.x}, ${next_apex_location_to.y}) rotate(${__radius_next_to}) translate(-4, -4)`">
            </rect>
        </g>
    </g>
</template>
<style scoped lang="scss">
.line {
    stroke: #ccc;
    stroke-width: 2px;
    fill: none;
}

.point {
    fill: #fff;
    stroke: var(--theme-color);
    stroke-width: 1px;
}
</style>