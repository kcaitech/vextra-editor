<script setup lang="ts">
import { Context } from '@/context';
import { XY } from '@/context/selection';
import { PointHandler } from '@/transform/point';
import { ColVector3D, CurvePoint, Matrix, PolygonShapeView, ShapeFrame, makeShapeTransform2By1 } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { getCornerControlPoint, getRadiusValue } from './common';
import { fixedZero } from '@/utils/common';
import { getTransformCol } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';

interface Props {
    context: Context
    shape: PolygonShapeView
}

interface Point {
    x: number,
    y: number
}

const props = defineProps<Props>();
const radius_dot = ref<Point[]>();
const cursor_point = ref<Point>({ x: 0, y: 0 });
const max_radius = ref<number[]>([0, 0, 0, 0]);
const radius = ref<number[]>([0, 0, 0, 0]);
const cursor_enter = ref(false);
const cursor_down = ref(false);
const radiusDotEl = ref<SVGGElement[]>();
let changeR: number = -1;
let pointModifyHandler: PointHandler | undefined = undefined;

function update() {
    update_dot_position();
}

const update_dot_position = () => {
    const radius = getRadiusPosition();
    if (radius) radius_dot.value = radius;
}

function getRadiusPosition() {
    const { width, height } = props.shape.frame;
    const shape = props.shape;
    let result: ColVector3D[] = [];
    const segment = shape?.segments[0];
    if (!segment) {
        return [];
    }
    const points = segment.points;

    if (!points.length) return [];
    for (let i = 0; i < points.length; i++) {
        if (points.length !== 4) return [];
        const point = points[i];
        const cornerInfo = getCornerControlPoint(points as CurvePoint[], i, props.shape.frame);
        if (!cornerInfo) continue;
        radius.value[i] = cornerInfo.radius;
        max_radius.value[i] = point.radius || 0;
        let r = cornerInfo.radius;
        let x = point.x * width, y = point.y * height;
        const offset = 15 / props.context.workspace.matrix.m00;
        if (i === 0) {
            x += r > offset ? r : offset;
            y += r > offset ? r : offset;
        } else if (i === 1) {
            x -= r > offset ? r : offset;
            y += r > offset ? r : offset;
        } else if (i === 2) {
            x -= r > offset ? r : offset;
            y -= r > offset ? r : offset;
        } else if (i === 3) {
            x += r > offset ? r : offset;
            y -= r > offset ? r : offset;
        }
        const p = ColVector3D.FromXY(x, y);

        result.push(p);
    }
    const matrix = new Matrix(props.context.workspace.matrix);
    const shape_root_m = shape.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix);
    m.addTransform(clientTransform); //root到视图
    const { col0: lt, col1: rt, col2: rb, col3: lb } = m.transform(result);
    return [{ x: lt.x, y: lt.y }, { x: rt.x, y: rt.y }, { x: rb.x, y: rb.y }, { x: lb.x, y: lb.y }];
}

let downClientXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;
const point_mousedown = (e: MouseEvent, index: number) => {
    changeR = index;
    cursor_down.value = true;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    pointModifyHandler = new PointHandler(props.context, e);
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(e: MouseEvent) {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    if (isDragging) {
        if (!pointModifyHandler) {
            return
        }
        if (!pointModifyHandler.asyncApiCaller) {
            pointModifyHandler.createApiCaller();
        }
        let r = radiusDotMove(e);
        const isAlt = e.altKey;
        
        const max_r = maxRadius(props.shape.frame);
        if (r > max_r) r = max_r;
        if (r < 0) r = 0;
        let values = [-1, -1, -1, -1];
        isAlt ? values[changeR] = r : values = [r];
        pointModifyHandler?.executeRadius(values);
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            getMovePoint(e);
        }
    }
}

const getMovePoint = (e: MouseEvent) => {
    if (!radius_dot.value) return;
    const shape = props.shape;
    const curDot = radius_dot.value[changeR];
    const frame = shape.frame;
    const clientXY = props.context.workspace.getContentXY(e);
    const matrix = new Matrix(props.context.workspace.matrix);
    const shape_root_m = shape.matrix2Root();
    let m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix);
    m.addTransform(clientTransform); //root到视图
    const _m = m.getInverse(); // 视图转图形
    const { col0: xy } = _m.transform([ColVector3D.FromXY(clientXY.x, clientXY.y)]);
    xy.x /= frame.width;
    xy.y /= frame.height;
    const d0 = Math.hypot(xy.x, xy.y);
    const d1 = Math.hypot(xy.x - 1, xy.y);
    const d2 = Math.hypot(xy.x - 1, xy.y - 1);
    const d3 = Math.hypot(xy.x, xy.y - 1);
    const d = [d0, d1, d2, d3];
    const distances = [];
    for (let i = 0; i < radius_dot.value.length; i++) {
        const dot = radius_dot.value[i];
        if (Math.abs(curDot.x - dot.x) < 2 && Math.abs(curDot.y - dot.y) < 2) {
            distances.push({ distance: d[i], i });
        }
    }
    const mind = distances.reduce((d, obj) => d.distance < obj.distance ? d : obj);
    changeR = mind.i;
}

const maxRadius = (frame: ShapeFrame) => {
    const { width, height } = frame;
    return Math.min(width / 2, height / 2);
}

// 圆角移动的大小
const radiusDotMove = (e: MouseEvent) => {
    let radius = 0;
    const shape = props.shape;
    const { width, height } = shape.frame;
    const max_r = maxRadius(shape.frame);
    if (changeR === 0) {
        const start = getTransformCol(props.context, shape, 0, 0);
        const end = getTransformCol(props.context, shape, max_r, max_r);
        radius = getRadiusValue(start, end, e, props.context) * max_r;
    }
    if (changeR === 1) {
        const start = getTransformCol(props.context, shape, width, 0);
        const end = getTransformCol(props.context, shape, width - max_r, max_r);
        radius = getRadiusValue(start, end, e, props.context) * max_r;
    }
    if (changeR === 2) {
        const start = getTransformCol(props.context, shape, width, height);
        const end = getTransformCol(props.context, shape, width - max_r, height - max_r);
        radius = getRadiusValue(start, end, e, props.context) * max_r;
    }
    if (changeR === 3) {
        const start = getTransformCol(props.context, shape, 0, height);
        const end = getTransformCol(props.context, shape, max_r, height - max_r);
        radius = getRadiusValue(start, end, e, props.context) * max_r;
    }
    return Math.round(radius);
}

function dot_mousemove(e: MouseEvent) {
    if (cursor_down.value) return;
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
}

function point_mouseup() {
    cursor_down.value = false;
    pointModifyHandler?.fulfil();
    pointModifyHandler = undefined;
    isDragging = false;
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

const point_mouseenter = (e: MouseEvent, index: number) => {
    if (cursor_down.value) {
        return;
    }
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);

    changeR = index;
    cursor_enter.value = true;
}
const point_mouseleave = (e: MouseEvent) => {
    e.stopPropagation();
    cursor_enter.value = false;
}

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update();
    } else if (t === WorkSpace.SCALING) {
        if (props.context.workspace.isScaling) radius_dot.value = [];
        else update();
    }
}
onMounted(() => {
    props.shape.watch(update);
    props.context.workspace.watch(workspaceWatcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
<!-- 圓角 -->
<g v-if="radius_dot && radius_dot.length === 4">
    <g v-for="(dot, index) in radius_dot" :key="index"
       :style="`transform: translate(${dot.x - 4}px, ${dot.y - 4}px);`" ref="radiusDotEl"
       @mousedown.stop="(e) => point_mousedown(e, index)" @mousemove="dot_mousemove"
       @mouseenter="(e) => point_mouseenter(e, index)" @mouseleave="point_mouseleave">
        <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1"/>
        <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1"/>
        <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
                 stroke-width="1"/>
        <ellipse cx="4" cy="4" rx="1.5" ry="1.5" fill="#1878F5" fill-opacity="1"/>
    </g>
    <foreignObject v-if="cursor_enter || cursor_down" :x="cursor_point.x + 10" :y="cursor_point.y + 15"
                   width="100px" height="28px">
        <div class="percent_container">
            <span>圆角 {{ fixedZero(max_radius[changeR]) }} </span>
        </div>
    </foreignObject>
</g>
</template>

<style scoped lang="scss">
.percent_container {
    position: absolute;
    display: flex;
    max-width: 100px;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;

    span {
        padding: 6px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>