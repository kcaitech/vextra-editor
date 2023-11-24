<script setup lang='ts'>
import {Context} from '@/context';
import {AsyncPathEditor, CurveMode, CurvePoint, Matrix, PathShape, Shape} from '@kcdesign/data';
import {onMounted, onUnmounted, reactive, ref} from 'vue';
import {ClientXY, PageXY, Selection, XY} from '@/context/selection';
import {get_conact_by_point, get_path_by_point} from './common';
import {Point} from "../../SelectionView.vue";
import {Path} from "@/context/path";
import {dbl_action} from "@/utils/mouse_interactive";
import {gen_offset_points_map2} from "@/utils/mouse";
import {modify_point_curve_mode} from "@/utils/pathedit";
import {WorkSpace} from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"

interface Props {
    context: Context
}

interface Dot {
    point: { x: number, y: number }
    index: number
    selected: boolean
}

interface Line {
    apex1: { x: number, y: number }
    point: { x: number, y: number }
    point_raw: { x: number, y: number }
    apex2: { x: number, y: number }
    index: number
}

const props = defineProps<Props>();
const matrix = new Matrix();
const sub_matrix = new Matrix();
const data: { dots: Dot[], lines: Line[] } = reactive({dots: [], lines: []});
const {dots, lines} = data;
const show_index = ref<number>(-1); // 当前聚焦的编辑点
const current_site = reactive<XY>({x: 0, y: 0});
const handle_visible = ref<boolean>(false);
let shape: Shape;
let startPosition: ClientXY = {x: 0, y: 0};
let startPosition2: PageXY = {x: 0, y: 0};
let isDragging = false;
let pathEditor: AsyncPathEditor | undefined;
let cur_new_node: Line;
let move: any;
let offset_map: XY[] | undefined = [];
const current_curve_point = ref<CurvePoint | undefined>();
const current_curve_point_index = ref<number>(-1);
const dragActiveDis = 3;

function set_current_site() {
    handle_visible.value = false;
    current_curve_point.value = undefined;
    const selected_points = props.context.path.selectedPoints;
    if (selected_points.length !== 1) return;
    const index = selected_points[0];
    const __points = shape.points;
    if (__points.length === 0) return;
    const point = __points[index];
    if (!point) return;
    current_curve_point.value = point;
    if (point.curveMode === CurveMode.Asymmetric
        || point.curveMode === CurveMode.Disconnected
        || point.curveMode === CurveMode.Mirrored) {
        handle_visible.value = true;
        current_site.x = dots[index].point.x;
        current_site.y = dots[index].point.y;
    }
}

function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    dots.length = 0;
    lines.length = 0;
    init_matrix();
    const points_set = new Set(props.context.path.selectedPoints);
    dots.push(...get_path_by_point(shape, matrix, points_set));
    lines.push(...get_conact_by_point(shape, matrix));
    set_current_site();
}

/**
 * @description down下任意一个已有的编辑点
 */
function point_mousedown(event: MouseEvent, index: number) {
    if (event.button !== 0) return;
    if (dbl_action()) {
        modify_point_curve_mode(props.context, index, shape as PathShape);
    }
    event.stopPropagation();
    const workspace = props.context.workspace;
    const root = workspace.root;
    startPosition = {x: event.clientX - root.x, y: event.clientY - root.y};
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
    const mouseOnClient: ClientXY = {x: event.clientX - root.x, y: event.clientY - root.y};
    if (isDragging && pathEditor) {
        execute(pathEditor, sub_matrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x
        startPosition.y = mouseOnClient.y;
    } else {
        const {x: sx, y: sy} = startPosition;
        const {x: mx, y: my} = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            pathEditor = props.context.editor.controller().asyncPathEditor(shape, props.context.selection.selectedPage!);
            isDragging = true;
            sub_matrix.reset(workspace.matrix.inverse);
            props.context.assist.setCPG2();
            offset_map = gen_offset_points_map2(props.context, startPosition2);
        }
    }
}

let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
let pre_target_x: number, pre_target_y: number;

function execute(pathEditor: AsyncPathEditor, p2: PageXY) {
    return pathEditor.execute(current_curve_point_index.value, p2);
    // const stickness = props.context.assist.stickness;
    // if (!offset_map) return pathEditor.execute(current_curve_point_index, p2);
    // const target = props.context.assist.edit_mode_match(p2, offset_map);
    // if (!target) return pathEditor.execute(current_curve_point_index, p2);
    // if (stickedX) {
    //     if (Math.abs(p2.x - sticked_x_v) >= stickness) {
    //         stickedX = false
    //     } else {
    //         if (pre_target_x === target.x) {
    //             p2.x = sticked_x_v;
    //         } else if (target.sticked_by_x) {
    //             modify_fix_x(p2, target.x);
    //         }
    //     }
    // } else if (target.sticked_by_x) {
    //     modify_fix_x(p2, target.x);
    // }
    // if (stickedY) {
    //     if (Math.abs(p2.y - sticked_y_v) >= stickness) {
    //         stickedY = false;
    //     } else {
    //         if (pre_target_y === target.x) {
    //             p2.y = sticked_y_v;
    //         } else if (target.sticked_by_y) {
    //             modify_fix_y(p2, target.y);
    //         }
    //     }
    // } else if (target.sticked_by_y) {
    //     modify_fix_y(p2, target.y);
    // }
    // pathEditor.execute(current_curve_point_index, p2);
}

function modify_fix_x(p2: PageXY, fix: number) {
    p2.x = fix;
    sticked_x_v = p2.x;
    stickedX = true;
    pre_target_x = fix;
}

function modify_fix_y(p2: PageXY, fix: number) {
    p2.y = fix;
    sticked_y_v = p2.y;
    stickedY = true;
    pre_target_y = fix;
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
    if (event.button !== 0) return;
    event.stopPropagation();
    const workspace = props.context.workspace;
    const root = workspace.root;
    startPosition = {x: event.clientX - root.x, y: event.clientY - root.y};
    cur_new_node = lines[show_index.value - 1];
    current_curve_point_index.value = show_index.value;
    if (!pathEditor) {
        pathEditor = props.context.editor
            .controller()
            .asyncPathEditor(shape, props.context.selection.selectedPage!);
        pathEditor.addNode(current_curve_point_index.value, cur_new_node.point_raw);
        if (event.shiftKey) {
            props.context.path.push_after_sort_points(current_curve_point_index.value);
        } else {
            props.context.path.select_point(current_curve_point_index.value);
        }
    }
    workspace.setCtrl('controller');
    document.addEventListener('mousemove', n_point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = n_point_mousemove;
}

/**
 * @description 新增编辑点之后紧接的拖拽编辑
 */
function n_point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = {x: event.clientX - root.x, y: event.clientY - root.y};
    if (isDragging && pathEditor) {
        pathEditor.execute(current_curve_point_index.value, sub_matrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x;
        startPosition.y = mouseOnClient.y;
    } else {
        const {x: sx, y: sy} = startPosition;
        const {x: mx, y: my} = mouseOnClient;
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
    if (event.button !== 0) return;
    if (isDragging) {
        isDragging = false;
    } else {
        if (props.context.path.selectedPoints.length > 1 && !event.shiftKey) {
            props.context.path.select_point(current_curve_point_index.value);
        }
    }
    if (pathEditor) {
        pathEditor.close();
        pathEditor = undefined;
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

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        shape.unwatch(update);
        const ns = props.context.selection.pathshape;
        if (!ns) return;
        shape = ns;
        shape.watch(update);
        update();
    }
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
    if (!shape) return console.log('wrong shape');
    shape.watch(update);
    update();
    window.addEventListener('blur', window_blur);
    props.context.path.watch(path_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(matrix_watcher);
    shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.path.unwatch(path_watcher);
})
</script>
<template>
    <Handle v-if="handle_visible && current_curve_point" :site="current_site"
            :curve-point="current_curve_point" :index="current_curve_point_index"></Handle>
    <!--    line todo-->
    <g v-for="(p, i) in lines" :key="i" @mouseenter="() => { line_enter(p.index) }" @mouseleave="line_leave">
        <line :x1="p.apex1.x" :y1="p.apex1.y" :x2="p.apex2.x" :y2="p.apex2.y" class="line"></line>
        <rect v-if="show_index === p.index" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px"
              width="8px"
              @mousedown="n_point_down" class="point">
        </rect>
    </g>
    <rect v-for="(p, i) in dots"
          :key="i"
          :style="{transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)`}"
          class="point"
          rx="4px" ry="4px"
          height="8px" width="8px"
          @mousedown.stop="(e) => point_mousedown(e, p.index)" :class="{point: true, selected: p.selected}">
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

.point:hover {
    fill: #cccccc;
}

.line {
    stroke: transparent;
    stroke-width: 8px;
    fill: none;
}
</style>