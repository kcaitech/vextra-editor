<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncPathEditor, Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ClientXY, PageXY, XY } from '@/context/selection';
import { get_path_by_point } from './common';
import { Path } from "@/context/path";
import { dbl_action } from "@/utils/mouse_interactive";
import { add_move_and_up_for_document, gen_offset_points_map2 } from "@/utils/mouse";
import { Segment, get_segments, modify_point_curve_mode } from "@/utils/pathedit";
import { WorkSpace } from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"
import { ActionEndGenerator } from '@/utils/assist';
import { Action } from '@/context/tool';
import { PathEditor } from "@/transform/pathEdit";

interface Props {
    context: Context
}

interface Dot {
    point: { x: number, y: number }
    index: number
    selected: boolean
}

const props = defineProps<Props>();
const matrix = new Matrix();
const sub_matrix = new Matrix();
const data: { dots: Dot[], segments: Segment[] } = reactive({ dots: [], segments: [] });
const { dots, segments } = data;
// const current_curve_point_index = ref<number>(-1);
const dragActiveDis = 3;
const new_high_light = ref<number>(-1);
const add_rect = ref<number>(-1);
let shape: ShapeView;
let startPosition: ClientXY = { x: 0, y: 0 };
let startPosition2: PageXY = { x: 0, y: 0 };
let isDragging = false;
let pathEditor: AsyncPathEditor | undefined;
let move: any;
let offset_map: XY[] | undefined = [];
let actionEndGenerator: ActionEndGenerator | undefined = undefined;
let bridged = false;

let pathModifier: PathEditor | undefined;
let downXY: XY = { x: 0, y: 0 };
let current_curve_point_index: number = -1;
let current_side: number = -1;

function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    dots.length = 0;
    segments.length = 0;
    init_matrix();
    const points_set = new Set(props.context.path.selectedPoints);
    dots.push(...get_path_by_point(shape as PathShapeView, matrix, points_set));
    const segs = new Set(props.context.path.selectedSides);
    segments.push(...get_segments(shape as PathShapeView, matrix, segs));
    props.context.path.set_segments(segments);
}

/**
 * @description down下任意一个已有的编辑点
 */
function point_mousedown(event: MouseEvent, index: number) {
    if (event.button !== 0) {
        return;
    }

    if (dbl_action()) {
        modify_point_curve_mode(props.context, index, shape as PathShapeView);
    }

    event.stopPropagation();

    current_curve_point_index = index;

    const path = props.context.path;

    if (event.shiftKey) {
        path.adjust_points(current_curve_point_index)
    } else {
        if (!path.is_selected(index)) {
            path.select_point(current_curve_point_index);
        }
    }

    pathModifier = new PathEditor(props.context, event);
    downXY = { x: event.x, y: event.y };

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

    move = point_mousemove;
}

/**
 * @description 边
 */
function down_background_path(event: MouseEvent, index: number) {
    if (event.button !== 0) {
        return;
    }
    event.stopPropagation();

    clear_high_light();

    const path = props.context.path;

    if (event.shiftKey) {
        path.adjust_sides(index);
    } else {
        if (!path.is_selected_segs(index)) {
            path.select_side(index);
        }
    }

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
        return;
    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        isDragging = true;

        if (is_curve_tool()) {
            if (props.context.path.selectedSides.length) {
                return;
            }

            bridged = true;
            launch_bridging(event); // handle交接
            return;
        }

        pathModifier?.createApiCaller();
    }
}

function launch_bridging(event: MouseEvent) {
    props.context.path.bridging({ index: -1, event });
}

function bridging_completed() {
    bridged = false;
}

// function __exe(event: MouseEvent, pathEditor: AsyncPathEditor, _point: PageXY) {
//     if (!offset_map) {
//         console.log("!offset_map");
//         return;
//     }
//
//     if (!actionEndGenerator) {
//         return;
//     }
//
//
//     const select_point = props.context.path.syntheticPoints;
//
//     if (!select_point?.length) {
//         console.log('!select_point?.length');
//         return;
//     }
//
//     const f = props.context.assist
//         .edit_mode_match
//         .bind(props.context.assist);
//
//     const point = actionEndGenerator.__gen(_point, select_point, f, event.shiftKey); // 开启辅助
//     // const point = _point;
//     if (select_point.length === 1) {
//         pathEditor.execute(current_curve_point_index.value, point);
//         return;
//     }
//
//     const points = (shape as PathShapeView).points;
//     if (!points?.length) {
//         console.log('!points?.length');
//         return;
//     }
//
//     const first_point = points[select_point[0]];
//     if (!first_point) {
//         console.log('!first_point');
//         return;
//     }
//
//     const first_offset = offset_map[0];
//     const compute_root_point = { x: point.x + first_offset.x, y: point.y + first_offset.y };
//     const m = shape.matrix2Root();
//     m.preScale(shape.frame.width, shape.frame.height);
//     const m2 = new Matrix(m.inverse);
//     const compute_unit_point = m2.computeCoord3(compute_root_point);
//
//     pathEditor.execute2(select_point, compute_unit_point.x - first_point.x, compute_unit_point.y - first_point.y);
// }

/**
 * @description 新增一个编辑点
 */
function n_point_down(event: MouseEvent, index: number) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    pathModifier = new PathEditor(props.context, event);
    downXY = { x: event.x, y: event.y };

    const __index = index + 1;

    if (pathModifier.createApiCaller(__index)) {
        current_curve_point_index = __index;
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
        pathModifier?.createApiCaller();
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

        if (path.selectedPoints.length > 1 && !event.shiftKey) {
            path.select_point(current_curve_point_index);
        }
        if (path.selectedSides.length > 1 && !event.shiftKey) {
            path.select_side(current_side);
        }
    }

    pathModifier?.fulfil();
    pathModifier = undefined;

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', point_mouseup);
}

function enter(event: MouseEvent, index: number) {
    clear_high_light();

    const path = props.context.path;
    if (path.no_hover) {
        return;
    }
    new_high_light.value = index;
    if (path.no_add) {
        return;
    }

    add_rect.value = index;
}

function leave(event: MouseEvent) {
    clear_high_light();
}

function clear_high_light() {
    new_high_light.value = -1;
    add_rect.value = -1;
}

// listener
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

function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

function is_curve_tool() {
    return props.context.tool.action === Action.Curve;
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);

    shape = props.context.selection.pathshape!;
    if (!shape) {
        return console.log('wrong shape');
    }
    shape.watch(update);

    update();
    window.addEventListener('blur', window_blur);
    props.context.path.watch(path_watcher);
})

onUnmounted(() => {
    props.context.workspace.unwatch(matrix_watcher);
    props.context.path.unwatch(path_watcher);

    shape?.unwatch(update);

    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g v-for="(p, i) in segments" :key="i" data-area="controller-element" @mouseenter="(e) => enter(e, i)"
       @mouseleave="leave">
        <g @mousedown="(e) => down_background_path(e, i)">
            <path class="background-path" :d="p.path"></path>
            <path :class="{ path: true, 'path-high-light': new_high_light === i, 'path-selected': p.is_selected }"
                  :d="p.path">
            </path>
        </g>
        <rect v-if="add_rect === i" :class="{ 'insert-point': true, 'insert-point-selected': add_rect === i }"
              :x="p.add.x - 4" :y="p.add.y - 4" rx="4" ry="4" @mousedown="(e) => n_point_down(e, i)">
        </rect>
    </g>
    <Handle :context="props.context"></Handle>
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
          class="point" rx="4" ry="4" data-area="controller-element"
          @mousedown.stop="(e) => point_mousedown(e, p.index)"
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

.selected {
    stroke: #ffffff;
    fill: var(--active-color);
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