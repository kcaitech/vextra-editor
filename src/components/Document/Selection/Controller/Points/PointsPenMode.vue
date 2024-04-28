<script setup lang='ts'>
import { Context } from '@/context';
import { CurvePoint, Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ClientXY, XY } from '@/context/selection';
import { get_path_by_point } from './common';
import { Path } from "@/context/path";
import { Segment, get_segments } from "@/utils/pathedit";
import { WorkSpace } from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"
import { PathEditor } from "@/transform/pathEdit";

interface Props {
    context: Context
}

interface Dot {
    point: {
        x: number,
        y: number
    }
    segment: number
    index: number
    selected: boolean
}

const props = defineProps<Props>();
const matrix = new Matrix();
const data: {
    dots: Dot[],
    segments: Segment[][]
} = reactive({ dots: [], segments: [] });
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

const preXY = ref<XY>({ x: -10, y: -10 });

const livingPathVisible = ref<boolean>(false);
const livingPath = ref<string>('');
const root = { ...props.context.workspace.root };
const maskPath = `M0 0, h${root.width} v${root.height} h${-root.width} z`;

const preparePointVisible = ref<boolean>(false);

function update() {
    // 更新机制优化一下
    // if (!props.context.workspace.shouldSelectionViewUpdate) {
    //     return;
    // }

    dots.length = 0;
    segments.length = 0;

    init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);
}

function point_mousedown(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    // todo
    if (index === 0) {
        // 闭合路径 或 延续路径
        // 看是不是自己这条路径，要是别的非闭合路径，那就延续，要是自己那就直接闭合
        return;
    }
    const points = (shape as PathShapeView).segments[segment];
    if (!segment) {
        return;
    }
}

function checkStatus() {
    const path = props.context.path;
    const params = path.bridgeParam;
    if (!params) {
        return;
    }

    const { segment, index, handler, e } = params;

    current_segment = segment;
    current_curve_point_index = index;
    downXY = { x: e.x, y: e.y };

    pathModifier = handler;

    const point = (props.context.selection.selectedShapes[0] as PathShapeView)
        .segments[0]
        .points[0] as CurvePoint;

    path.setLastPoint({ point, index: 0, segment: 0 });
    path.select_point(segment, index);

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

    move = point_mousemove;
}

function point_mousemove(event: MouseEvent) {
    if (bridged) {
        return;
    }
    if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        bridged = true;
        launch_bridging(event);
    }
}

function launch_bridging(event: MouseEvent) {
    const last = props.context.path.lastPoint;
    if (!last) {
        return;
    }
    props.context.path.setBridgeParams({ handler: pathModifier!, segment: last.segment, index: last.index, e: event });
    props.context.path.bridging({ segment: -1, index: -1, event });
}

function bridging_completed() {
    bridged = false;
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    if (!bridged) {
        props.context.path.setBridgeParams(undefined);
        pathModifier?.fulfil();
    }

    pathModifier = undefined;

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

function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

function documentMove(e: MouseEvent) {
    preXY.value = props.context.workspace.getContentXY(e);

    livingPath.value = '';
    livingPathVisible.value = false;

    preparePointVisible.value = false;

    if (e.buttons) {
        return;
    }

    modifyLivingPath();

    preparePointVisible.value = true;
}

function modifyLivingPath() {
    const path = props.context.path;
    const previous = path.lastPoint?.point;

    if (!previous || !path.isContacting) {
        return;
    }

    const shape = props.context.selection.selectedShapes[0] as PathShapeView;

    const m = new Matrix(shape.matrix2Root());
    m.preScale(shape.frame.width, shape.frame.height);
    m.multiAtLeft(props.context.workspace.matrix);

    const p1 = m.computeCoord3(previous);

    if (previous.hasFrom && previous.fromX !== undefined && previous.fromY !== undefined) {
        const c1 = m.computeCoord2(previous.fromX, previous.fromY);
        livingPath.value = `M${p1.x} ${p1.y} C${c1.x} ${c1.y} ${preXY.value.x} ${preXY.value.y} ${preXY.value.x} ${preXY.value.y}`;
    } else {
        livingPath.value = `M${p1.x} ${p1.y} L${preXY.value.x} ${preXY.value.y}`;
    }

    livingPathVisible.value = true;
}

function down(e: MouseEvent) {
    const lastPoint = props.context.path.lastPoint;
    if (lastPoint) {
        pathModifier = new PathEditor(props.context, e);
        pathModifier.createApiCaller();
        pathModifier.addPointForPen(lastPoint.segment, lastPoint.index + 1);
        downXY = { x: e.x, y: e.y };
        document.addEventListener('mousemove', point_mousemove);
        document.addEventListener('mouseup', point_mouseup);

        move = point_mousemove;

        e.stopPropagation();
    } else {
        // add segment
    }
}

onMounted(() => {
    checkStatus();

    props.context.workspace.watch(matrix_watcher);

    shape = props.context.selection.pathshape!;
    if (!shape) {
        return console.log('wrong shape');
    }

    shape.watch(update);
    update();

    window.addEventListener('blur', window_blur);
    props.context.path.watch(path_watcher);

    document.addEventListener('mousemove', documentMove);
})

onUnmounted(() => {
    props.context.workspace.unwatch(matrix_watcher);
    props.context.path.unwatch(path_watcher);

    shape?.unwatch(update);

    window.removeEventListener('blur', window_blur);

    document.removeEventListener('mousemove', documentMove);
})
</script>
<template>
    <path :d="maskPath" fill="transparent" @mousedown="down"></path>

    <path v-if="livingPathVisible" :d="livingPath" stroke="red" fill="none" style="pointer-events: none"/>

    <g v-for="(seg, si) in segments" :key="si" data-area="controller-element">
        <g v-for="(p, i) in seg" :key="i" @mouseenter="(e) => enter(e, si, i)"
           @mouseleave="leave">
            <path class="path" :d="p.path"/>
        </g>
    </g>

    <Handle :context="props.context"/>
    <!--点序 for Dev-->
    <text v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }">
        {{ i }}
    </text>
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
          class="point" rx="4" ry="4" data-area="controller-element"
          @mousedown.stop="(e) => point_mousedown(e, p.segment, p.index)"
          :class="{ point: true, selected: p.selected }"/>
    <rect
        v-if="preparePointVisible"
        class="point"
        style="pointer-events: none"
        :x="preXY.x - 4"
        :y="preXY.y - 4"
        rx="4"
        ry="4"
    />
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
    stroke: green;
    fill: none;
    pointer-events: none;
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