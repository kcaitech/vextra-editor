<script setup lang="ts">
import { Context } from '@/context';
import { XY } from '@/context/selection';
import { PointActionType, PointHandler } from '@/transform/point';
import { CurvePoint, PolygonShapeView, ShapeFrame } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { getCornerControlPoint } from './common';
import { bezierCurvePoint } from '@/utils/pathedit';
import { fixedZero } from '@/utils/common';
import { getTransformCol } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';


interface Props {
    context: Context
    shape: PolygonShapeView
    pointVisible: boolean
}

interface Point {
    x: number,
    y: number
}

const props = defineProps<Props>();
const radius_dot = ref<Point>({ x: 0, y: 0 });
const count_dot = ref<Point>({ x: 0, y: 0 });
const cursor_point = ref<Point>({ x: 0, y: 0 });
const counts = ref(0);
const radius = ref(0);
const max_radius = ref(0);
const cursor_enter = ref(false);
const cursor_down = ref(false);
const countDotEl = ref<SVGGElement>();
const radiusDotEl = ref<SVGGElement>();
let changeType: PointActionType = PointActionType.Radius;
let pointModifyHandler: PointHandler | undefined = undefined;

function update() {
    update_dot_position();
}

const update_dot_position = () => {
    const count = getCountPosition();
    const radius = getRadiusPosition();
    if (count) count_dot.value = count;
    if (radius) radius_dot.value = radius;
}

function getCountPosition() {
    const shape = props.shape;
    counts.value = shape.counts;
    const segments = shape.segments;
    if (!segments) return;
    const points = segments[0]?.points;
    if (!points?.length) return;
    const cornerInfo = getCornerControlPoint(points as CurvePoint[], 1, props.shape.frame);
    if (!cornerInfo) return;
    const { preHandle, nextHandle, radius, prePoint, nextPoint, curPoint } = cornerInfo;
    const length1 = sideLength(prePoint, curPoint);
    const length2 = sideLength(nextPoint, curPoint);
    const t1 = (radius) / length1;
    const t2 = (radius) / length2;
    const perX = curPoint.x + ((prePoint.x - curPoint.x) * t1);
    const perY = curPoint.y + ((prePoint.y - curPoint.y) * t1);
    const nextX = curPoint.x + ((nextPoint.x - curPoint.x) * t2);
    const nextY = curPoint.y + ((nextPoint.y - curPoint.y) * t2);

    const mid = bezierCurvePoint(0.5, { x: perX, y: perY }, preHandle, nextHandle, { x: nextX, y: nextY })
    const p = getTransformCol(props.context, shape, mid.x, mid.y);
    return p;
}

const sideLength = (p1: XY, p2: XY) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getRadiusPosition() {
    const { width, height } = props.shape.frame;
    const shape = props.shape;
    const segments = shape.segments;
    if (!segments) return;
    const points = segments[0]?.points;
    if (!points?.length) return;
    const point = points[0];
    const cornerInfo = getCornerControlPoint(points as CurvePoint[], 1, props.shape.frame);
    if (!cornerInfo) return;
    radius.value = cornerInfo.radius || 0;
    max_radius.value = point.radius || 0;
    const offset = 19 / props.context.workspace.matrix.m00;
    const p = getTransformCol(props.context, shape, point.x * width, (point.y * height) + (cornerInfo.radius || offset));
    return p;
}

const point_mousedown = (e: MouseEvent, type: PointActionType) => {
    changeType = type;
    cursor_down.value = true;
    pointModifyHandler = new PointHandler(props.context, e);
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(e: MouseEvent) {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    if (!pointModifyHandler) {
        return
    }
    if (!pointModifyHandler.asyncApiCaller) {
        pointModifyHandler.createApiCaller();
    }
    if (changeType === PointActionType.Count) {
        let move = countDotMove(e);
        if (move === 0) return;
        let count = counts.value + move;
        if (count < 3) count = 3;
        if (count > 60) count = 60;
        pointModifyHandler?.executeCount(count);
    } else if (changeType === PointActionType.Radius) {
        let r = radiusDotMove(e, props.shape.frame);
        if (r < 0) r = 0;
        pointModifyHandler?.executeRadius([r]);
    }
}

let increase = 0;
let decrease = 0;
const countDotMove = (e: MouseEvent) => {
    let count = 0;
    if (countDotEl.value) {
        const { y } = countDotEl.value.getBoundingClientRect();
        if (e.movementY === 0) return count;
        if ((y - (e.clientY + 4)) > 0) {
            if (e.movementY < 0) {
                increase += Math.abs(e.movementY);
                decrease = 0;
            } else {
                increase = 0;
                decrease -= e.movementY;
            }
        } else {
            increase = 0;
            if (e.movementY < 0) {
                decrease = 0;
            } else {
                decrease -= e.movementY;
            }
        }
    }
    if (increase > 5) {
        increase = 0;
        count = 1
    }
    if (decrease < -5) {
        decrease = 0;
        count = -1;
    }
    return count;
}
const radiusDotMove = (e: MouseEvent, frame: ShapeFrame) => {
    let radius = 0;
    const shape = props.shape;
    const start = getTransformCol(props.context, shape, frame.width / 2, 0);
    const end = getTransformCol(props.context, shape, frame.width / 2, frame.height / 2);
    radius = getRadiusPercent(start, end, e) * (frame.height / 2);
    return Math.round(radius);
}

const getRadiusPercent = (start: XY, end: XY, e: MouseEvent) => {
    const point3 = props.context.workspace.getContentXY(e); //鼠标位置
    if (start.x === end.x) {
        // 如果线段是竖直的
        const intersectionY = point3.y;
        const lineLength = Math.abs(end.y - start.y); // 计算线段的长度（竖直线段的长度即为纵坐标的差的绝对值）
        const distanceFromStart = Math.abs(intersectionY - start.y); // 交点到起点的距离（竖直线段的距离即为交点纵坐标与起点纵坐标的差的绝对值）
        const distanceFromEnd = Math.abs(intersectionY - end.y); // 交点到终点的距离（竖直线段的距离即为交点纵坐标与终点纵坐标的差的绝对值）
        const percent = distanceFromStart / lineLength; // 交点所在百分比位置
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        return percent;
    } else if (start.y === end.y) {
        // 如果线段是水平的
        const intersectionX = point3.x;
        const lineLength = Math.abs(end.x - start.x);
        const distanceFromStart = Math.abs(intersectionX - start.x);
        const distanceFromEnd = Math.abs(intersectionX - end.x);
        const percent1 = distanceFromStart / lineLength;
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        return percent1;
    } else {
        const slope = (end.y - start.y) / (end.x - start.x); // 起点和终点的斜率
        const intercept = start.y - slope * start.x; //起点和终点的截距
        const verSlope = -1 / slope; //起点和终点的垂线斜率
        const verIntercept = point3.y - verSlope * point3.x; //垂线截距
        const intersectionX = (verIntercept - intercept) / (slope - verSlope); //直线垂线的交点
        const intersectionY = slope * intersectionX + intercept;
        const lineLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const distanceFromStart = Math.sqrt(Math.pow(intersectionX - start.x, 2) + Math.pow(intersectionY - start.y, 2)); // 交点到起点的距离
        const distanceFromEnd = Math.sqrt(Math.pow(intersectionX - end.x, 2) + Math.pow(intersectionY - end.y, 2)); // 交点到终点的距离

        const percent = distanceFromStart / lineLength; // 交点所在百分比位置
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        return percent;
    }
}

function dot_mousemove(e: MouseEvent) {
    if (cursor_down.value) return;
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
}

function point_mouseup(e: MouseEvent) {
    cursor_down.value = false;
    pointModifyHandler?.fulfil();
    pointModifyHandler = undefined;
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

const point_mouseenter = (e: MouseEvent, type: PointActionType) => {
    e.stopPropagation();
    if (cursor_down.value) {
        return;
    }
    cursor_point.value = props.context.workspace.getContentXY(e);

    changeType = type;
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
    if(t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
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
    <g>
        <g v-show="pointVisible">
            <!-- 圓角 -->
            <g :style="`transform: translate(${radius_dot.x - 4}px, ${radius_dot.y - 4}px);`" ref="radiusDotEl"
                @mousedown.stop="(e) => point_mousedown(e, PointActionType.Radius)" @mousemove="dot_mousemove"
                @mouseenter="(e) => point_mouseenter(e, PointActionType.Radius)" @mouseleave="point_mouseleave">
                <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1" />
                <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1" />
                <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
                    stroke-width="1" />
                <ellipse cx="4" cy="4" rx="1.5" ry="1.5" fill="#1878F5" fill-opacity="1" />
            </g>
            <!-- 角数 -->
            <g :style="`transform: translate(${count_dot.x - 4}px, ${count_dot.y - 4}px);`" ref="countDotEl"
                @mousedown.stop="(e) => point_mousedown(e, PointActionType.Count)" @mousemove="dot_mousemove"
                @mouseenter="(e) => point_mouseenter(e, PointActionType.Count)" @mouseleave="point_mouseleave">
                <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1" />
                <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1" />
                <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
                    stroke-width="1" />
                <ellipse cx="4" cy="4" rx="1.5" ry="1.5" fill="#1878F5" fill-opacity="1" />
            </g>
        </g>
        <foreignObject v-if="cursor_enter || cursor_down" :x="cursor_point.x + 10" :y="cursor_point.y + 15"
            width="100px" height="28px">
            <div class="percent_container">
                <span v-if="changeType === PointActionType.Count">角数 {{ fixedZero(counts) }}</span>
                <span v-else>圆角 {{ fixedZero(max_radius) }} </span>
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