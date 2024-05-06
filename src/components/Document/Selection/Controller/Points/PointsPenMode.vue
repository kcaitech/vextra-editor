<script setup lang='ts'>
import { Context } from '@/context';
import { adapt2Shape, CurvePoint, Matrix, PathShape, PathShapeView, ShapeView } from '@kcdesign/data';
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
const data: {
    dots: Dot[],
    segments: Segment[][]
} = reactive({dots: [], segments: []});
const {dots, segments} = data;
const dragActiveDis = 3;
const new_high_light = ref<string>('');
const add_rect = ref<string>('');
let shape: ShapeView;
let startPosition: ClientXY = {x: 0, y: 0};
let isDragging = false;
let bridged = false;

let pathModifier: PathEditor | undefined;
let downXY: XY = {x: 0, y: 0};

let current_segment: number = -1;
let current_curve_point_index: number = -1;

const preXY = ref<XY>({x: -10, y: -10});

const livingPathVisible = ref<boolean>(false);
const livingPath = ref<string>('');
const root = {...props.context.workspace.root};
const maskPath = `M0 0, h${root.width} v${root.height} h${-root.width} z`;

const preparePointVisible = ref<boolean>(false);

// 每次更新都是全局更新，虽然计算量大的场景少，但要是可以有局部更新的方案会更好
function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    dots.length = 0;
    segments.length = 0;

    const matrix = init_matrix();

    if (!(shape as PathShapeView)?.segments?.length) {
        return;
    }

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);
}

function passiveUpdate() {
    dots.length = 0;
    segments.length = 0;

    if (!(shape as PathShapeView)?.segments?.length) {
        return;
    }

    const matrix = init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);
}

/**
 * training...
 */
function point_mousedown(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();


    const path = props.context.path;
    const isContacting = path.isContacting;

    if (isContacting) { // 连接状态
        const last = path.lastPoint;
        if (!last) {
            return; // 连接状态却没有lastPoint，说明出了预期以外的问题
        }

        const lastSegment = last.segment;
        const lastIndex = last.index;

        if (lastSegment === segment) {
            if (index === 0) {
                // 闭合当前路径
                console.log(`闭合路径【${segment}】，选中路径的起点，并在抬起的时候取消链接状态`);
                pathModifier = new PathEditor(props.context, event);
                pathModifier.closeSegmentAt(segment);
                asyncEnvMount();
            } else {
                console.log(`将在路径【${lastSegment}】的${lastIndex + 1}的位置上加入一个点并保持链接状态`);
                const point = (shape as PathShapeView)?.segments[segment]?.points[index];
                if (!point) {
                    return;
                }

                pathModifier = new PathEditor(props.context, event);
                pathModifier.createApiCaller();
                pathModifier.addPointForPen(last.segment, last.index + 1, point as CurvePoint);
                downXY = {x: event.x, y: event.y};
                document.addEventListener('mousemove', point_mousemove);
                document.addEventListener('mouseup', point_mouseup);
            }
        } else {
            const __segment = (shape as PathShapeView).segments[segment];
            if (!__segment) {
                return;
            }

            const points = __segment.points;

            // 合并两条路径，并取消钢笔的连接状态
            if (index === 0) {
                console.log(`将把路径【${lastSegment}】合并到路径【${segment}】的起点，并取消链接状态`);
                pathModifier = new PathEditor(props.context, event);
                pathModifier.mergeSegment(lastSegment, segment, 'start');
                asyncEnvMount();
            } else if (index === (points.length - 1)) {
                console.log(`将把路径【${lastSegment}】合并到路径【${segment}】的终点，并取消链接状态`);
                pathModifier = new PathEditor(props.context, event);
                pathModifier.mergeSegment(lastSegment, segment, 'end');
                asyncEnvMount();
            } else {
                console.log(`将在路径【${lastSegment}】的${lastIndex + 1}的位置上加入一个点并保持链接状态`);
                const point = (shape as PathShapeView)?.segments[segment]?.points[index];
                if (!point) {
                    return;
                }

                pathModifier = new PathEditor(props.context, event);
                pathModifier.createApiCaller();
                pathModifier.addPointForPen(last.segment, last.index + 1, point as CurvePoint);
                downXY = {x: event.x, y: event.y};
                document.addEventListener('mousemove', point_mousemove);
                document.addEventListener('mouseup', point_mouseup);
            }
        }
    } else { // 非连接状态
        const __segment = (shape as PathShapeView).segments[segment];
        if (!__segment) {
            return;
        }

        const points = __segment.points;

        // 延续已有路径，开启钢笔的连接状态
        if (index === 0) {
            // 考虑调换点的顺序
            console.log(`从起点处延续路径【${segment}】，需要调换点的顺序，使起点成为终点，并进入连接状态`);
            pathModifier = new PathEditor(props.context, event);
            const result = pathModifier.reverseSegment(segment);

            if (result) {
                const {segment: _segment, activeIndex} = result;
                const point = (shape as PathShapeView)?.segments[_segment]?.points[activeIndex];
                if (!point) {
                    return;
                }

                path.select_point(_segment, activeIndex);
                path.setLastPoint({point: point as CurvePoint, segment: _segment, index: activeIndex});

                path.setContactStatus(true);

                asyncEnvMount();

                props.context.esctask.save('contact-status', () => {
                    const achieve = props.context.path.isContacting;
                    props.context.path.setContactStatus(false);
                    return achieve;
                });
            }
        } else if (index === (points.length - 1)) {
            // 不需要调换点的顺序
            console.log(`从末尾处延续路径【${segment}】，并进入连接状态`);
            const point = (shape as PathShapeView)?.segments[segment]?.points[index];
            if (!point) {
                return;
            }

            path.setLastPoint({point: point as CurvePoint, segment, index})
            path.setContactStatus(true);
            path.select_point(segment, index);

            pathModifier = new PathEditor(props.context, event);
            pathModifier.createApiCaller();
            asyncEnvMount();

            props.context.esctask.save('contact-status', () => {
                const achieve = props.context.path.isContacting;
                props.context.path.setContactStatus(false);
                return achieve;
            });
        } else {
            console.log(`将新增一条路径，并进入链接状态`);

            const point = (shape as PathShapeView)?.segments[segment]?.points[index];
            if (!point) {
                return;
            }

            pathModifier = new PathEditor(props.context, event);
            pathModifier.createApiCaller();
            const addRes = pathModifier.addSegmentForPen(point as CurvePoint);

            if (!addRes) {
                return;
            }

            props.context.path.setContactStatus(true);

            props.context.esctask.save('contact-status', () => {
                const achieve = props.context.path.isContacting;
                props.context.path.setContactStatus(false);
                return achieve;
            });

            downXY = {x: event.x, y: event.y};

            asyncEnvMount();
        }
    }
}

function checkStatus() {
    const path = props.context.path;
    const params = path.bridgeParam;
    if (!params) {
        return;
    }

    const {segment, index, handler, e} = params;

    current_segment = segment;
    current_curve_point_index = index;
    downXY = {x: e.x, y: e.y};

    pathModifier = handler;

    const point = (props.context.selection.selectedShapes[0] as PathShapeView)
        .segments[0]
        .points[0] as CurvePoint;

    path.setLastPoint({point, index: 0, segment: 0});
    path.select_point(segment, index);

    passiveUpdate();

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(event: MouseEvent) {
    if (bridged) {
        return;
    }
    if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        launch_bridging(event);
    }
}

function launch_bridging(event: MouseEvent) {
    const last = props.context.path.lastPoint;
    if (!last || !pathModifier) {
        return;
    }
    props.context.path.setBridgeParams({handler: pathModifier, segment: last.segment, index: last.index, e: event});
    props.context.path.bridging({segment: -1, index: -1, event});

    pathModifier = undefined;

    bridged = true;
}

function bridging_completed() {
    bridged = false;
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clearStatus();
}

function clearStatus() {
    if (!bridged || pathModifier) {
        props.context.path.setBridgeParams(undefined);
        pathModifier?.fulfil();
    }

    pathModifier = undefined;

    document.removeEventListener('mousemove', point_mousemove);
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

function leave() {
    clear_high_light();
}

function clear_high_light() {
    new_high_light.value = '';
    add_rect.value = '';
}

function window_blur() {
    clearStatus();
}

function init_matrix() {
    const m = new Matrix(shape.matrix2Root());
    m.multiAtLeft(props.context.workspace.matrix);

    return m;
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

        if (livingPathVisible.value) {
            modifyLivingPath();
        }
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        passiveUpdate();

        if (livingPathVisible.value) {
            modifyLivingPath();
        }
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

    if (!path.lastPoint) {
        return;
    }

    const shape = adapt2Shape(props.context.selection.selectedShapes[0] as PathShapeView); // 异步问题需要处理


    const {segment, index} = path.lastPoint;
    const previous = (shape as PathShape)?.pathsegs[segment]?.points[index];

    if (!previous || !path.isContacting) {
        return;
    }

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

/**
 * training...
 */
function down(e: MouseEvent) {
    const keepOn = props.context.path.isContacting;

    if (keepOn) {
        const lastPoint = props.context.path.lastPoint;
        if (lastPoint) {
            pathModifier = new PathEditor(props.context, e);
            pathModifier.createApiCaller();
            pathModifier.addPointForPen(lastPoint.segment, lastPoint.index + 1);
            downXY = {x: e.x, y: e.y};
            document.addEventListener('mousemove', point_mousemove);
            document.addEventListener('mouseup', point_mouseup);

            e.stopPropagation();
        }
    } else {
        pathModifier = new PathEditor(props.context, e);
        pathModifier.createApiCaller();
        const addRes = pathModifier.addSegmentForPen();

        if (!addRes) {
            return;
        }

        props.context.path.setContactStatus(true);

        props.context.esctask.save('contact-status', () => {
            const achieve = props.context.path.isContacting;
            props.context.path.setContactStatus(false);
            return achieve;
        });

        downXY = {x: e.x, y: e.y};

        asyncEnvMount();

        e.stopPropagation();
    }
}

function asyncEnvMount() {
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);

    shape = props.context.selection.pathshape!;
    if (!shape) {
        return console.log('wrong shape');
    }

    checkStatus();

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

    <path v-if="livingPathVisible" :d="livingPath" stroke="#1878f5" fill="none" style="pointer-events: none"/>

    <g v-for="(seg, si) in segments" :key="si" data-area="controller-element">
        <g v-for="(p, i) in seg" :key="i" @mouseenter="(e) => enter(e, si, i)"
           @mouseleave="leave">
            <path class="path" :d="p.path"/>
        </g>
    </g>

    <Handle :context="props.context"/>
    <!--点序 for Dev-->
    <text v-for="(p, i) in dots"
          :key="i"
          :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)`, 'pointer-events': 'none'}">
        {{ `${p.segment},${p.index}` }}
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
    stroke: gray;
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