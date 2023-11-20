<script setup lang='ts'>
import {Context} from '@/context';
import {AsyncPathEditor, Matrix, Shape} from '@kcdesign/data';
import {onMounted, onUnmounted, reactive, ref} from 'vue';
import {ClientXY, Selection} from '@/context/selection';
import {get_path_by_point, get_conact_by_point} from './common';
import {Point} from "../../SelectionView.vue";
import {Path} from "@/context/path";
import {dbl_action} from "@/utils/mouse_interactive";

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
let shape: Shape;
let startPosition: ClientXY = {x: 0, y: 0};
let isDragging = false;
let down_index: number = 0;
let pathEditor: AsyncPathEditor | undefined;
let cur_new_node: Line;
let move: any;

const dragActiveDis = 3;

function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    dots.length = 0;
    lines.length = 0;
    const points_set = new Set(props.context.path.selectedPoints);
    dots.push(...get_path_by_point(shape, matrix, points_set));
    lines.push(...get_conact_by_point(shape, matrix));
}

/**
 * @description down下任意一个已有的编辑点
 */
function point_mousedown(event: MouseEvent, index: number) {
    if (event.button !== 0) return;
    if (dbl_action()) {
        console.log('双击切换工具');
    }
    event.stopPropagation();
    const workspace = props.context.workspace;
    const root = workspace.root;
    startPosition = {x: event.clientX - root.x, y: event.clientY - root.y};
    down_index = index;
    workspace.setCtrl('controller');
    if (event.shiftKey) {
        props.context.path.adjust_points(down_index)
    } else {
        props.context.path.select_point(down_index);
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
        pathEditor.execute(down_index, sub_matrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x
        startPosition.y = mouseOnClient.y;
    } else {
        const {x: sx, y: sy} = startPosition;
        const {x: mx, y: my} = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            pathEditor = props.context.editor.controller().asyncPathEditor(shape, props.context.selection.selectedPage!);
            isDragging = true;
            sub_matrix.reset(workspace.matrix.inverse);
        }
    }
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
    down_index = show_index.value;
    if (!pathEditor) {
        pathEditor = props.context.editor
            .controller()
            .asyncPathEditor(shape, props.context.selection.selectedPage!);
        pathEditor.addNode(down_index, cur_new_node.point_raw);
        if (event.shiftKey) {
            props.context.path.push_after_sort_points(down_index);
        } else {
            props.context.path.select_point(down_index);
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
        pathEditor.execute(down_index, sub_matrix.computeCoord3(mouseOnClient));
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
        init_matrix();
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

onMounted(() => {
    shape = props.context.selection.pathshape!;
    if (!shape) return console.log('wrong shape');
    shape.watch(update);
    init_matrix();
    update();
    window.addEventListener('blur', window_blur);
    props.context.path.watch(path_watcher);
})
onUnmounted(() => {
    shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.path.unwatch(path_watcher);
})
</script>
<template>
    <!--    line todo    -->
    <g v-for="(p, i) in lines" :key="i" @mouseenter="() => { line_enter(p.index) }" @mouseleave="line_leave">
        <line :x1="p.apex1.x" :y1="p.apex1.y" :x2="p.apex2.x" :y2="p.apex2.y" class="line"></line>
        <rect v-if="show_index === p.index" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px"
              width="8px"
              @mousedown="n_point_down" class="point">
        </rect>
    </g>
    <rect v-for="(p, i) in dots" :key="i" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px"
          width="8px"
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