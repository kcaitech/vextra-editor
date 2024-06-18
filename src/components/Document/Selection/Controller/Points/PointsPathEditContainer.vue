<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ClientXY, XY } from '@/context/selection';
import { get_path_by_point } from './common';
import { Path } from "@/context/path";
import { dbl_action } from "@/utils/mouse_interactive";
import { add_move_and_up_for_document } from "@/utils/mouse";
import { Segment, get_segments, modify_point_curve_mode } from "@/utils/pathedit";
import { WorkSpace } from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"
import { Action } from '@/context/tool';
import { PathEditor } from "@/transform/pathEdit";

interface Props {
    context: Context
}

interface Dot {
    point: { x: number, y: number }
    segment: number
    index: number
    selected: boolean
}

const props = defineProps<Props>();
const matrix = new Matrix();
const data: { dots: Dot[], segments: Segment[][] } = reactive({ dots: [], segments: [] });
const { dots, segments } = data;
const dragActiveDis = 3;
const new_high_light = ref<string>('');
const add_rect = ref<string>('');
let shape: ShapeView;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let move: any;
let bridged = false;

let pathModifier: PathEditor | undefined;
let downXY: XY = { x: 0, y: 0 };

let current_segment: number = -1;
let current_curve_point_index: number = -1;
let current_side: number = -1;

function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    dots.length = 0;
    segments.length = 0;

    init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);
}

function updatePassive() {
    dots.length = 0;
    segments.length = 0;

    init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);
}

/**
 * @description down下任意一个已有的编辑点
 */
function point_mousedown(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) {
        return;
    }

    if (dbl_action()) {
        modify_point_curve_mode(props.context, index);
        return;
    }

    event.stopPropagation();

    const path = props.context.path;
    if (event.shiftKey) {
        path.adjust_points(segment, index)
    } else {
        if (!path.is_selected(segment, index)) {
            path.select_point(segment, index, true);
        }
    }

    current_segment = segment;
    current_curve_point_index = index;

    pathModifier = new PathEditor(props.context, event, PathEditor.BORDER_MAP, true);
    downXY = { x: event.x, y: event.y };

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

    props.context.workspace.setSelectionViewUpdater(false);

    move = point_mousemove;
}

/**
 * @description 边
 */
function down_background_path(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) {
        return;
    }
    event.stopPropagation();

    clear_high_light();

    const path = props.context.path;

    if (event.shiftKey) {
        path.adjust_sides(segment, index);
    } else {
        if (!path.is_selected_segs(segment, index)) {
            path.select_side(segment, index);
        }
    }

    current_segment = segment;
    current_side = index;

    pathModifier = new PathEditor(props.context, event);
    downXY = { x: event.x, y: event.y };

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

    move = point_mousemove;
}

function point_mousemove(event: MouseEvent) {
    if (bridged) {
        return;
    }

    if (isDragging) {
        pathModifier?.execute(event);
    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        isDragging = true;

        if (props.context.path.selectedSides.size) {
            pathModifier?.createApiCaller();
            return;
        }

        if (is_curve_tool()) {
            bridged = true;
            launch_bridging(event); // handle交接
            return;
        }

        pathModifier?.createApiCaller();
    }
}

function launch_bridging(event: MouseEvent) {
    props.context.path.bridging({ segment: -1, index: -1, event });
}

function bridging_completed() {
    bridged = false;
}

/**
 * @description 新增一个编辑点
 */
function n_point_down(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    pathModifier = new PathEditor(props.context, event);
    downXY = { x: event.x, y: event.y };

    const __index = index + 1;

    if (pathModifier.createApiCaller(segment, __index)) {
        current_curve_point_index = __index;
        current_segment = segment;
    }

    add_move_and_up_for_document(n_point_mousemove, point_mouseup);
    move = n_point_mousemove;
}

/**
 * @description 新增编辑点之后紧接的拖拽编辑
 */
function n_point_mousemove(event: MouseEvent) {
    if (isDragging) {
        pathModifier?.execute(event);
    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        isDragging = true;
    }
}

/**
 * @description 点击编辑点之后的抬起
 */
function point_mouseup(event: MouseEvent) {
    clear_high_light();

    if (event.button !== 0) {
        return;
    }

    if (isDragging) {
        isDragging = false;
    } else {
        const path = props.context.path;

        if (path.selectedPointsLength && !event.shiftKey) {
            path.select_point(current_segment, current_curve_point_index);
        }
        if (path.selectedSidesLength && !event.shiftKey) {
            path.select_side(current_segment, current_side);
        }
    }

    pathModifier?.fulfil();
    pathModifier = undefined;

    props.context.workspace.setSelectionViewUpdater(true);

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', point_mouseup);
}

function enter(event: MouseEvent, segment: number, index: number) {
    clear_high_light();

    const path = props.context.path;
    if (path.no_hover) {
        return;
    }

    new_high_light.value = `${segment}-${index}`;

    if (path.no_add) {
        return;
    }

    add_rect.value = `${segment}-${index}`;
}

function leave(event: MouseEvent) {
    clear_high_light();
}

function clear_high_light() {
    new_high_light.value = '';
    add_rect.value = '';
}

function window_blur() {
    pathModifier?.fulfil();
    pathModifier = undefined;

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

function init_matrix() {
    matrix.reset(shape.matrix2Root());
    matrix.multiAtLeft(props.context.workspace.matrix);
}

function path_watcher(type: number) {
    switch (type) {
        case Path.SELECTION_CHANGE:
            update();
            break;
        case Path.CLEAR_HIGH_LIGHT:
            clear_high_light();
            break;
        case Path.BRIDGING_COMPLETED:
            bridging_completed();
            break;
        default:
            break;
    }
}

function is_curve_tool() {
    return props.context.tool.action === Action.Curve;
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        updatePassive();
    }
}

onMounted(() => {
    shape = props.context.selection.pathshape!;
    if (!shape) {
        return console.log('wrong shape');
    }
    shape.watch(update);

    update();
    window.addEventListener('blur', window_blur);
    props.context.path.watch(path_watcher);
    props.context.workspace.watch(workspaceWatcher);
})

onUnmounted(() => {
    props.context.path.unwatch(path_watcher);

    shape?.unwatch(update);

    window.removeEventListener('blur', window_blur);
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>
<template>
    <g v-for="(seg, si) in segments" :key="si" data-area="controller-element">
        <g v-for="(p, i) in seg" :key="i" @mouseenter="(e) => enter(e, si, i)"
           @mouseleave="leave">
            <g @mousedown="(e) => down_background_path(e, si, i)">
                <path class="background-path" :d="p.path"></path>
                <path
                    :class="{ path: true, 'path-high-light': new_high_light === `${si}-${i}`, 'path-selected': p.is_selected }"
                    :d="p.path">
                </path>
            </g>
            <rect v-if="add_rect === `${si}-${i}`"
                  :class="{ 'insert-point': true, 'insert-point-selected': add_rect === `${si}-${i}` }"
                  :x="p.add.x - 4" :y="p.add.y - 4" rx="4" ry="4" @mousedown="(e) => n_point_down(e, si, i)">
            </rect>
        </g>
    </g>

    <Handle :context="props.context"></Handle>
<!--    &lt;!&ndash;点序 for Dev&ndash;&gt;-->
<!--    <text v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }">-->
<!--        {{ i }}-->
<!--    </text>-->
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
          class="point" rx="4" ry="4" data-area="controller-element"
          @mousedown.stop="(e) => point_mousedown(e, p.segment, p.index)"
          :class="{ point: true, selected: p.selected }">
    </rect>
</template>
<style lang='scss' scoped>
.point {
    fill: #ffffff;
    stroke: var(--active-color);
    height: 8px;
    width: 8px;
}

.point:hover {
    fill: rgb(174, 205, 246);
    stroke: #ffffff;
    height: 8px;
    width: 8px;
}

.selected {
    stroke: #ffffff;
    fill: var(--active-color) !important;
}

.background-path {
    stroke: transparent;
    stroke-width: 14px;
    fill: none;
}

.path {
    stroke: gray;
    fill: none;
}

.path-high-light {
    stroke: rgba($color: #1878f5, $alpha: 0.5);
}

.path-selected {
    stroke: var(--active-color);
}

.insert-point {
    stroke: gray;
    fill: #fff;
    height: 8px;
    width: 8px;
}

.insert-point-high-light {
    stroke: rgba($color: #1878f5, $alpha: 0.5);
}

.insert-point-selected {
    stroke: var(--active-color);
}
</style>