<script setup lang='ts'>
import { Context } from '@/context';
import { CurvePoint, Matrix, PathShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { XY } from '@/context/selection';
import { get_path_by_point } from './common';
import { Path } from "@/context/path";
import { Segment, get_segments } from "@/utils/pathedit";
import { WorkSpace } from "@/context/workspace";
import Handle from "../PathEdit/Handle.vue"
import { PathEditor } from "@/transform/pathEdit";
import { Assist } from "@/context/assist";
import { getHorizontalAngle } from "@/utils/common";

type Props = {
    context: Context
}

type Dot = {
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
} = reactive({ dots: [], segments: [] });
const shape = props.context.selection.selectedShapes[0] as PathShapeView;

const { dots, segments } = data;
const dragActiveDis = 5;

let bridged = false;

let pathModifier: PathEditor | undefined;
let downXY: XY = { x: 0, y: 0 };

const preXY = ref<XY>({ x: -10, y: -10 });

const livingPathVisible = ref<boolean>(false);
const livingPath = ref<string>('');
const root = { ...props.context.workspace.root };
const maskPath = `M0 0, h${root.width} v${root.height} h${-root.width} z`;

const preparePointVisible = ref<boolean>(false);

// 每次更新都是全局更新，可以有局部更新的方案会更好
function update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;

    dots.length = 0;
    segments.length = 0;

    const matrix = init_matrix();

    if (!(shape as PathShapeView)?.segments?.length) return;

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);

    buildMap();

    if (livingPathVisible.value) modifyLivingPath();
}

const mapX = new Map<number, XY[]>();
const mapY = new Map<number, XY[]>();

function buildMap() {
    mapX.clear();
    mapY.clear();

    const m = shape.matrix2Root();
    const frame = shape.frame;
    m.preScale(frame.width, frame.height);
    m.multiAtLeft(props.context.workspace.matrix);

    const segments = shape.segments;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;
        const points = segment.points;
        for (let j = 0; j < points.length; j++) {
            const point = points[j];
            if (!point) continue;
            const xy = m.computeCoord3(point);
            const xKey = Number(xy.x.toFixed(2));
            let xContainer = mapX.get(xKey);
            if (!xContainer) {
                xContainer = [xy];
                mapX.set(xKey, xContainer);
            } else {
                xContainer.push(xy);
            }
            const yKey = Number(xy.y.toFixed(2));
            let yContainer = mapY.get(yKey);
            if (!yContainer) {
                yContainer = [xy];
                mapY.set(yKey, yContainer);
            } else {
                yContainer.push(xy);
            }
        }
    }
}

function passiveUpdate() {
    dots.length = 0;
    segments.length = 0;

    const matrix = init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));

    props.context.path.set_segments(segments);

    buildMap();
}

function point_mousedown(event: MouseEvent, segment: number, index: number) {
    if (event.button !== 0) return;

    event.stopPropagation();

    downXY = { x: event.x, y: event.y };

    const path = props.context.path;
    const isContacting = path.isContacting;

    if (isContacting) { // 连接状态
        const last = path.lastPoint;
        if (!last) return; // 连接状态却没有lastPoint，说明出了预期以外的问题

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
                if (!point) return;

                pathModifier = new PathEditor(props.context, event);
                pathModifier.createApiCaller();
                const __xy = { x: point.x, y: point.y };
                pathModifier.addPointForPen(last.segment, last.index + 1, preXY.value, __xy);
                pathModifier.cancelContactStatus();
                asyncEnvMount();
            }
        } else {
            const __segment = (shape as PathShapeView).segments[segment];
            if (!__segment) return;

            const points = __segment.points;

            // 合并两条路径，并取消钢笔的连接状态
            if (index === 0 && !__segment.isClosed) {
                console.log(`将把路径【${lastSegment}】合并到路径【${segment}】的起点，并取消链接状态`);
                pathModifier = new PathEditor(props.context, event);
                pathModifier.mergeSegment(lastSegment, segment, 'start');
                asyncEnvMount();
            } else if (index === (points.length - 1) && !__segment.isClosed) {
                console.log(`将把路径【${lastSegment}】合并到路径【${segment}】的终点，并取消链接状态`);
                pathModifier = new PathEditor(props.context, event);
                pathModifier.mergeSegment(lastSegment, segment, 'end');
                asyncEnvMount();
            } else {
                console.log(`将在路径【${lastSegment}】的${lastIndex + 1}的位置上加入一个点并保持链接状态`);
                const point = (shape as PathShapeView)?.segments[segment]?.points[index];
                if (!point) return;

                pathModifier = new PathEditor(props.context, event);
                pathModifier.createApiCaller();
                const __xy = { x: point.x, y: point.y };
                pathModifier.addPointForPen(last.segment, last.index + 1, preXY.value, __xy);
                pathModifier.cancelContactStatus();
                asyncEnvMount();
            }
        }
    } else { // 非连接状态
        const __segment = (shape as PathShapeView).segments[segment];
        if (!__segment) return;

        const points = __segment.points;

        // 延续已有路径，开启钢笔的连接状态
        if (index === 0 && !__segment.isClosed) {
            // 考虑调换点的顺序
            console.log(`从起点处延续路径【${segment}】，需要调换点的顺序，使起点成为终点，并进入连接状态`);
            pathModifier = new PathEditor(props.context, event);
            const result = pathModifier.reverseSegment(segment);

            if (result) {
                const { segment: _segment, activeIndex } = result;
                const point = (shape as PathShapeView)?.segments[_segment]?.points[activeIndex];
                if (!point) return;

                path.select_point(_segment, activeIndex);
                path.setLastPoint({ point: point as CurvePoint, segment: _segment, index: activeIndex });

                path.setContactStatus(true);

                asyncEnvMount();

                setDisContactTrigger(path);
            }
        } else if (index === (points.length - 1) && !__segment.isClosed) {
            // 不需要调换点的顺序
            console.log(`从末尾处延续路径【${segment}】，并进入连接状态`);
            const point = (shape as PathShapeView)?.segments[segment]?.points[index];
            if (!point) return;

            path.setLastPoint({ point: point as CurvePoint, segment, index })
            path.setContactStatus(true);
            path.select_point(segment, index);

            pathModifier = new PathEditor(props.context, event);
            pathModifier.createApiCaller();
            asyncEnvMount();

            setDisContactTrigger(path);
        } else {
            console.log(`将新增一条路径，并进入链接状态`);

            const point = (shape as PathShapeView)?.segments[segment]?.points[index];
            if (!point) return;

            pathModifier = new PathEditor(props.context, event);
            pathModifier.createApiCaller();
            const addRes = pathModifier.addSegmentForPen(preXY.value, point as CurvePoint);

            if (!addRes) return;
            props.context.path.setContactStatus(true);
            setDisContactTrigger(props.context.path);

            asyncEnvMount();
        }
    }
}

function setDisContactTrigger(path: Path) {
    props.context.escstack.save('contact-status', () => {
        path.reset();
        const achieve = path.isContacting;
        path.setContactStatus(false);
        return achieve;
    });
}
function checkStatus() {
    const path = props.context.path;
    const params = path.bridgeParam;
    if (!params) return;

    const { segment, index, handler, e } = params;

    downXY = { x: e.x, y: e.y };

    const point = (props.context.selection.selectedShapes[0] as PathShapeView)
        ?.segments[0]
        ?.points[0] as CurvePoint;

    path.setLastPoint({ point, index: 0, segment: 0 });
    path.select_point(segment, index);

    passiveUpdate();

    const workspace = props.context.workspace;

    if (workspace.is_path_edit_mode) {
        props.context.escstack.save('path-edit', () => {
            const achieve = workspace.is_path_edit_mode;
            workspace.setPathEditMode(false);
            return achieve;
        });
    }

    if (path.isContacting) setDisContactTrigger(path);

    if (!e.buttons) { // Mac环境与Window环境下，这个判断结果会不同，很奇怪的机制
        handler?.fulfil();
        return;
    }

    pathModifier = handler;
    asyncEnvMount();
}

function point_mousemove(event: MouseEvent) {
    if (bridged) return;
    if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) launch_bridging(event);
}

function launch_bridging(event: MouseEvent) {
    const last = props.context.path.lastPoint;
    if (!last || !pathModifier) return;
    props.context.path.setBridgeParams({ handler: pathModifier, segment: last.segment, index: last.index, e: event });
    props.context.path.bridging({ segment: -1, index: -1, event });

    pathModifier = undefined;

    bridged = true;
}

function bridging_completed() {
    bridged = false;
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;

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
        case Path.BRIDGING_COMPLETED:
            bridging_completed();
            break;
        case Path.CONTACT_STATUS_CHANGE:
            modifyLivingPath();
            break;
    }
}

function matrix_watcher(t: number | string) {
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

function fixXYByShift(e: MouseEvent) {
    if (!e.shiftKey) return;

    const _previous = getLastPoint();
    if (!_previous) return;

    const m = new Matrix(shape.matrix2Root());
    m.preScale(shape.frame.width, shape.frame.height);
    m.multiAtLeft(props.context.workspace.matrix);

    const previous = m.computeCoord3(_previous);
    const livingXY = props.context.workspace.getContentXY(e);
    const angle = getHorizontalAngle(previous, livingXY);

    if (angle >= 0 && angle < 22.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate(-a * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 22.5 && angle < 67.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((0.25 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 67.5 && angle < 112.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((0.5 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 112.5 && angle < 157.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((0.75 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 157.5 && angle < 202.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((1 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 202.5 && angle < 247.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((1.25 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 247.5 && angle < 292.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((1.5 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else if (angle >= 292.5 && angle < 337.5) {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((1.75 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    } else {
        const a = angle / 180;
        const __m = new Matrix();
        __m.rotate((2 - a) * Math.PI, previous.x, previous.y);

        const __l = __m.computeCoord3(livingXY);

        livingXY.x = __l.x;
        livingXY.y = __l.y;
    }

    return livingXY;
}

function getLastPoint() {
    const path = props.context.path;
    if (!path.lastPoint || !path.isContacting) return;

    const shape = props.context.selection.selectedShapes[0] as PathShapeView;
    const { segment, index } = path.lastPoint;
    let previous = (shape as PathShapeView)?.segments[segment]?.points[index];

    if (!previous) {
        const __seg = (shape as PathShapeView)?.segments[segment];
        if (__seg) {
            previous = __seg.points[__seg.points.length - 1];
        }

        if (!previous) return;
    }

    return previous;
}

function documentMove(e: MouseEvent) {
    props.context.path.saveEvent(e);
    const __client = props.context.workspace.getContentXY(e);

    let delX = Infinity;
    let delY = Infinity;

    let DX = 0;
    let DY = 0;
    let TX = 0;
    let TY = 0;

    if (!mapX.size && !mapY.size) buildMap();

    const xs = Array.from(mapX.keys());
    const ys = Array.from(mapY.keys());

    const { x, y } = __client;

    for (let j = 0; j < xs.length; j++) {
        const dx = xs[j] - x;
        const __dx = Math.abs(dx);

        if (__dx < delX) {
            delX = __dx;
            DX = dx;
            TX = xs[j];
        }
    }

    for (let k = 0; k < ys.length; k++) {
        const dy = ys[k] - y;
        const __dy = Math.abs(dy);

        if (__dy < delY) {
            delY = __dy;
            DY = dy;
            TY = ys[k];
        }
    }

    let modified = false;
    const assist = props.context.assist;

    if (delX < PathEditor.DELTA) {
        __client.x += DX;
        assist.setNodesX2([...(mapX.get(TX) || []), __client]);
        modified = true;
    } else {
        assist.setNodesX2([]);
    }

    if (delY < PathEditor.DELTA) {
        __client.y += DY;
        assist.setNodesY2([...(mapY.get(TY) || []), __client]);
        modified = true;
    } else {
        assist.setNodesY2([]);
    }

    if (modified) {
        assist.notify(Assist.UPDATE_ASSIST_PATH);
    } else {
        assist.notify(Assist.CLEAR);
    }

    preXY.value = __client;
    const _fixed = fixXYByShift(e);
    if (_fixed) preXY.value = _fixed;

    livingPath.value = '';

    if (e.buttons) {
        livingPathVisible.value = false;

        preparePointVisible.value = false;
        return;
    }

    modifyLivingPath();

    preparePointVisible.value = true;
}

function modifyLivingPath() {
    livingPathVisible.value = false;
    preparePointVisible.value = false;

    const previous = getLastPoint();
    if (!previous) return;

    const m = new Matrix(shape.matrix2Root());
    m.preScale(shape.frame.width, shape.frame.height);
    m.multiAtLeft(props.context.workspace.matrix);

    const p1 = m.computeCoord3(previous);

    if (previous.hasFrom) {
        const c1 = m.computeCoord2(previous.fromX ?? 0, previous.fromY ?? 0);
        livingPath.value = `M${p1.x} ${p1.y} C${c1.x} ${c1.y} ${preXY.value.x} ${preXY.value.y} ${preXY.value.x} ${preXY.value.y}`;
    } else {
        livingPath.value = `M${p1.x} ${p1.y} L${preXY.value.x} ${preXY.value.y}`;
    }

    livingPathVisible.value = true;
}

function down(e: MouseEvent) {
    if (e.button !== 0) return;

    downXY = { x: e.x, y: e.y };

    const keepOn = props.context.path.isContacting;

    if (keepOn) {
        const lastPoint = props.context.path.lastPoint;
        if (lastPoint) {
            pathModifier = new PathEditor(props.context, e);
            pathModifier.createApiCaller();
            pathModifier.addPointForPen(lastPoint.segment, lastPoint.index + 1, { ...preXY.value });
            asyncEnvMount();

            e.stopPropagation();
        }
    } else {
        pathModifier = new PathEditor(props.context, e);
        pathModifier.createApiCaller();
        const addRes = pathModifier.addSegmentForPen(preXY.value);

        if (!addRes) return;

        props.context.path.setContactStatus(true);

        setDisContactTrigger(props.context.path);

        asyncEnvMount();

        e.stopPropagation();
    }
}

function asyncEnvMount() {
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function fixPreLine(e: MouseEvent, segmentIndex: number, toIndex: number) {
    if (e.buttons !== 0) return;
    livingPathVisible.value = false;
    preparePointVisible.value = false;

    const path = props.context.path;

    if (!path.lastPoint) return;

    const shape = props.context.selection.selectedShapes[0] as PathShapeView;
    const { segment, index } = path.lastPoint;
    let previous = (shape as PathShapeView)?.segments[segment]?.points[index];

    if (!path.isContacting) return;

    if (!previous) {
        const __seg = (shape as PathShapeView)?.segments[segment];
        if (__seg) {
            previous = __seg.points[__seg.points.length - 1];
        }

        if (!previous) return;
    }

    const m = new Matrix(shape.matrix2Root());
    m.preScale(shape.frame.width, shape.frame.height);
    m.multiAtLeft(props.context.workspace.matrix);

    const toSegment = (shape as PathShapeView)?.segments[segmentIndex];
    if (!toSegment) return;
    const toPoint = toSegment?.points[toIndex];
    if (!toPoint) return;

    const hasTo = toPoint.hasTo;
    if (!hasTo) return;

    const p1 = m.computeCoord3(previous);
    const p2 = m.computeCoord3(toPoint);

    if (previous.hasFrom) {
        const c1 = m.computeCoord2(previous.fromX ?? 0, previous.fromY ?? 0);
        if (hasTo) {
            const c2 = m.computeCoord2(toPoint.toX || toPoint.x, toPoint.toY || toPoint.y);
            livingPath.value = `M${p1.x} ${p1.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
        } else {
            livingPath.value = `M${p1.x} ${p1.y} C${c1.x} ${c1.y} ${preXY.value.x} ${preXY.value.y} ${preXY.value.x} ${preXY.value.y}`;
        }
    } else {
        livingPath.value = `M${p1.x} ${p1.y} L${preXY.value.x} ${preXY.value.y}`;
    }

    livingPathVisible.value = true;
    props.context.assist.notify(Assist.CLEAR);
    e.stopPropagation();
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);

    checkStatus();

    shape.watch(update);
    update();

    window.addEventListener('blur', window_blur);
    const path = props.context.path;
    path.watch(path_watcher);

    document.addEventListener('mousemove', documentMove);

    if (path.isContacting && path.lastEvent) {
        preXY.value = props.context.workspace.getContentXY(path.lastEvent);
        modifyLivingPath();
        preparePointVisible.value = true;
    }
})

onUnmounted(() => {
    props.context.workspace.unwatch(matrix_watcher);
    props.context.path.unwatch(path_watcher);
    shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    document.removeEventListener('mousemove', documentMove);
    props.context.assist.notify(Assist.CLEAR);
})
</script>
<template>
<path :d="maskPath" fill="transparent" @mousedown="down"/>

<path v-if="livingPathVisible" :d="livingPath" stroke="#1878f5" fill="none" style="pointer-events: none"/>

<g v-for="(seg, si) in segments" :key="si" data-area="controller-element">
    <g v-for="(p, i) in seg" :key="i">
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
      @mousemove="(e) => fixPreLine(e,p.segment, p.index)"
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

.path {
    stroke: gray;
    fill: none;
    pointer-events: none;
}
</style>