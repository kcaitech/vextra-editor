<script setup lang="ts">
import { Context } from '@/context';
import { SelectionTheme, XY } from '@/context/selection';
import { PointHandler } from '@/transform/point';
import { Matrix, PolygonShapeView, ShapeFrame } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { getCornerControlPoint } from './common';
import { fixedZero } from '@/utils/common';


interface Props {
    matrix: number[]
    context: Context
    shape: PolygonShapeView
    theme: SelectionTheme
}
interface Point {
    x: number, y: number
}

const props = defineProps<Props>();
const matrix = new Matrix();
const radius_dot = ref<Point[]>();
const cursor_point = ref<Point>({ x: 0, y: 0 });
const radius = ref<number[]>([0, 0, 0, 0]);
const cursor_enter = ref(false);
const cursor_down = ref(false);
const radiusDotEl = ref<SVGGElement[]>();
let changeR: number = -1;
let pointModifyHandler: PointHandler | undefined = undefined;
function update() {
    matrix.reset(props.matrix);
    update_dot_position();
}

const update_dot_position = () => {
    const radius = getRadiusPosition();
    if (radius) radius_dot.value = radius;
}


function getRadiusPosition() {
    const { width, height } = props.shape.frame;
    const shape = props.shape.data;
    let result: Point[] = [];
    for (let i = 0; i < shape.points.length; i++) {
        if (shape.points.length !== 4) return;
        const point = shape.points[i];
        const cornerInfo = getCornerControlPoint(shape.points, i, props.shape.frame);
        if (!cornerInfo) continue;
        radius.value[i] = cornerInfo.radius;
        let r = cornerInfo.radius;
        let x = point.x * width, y = point.y * height;
        const origin = matrix.computeCoord2(x, y);
        if (i === 0) {
            x += r; y += r;
        } else if (i === 1) {
            x -= r; y += r;
        } else if (i === 2) {
            x -= r; y -= r;
        } else if (i === 3) {
            x += r; y -= r;
        }
        const p = matrix.computeCoord2(x, y);
        if (Math.abs(origin.x - p.x) < 15) {
            if (i === 0) {
                p.x = origin.x + 15; p.y = origin.y + 15;
            } else if (i === 1) {
                p.x = origin.x - 15; p.y = origin.y + 15;
            } else if (i === 2) {
                p.x = origin.x - 15; p.y = origin.y - 15;
            } else if (i === 3) {
                p.x = origin.x + 15; p.y = origin.y - 15;
            }
        }
        result.push(p);
    }
    return result;
}

const point_mousedown = (e: MouseEvent, index: number) => {
    changeR = index;
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
    let r = radiusDotMove(e);
    const isAlt = props.context.selection.is_interval;
    if (r === 0) return;
    r = radius.value[changeR] + r;
    const max_r = maxRadius(props.shape.frame);
    if (r > max_r) return;
    if (r < 0) r = 0;
    let values = [-1, -1, -1, -1];
    isAlt ? values[changeR] = r : values = [r];
    pointModifyHandler?.executeRadius(values);
}

const maxRadius = (frame: ShapeFrame) => {
    const { width, height } = frame;
    return Math.min(width / 2, height / 2);
}
const radiusDotMove = (e: MouseEvent) => {
    let radius = 0;
    if (radiusDotEl.value) {
        const { x, y } = radiusDotEl.value[changeR].getBoundingClientRect();
        if (e.movementY === 0 && e.movementX === 0) return radius;
        if (changeR === 0) {
            if (e.clientY < y && e.movementY < 0) {
                radius += e.movementY;
            }
            if (e.clientY > y && e.movementY > 0) {
                radius += e.movementY;
            }
            if (e.clientX < x && e.movementX < 0) {
                radius += e.movementX;
            }
            if (e.clientX > x && e.movementX > 0) {
                radius += e.movementX;
            }
        }
        if (changeR === 1) {
            if (e.clientY < y && e.movementY < 0) {
                radius += e.movementY;
            }
            if (e.clientY > y && e.movementY > 0) {
                radius += e.movementY;
            }
            if (e.clientX < x && e.movementX < 0) {
                radius -= e.movementX;
            }
            if (e.clientX > x && e.movementX > 0) {
                radius -= e.movementX;
            }
        }
        if (changeR === 2) {
            if (e.clientY < y && e.movementY < 0) {
                radius -= e.movementY;
            }
            if (e.clientY > y && e.movementY > 0) {
                radius -= e.movementY;
            }
            if (e.clientX < x && e.movementX < 0) {
                radius -= e.movementX;
            }
            if (e.clientX > x && e.movementX > 0) {
                radius -= e.movementX;
            }
        }
        if (changeR === 3) {
            if (e.clientY < y && e.movementY < 0) {
                radius -= e.movementY;
            }
            if (e.clientY > y && e.movementY > 0) {
                radius -= e.movementY;
            }
            if (e.clientX < x && e.movementX < 0) {
                radius += e.movementX;
            }
            if (e.clientX > x && e.movementX > 0) {
                radius += e.movementX;
            }
        }
    }
    return radius;
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
const point_mouseenter = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    if (cursor_down.value) {
        return;
    }
    cursor_point.value = props.context.workspace.getContentXY(e);

    changeR = index;
    cursor_enter.value = true;
}
const point_mouseleave = (e: MouseEvent) => {
    e.stopPropagation();
    cursor_enter.value = false;
}

watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
})
</script>

<template>
    <!-- 圓角 -->
    <g v-if="radius_dot && radius_dot.length === 4">
        <g v-for="(dot, index) in radius_dot" :key="index"
            :style="`transform: translate(${dot.x - 4}px, ${dot.y - 4}px);`" ref="radiusDotEl"
            @mousedown.stop="(e) => point_mousedown(e, index)" @mousemove="dot_mousemove"
            @mouseenter="(e) => point_mouseenter(e, index)" @mouseleave="point_mouseleave">
            <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1" />
            <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1" />
            <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
                stroke-width="1" />
            <ellipse cx="4" cy="4" rx="1.5" ry="1.5" fill="#1878F5" fill-opacity="1" />
        </g>
        <foreignObject v-if="cursor_enter || cursor_down" :x="cursor_point.x + 10" :y="cursor_point.y + 15"
            width="100px" height="28px">
            <div class="percent_container">
                <span>圆角 {{ fixedZero(radius[changeR]) }} </span>
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