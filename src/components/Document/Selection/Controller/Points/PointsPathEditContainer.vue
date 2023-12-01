<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncPathEditor, Matrix, PathShape, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ClientXY, PageXY, XY } from '@/context/selection';
import { get_conact_by_point, get_path_by_point } from './common';
import { Path } from "@/context/path";
import { dbl_action } from "@/utils/mouse_interactive";
import { gen_offset_points_map2 } from "@/utils/mouse";
import { Segment, get_segments, modify_point_curve_mode } from "@/utils/pathedit";
import { WorkSpace } from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"
import { ActionEndGenerator } from '@/utils/assist';

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
const show_index = ref<number>(-1); // 当前聚焦的编辑点
const current_curve_point_index = ref<number>(-1);
const dragActiveDis = 3;
let shape: Shape;
let startPosition: ClientXY = { x: 0, y: 0 };
let startPosition2: PageXY = { x: 0, y: 0 };
let isDragging = false;
let pathEditor: AsyncPathEditor | undefined;
let cur_new_node: Segment;
let move: any;
let offset_map: XY[] | undefined = [];
let actionEndGenerator: ActionEndGenerator | undefined = undefined;

function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    dots.length = 0;
    segments.length = 0;
    init_matrix();
    const points_set = new Set(props.context.path.selectedPoints);
    dots.push(...get_path_by_point(shape, matrix, points_set));
    segments.push(...get_segments(shape as PathShape, matrix, new Set()));
}

/**
 * @description down下任意一个已有的编辑点
 */
function point_mousedown(event: MouseEvent, index: number) {
    if (event.button !== 0) {
        return;
    }
    if (dbl_action()) {
        modify_point_curve_mode(props.context, index, shape as PathShape);
    }
    event.stopPropagation();
    const workspace = props.context.workspace;
    const root = workspace.root;
    startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
    startPosition2 = workspace.matrix.inverseCoord(startPosition);
    current_curve_point_index.value = index;
    workspace.setCtrl('controller');
    if (event.shiftKey) {
        props.context.path.adjust_points(current_curve_point_index.value)
    } else {
        if (props.context.path.is_selected(current_curve_point_index.value)) {
            //todo
        } else {
            props.context.path.select_point(current_curve_point_index.value);
        }
    }
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove;
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && pathEditor) {
        __exe(pathEditor, sub_matrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x
        startPosition.y = mouseOnClient.y;
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            pathEditor = props.context.editor
                .controller()
                .asyncPathEditor(shape as PathShape, props.context.selection.selectedPage!);
            isDragging = true;
            sub_matrix.reset(workspace.matrix.inverse);
            props.context.assist.set_points_map();
            offset_map = gen_offset_points_map2(props.context, startPosition2);
            if (offset_map) {
                actionEndGenerator = new ActionEndGenerator(props.context, offset_map);
            }
        }
    }
}

function __exe(pathEditor: AsyncPathEditor, _point: PageXY) {
    if (!offset_map) {
        console.log("!offset_map");
        return;
    }
    if (!actionEndGenerator) {
        return;
    }
    const f = props.context.assist.edit_mode_match.bind(props.context.assist);
    const point = actionEndGenerator.__gen(_point, f);
    const m = props.context.path.matrix_unit_to_root;
    if (!m) {
        return;
    }
    const select_point = props.context.path.selectedPoints;
    if (!select_point?.length) {
        console.log('!select_point?.length');
        return;
    }
    if (select_point.length === 1) {
        pathEditor.execute(current_curve_point_index.value, point);
        return;
    }
    const points = props.context.selection.pathshape?.points;
    if (!points?.length) {
        console.log('!points?.length');
        return;
    }
    const first_point = points[select_point[0]];
    if (!first_point) {
        console.log('!first_point');
        return;
    }
    const origin_root_point = m.computeCoord2(first_point.x, first_point.y);
    const first_offset = offset_map[0];
    const compute_root_point = { x: point.x + first_offset.x, y: point.y + first_offset.y };
    const m2 = new Matrix(m.inverse);
    const compute_unit_point = m2.computeCoord3(compute_root_point);
    m2.multi(props.context.workspace.matrix.inverse);
    const origin_unit_point = m2.computeCoord3(origin_root_point);
    pathEditor.execute2(select_point, compute_unit_point.x - origin_unit_point.x, compute_unit_point.y - origin_unit_point.y);
}

function line_enter(index: number) {
    show_index.value = index;
}

function line_leave() {
    show_index.value = -1;
}

/**
 * @description 新增一个编辑点
 */
function n_point_down(event: MouseEvent) {
    // if (event.button !== 0) return;
    // event.stopPropagation();
    // const workspace = props.context.workspace;
    // const root = workspace.root;
    // startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
    // cur_new_node = segments[show_index.value - 1];
    // current_curve_point_index.value = show_index.value;
    // if (!pathEditor) {
    //     pathEditor = props.context.editor
    //         .controller()
    //         .asyncPathEditor(shape as PathShape, props.context.selection.selectedPage!);
    //     pathEditor.addNode(current_curve_point_index.value, cur_new_node.point_raw);
    //     if (event.shiftKey) {
    //         props.context.path.push_after_sort_points(current_curve_point_index.value);
    //     } else {
    //         props.context.path.select_point(current_curve_point_index.value);
    //     }
    // }
    // workspace.setCtrl('controller');
    // document.addEventListener('mousemove', n_point_mousemove);
    // document.addEventListener('mouseup', point_mouseup);
    // move = n_point_mousemove;
}

/**
 * @description 新增编辑点之后紧接的拖拽编辑
 */
function n_point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && pathEditor) {
        pathEditor.execute(current_curve_point_index.value, sub_matrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x;
        startPosition.y = mouseOnClient.y;
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            sub_matrix.reset(workspace.matrix.inverse);
        }
    }
}

/**
 * @description 点击编辑点之后的抬起
 */
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }
    if (isDragging) {
        isDragging = false;
        props.context.assist.reset();
    } else {
        if (props.context.path.selectedPoints.length > 1 && !event.shiftKey) {
            props.context.path.select_point(current_curve_point_index.value);
        }
    }
    if (pathEditor) {
        pathEditor.close();
        pathEditor = undefined;
    }
    if (actionEndGenerator) {
        actionEndGenerator.__reset();
        actionEndGenerator = undefined;
    }
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
}

function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        isDragging = false;
        props.context.assist.reset();
    }
    if (pathEditor) {
        pathEditor.close();
        pathEditor = undefined;
    }
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

function init_matrix() {
    matrix.reset(shape.matrix2Root());
    matrix.multiAtLeft(props.context.workspace.matrix);
}

function path_watcher(type: number) {
    if (type === Path.SELECTION_CHANGE) {
        update();
    }
}

function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
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
    shape?.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.path.unwatch(path_watcher);
})
</script>
<template>
    <Handle :context="props.context"></Handle>
    <!--    line todo-->
    <g v-for="(p, i) in segments" :key="i">
        <path :d="`M ${p.start.x} ${p.start.y} C ${p.from.x} ${p.from.y} ${p.to.x} ${p.to.y} ${p.end.x} ${p.end.y}`"
            stroke="orange" stroke-width="1" fill="none"></path>
        <rect :x="p.add.x - 4" :y="p.add.y - 4" rx="4px" ry="4px" height="8px" width="8px" stroke="orange" fill="#fff">
        </rect>
    </g>
    <!-- <g v-for="(p, i) in lines" :key="i" @mouseenter="() => { line_enter(p.index) }" @mouseleave="line_leave">
        <line :x1="p.apex1.x" :y1="p.apex1.y" :x2="p.apex2.x" :y2="p.apex2.y" class="line"></line>
        <rect v-if="show_index === p.index" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px" width="8px"
            @mousedown="n_point_down" class="point">
        </rect>
    </g> -->
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
        class="point" rx="4px" ry="4px" height="8px" width="8px" @mousedown.stop="(e) => point_mousedown(e, p.index)"
        :class="{ point: true, selected: p.selected }">
    </rect>
</template>
<style lang='scss' scoped>
.point {
    fill: #ffffff;
    stroke: #555555;
    stroke-width: 1.5px;
}

.selected {
    stroke: #ffffff;
    fill: #555555;
}

.line {
    stroke: transparent;
    stroke-width: 8px;
    fill: none;
}
</style>