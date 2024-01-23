<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { AsyncGradientEditor, Color, Matrix, Point2D, ShapeView, adapt2Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import trans_bgc from '@/assets/trans_bgc3.png';
import { getHorizontalAngle } from '@/utils/common';
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const matrix = new Matrix();
interface Dot {
    x: number, y: number, type: 'from' | 'to'
}
interface Stops {
    x: number, y: number, color: Color
}

const dot1 = ref<Dot>({ x: 0, y: 0, type: 'from' });
const dot2 = ref<Dot>({ x: 0, y: 0, type: 'to' });
const dot = ref(false);
const stops = ref<Stops[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let dot_type: 'from' | 'to' = 'to';
let isDragging = false;
let gradientEditor: AsyncGradientEditor | undefined;
const dragActiveDis = 3;
const active = ref(0);
const shapes = ref<ShapeView[]>([]);
const rotate = ref(0);
const get_linear_points = () => {
    dot.value = false;
    stops.value = [];
    shapes.value = props.context.selection.selectedShapes;
    const locat = props.context.color.locat;
    if (!locat) return;
    const shape = shapes.value[0] as ShapeView;
    const gradient_type = shape.style[locat.type];
    const gradient = gradient_type[locat.index].gradient;
    if (!gradient) return;
    active.value = props.context.color.selected_stop;
    const frame = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix);
    const d1 = m.computeCoord3({ x: frame.width * gradient.from.x, y: frame.height * gradient.from.y });
    const d2 = m.computeCoord3({ x: frame.width * gradient.to.x, y: frame.height * gradient.to.y });
    dot1.value = { x: d1.x, y: d1.y, type: 'from' }
    dot2.value = { x: d2.x, y: d2.y, type: 'to' }
    rotate.value = getHorizontalAngle({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y });
    for (let i = 0; i < gradient.stops.length; i++) {
        const stop = gradient.stops[i];
        const x1 = d1.x + ((d2.x - d1.x) * stop.position);
        const y1 = d1.y + ((d2.y - d1.y) * stop.position);
        stops.value.push({ x: x1, y: y1, color: stop.color as Color });
    }
    dot.value = true;
}

const dot_mousedown = (e: MouseEvent, type: 'from' | 'to') => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const workspace = props.context.workspace;
    startPosition = workspace.getContentXY(e);
    document.addEventListener('mousemove', dot_mousemove);
    document.addEventListener('mouseup', dot_mouseup);
    dot_type = type;
}

const dot_mousemove = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const locat = props.context.color.locat;
    if (!locat) return;
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = startPosition;
    const dx = x - sx;
    const dy = y - sy;
    if (isDragging && gradientEditor) {
        startPosition.x = x, startPosition.y = y;
        const shape = shapes.value[0] as ShapeView;
        const gradient_type = shape.style[locat.type];
        const gradient = gradient_type[locat.index].gradient;
        if (!gradient) return;
        const matrix = new Matrix();
        const frame = shape.frame;
        matrix.preScale(frame.width, frame.height);
        matrix.multiAtLeft(shape.matrix2Root());
        matrix.multiAtLeft(props.context.workspace.matrix);
        const m = new Matrix(matrix.inverse);
        const posi = m.computeCoord(x, y);
        if (dot_type === 'from') {
            gradientEditor.execute_from(posi);
        } else if (dot_type === 'to') {
            gradientEditor.execute_to(posi);
        }
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            const page = props.context.selection.selectedPage;
            gradientEditor = props.context.editor.controller().asyncGradientEditor(shapes.value.map((s) => adapt2Shape(s as ShapeView)), page!, locat.index, locat.type);
        }
    }
}

const dot_mouseup = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.close();
        gradientEditor = undefined;
    }
    document.removeEventListener('mousemove', dot_mousemove);
    document.removeEventListener('mouseup', dot_mouseup);
}

const watcher = () => {
    matrix.reset(props.matrix);
    get_linear_points();
}

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes;
    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

const workspace_watcher = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        watcher();
    }
}
const color_watcher = (t: number) => {
    if (t === ColorCtx.CHANGE_STOP) {
        active.value = props.context.color.selected_stop;
    }
}
function to_rgba(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgba(" + options.red + "," + options.green + "," + options.blue + "," + options.alpha + ")";
}
onMounted(() => {
    watcher();
    watchShapes();
    props.context.workspace.watch(workspace_watcher);
    props.context.color.watch(color_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.color.unwatch(color_watcher);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g v-if="dot">
            <rect x="0" y="0" width="22" :height="22" fill="black" opacity="0"></rect>
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="black" stroke-width="3" class="line" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="white" stroke-width="2" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot1.type)"></circle>
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot2.type)"></circle>
            <g v-for="(stop, index) in stops" :key="index"
                :style="{ transform: `translate(${stop.x + 1.5}px, ${stop.y}px) rotate(${rotate - 90}deg) translate(0px, -11px)` }">
                <g
                    transform="matrix(0.70710688829422,0.7071067094802856,-0.7071066498756409,0.70710688829422,3.2218211561925614,-7.778166386438556)">
                    <path
                        d="M10.99998950958252 7.77817440032959C10.99998950958252 3.48240729750328 14.4823968070858 0 18.77816390991211 0L18.77816390991211 0C23.07393101273842 0 26.5563383102417 3.482407297503281 26.5563383102417 7.77817440032959L26.5563383102417 7.77817440032959C26.5563383102417 12.073941503155899 23.07393101273842 15.55634880065918 18.77816390991211 15.55634880065918L10.99998950958252 15.55634880065918C10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918Z"
                        :fill="active === index ? '#1878f5' : '#fff'" fill-opacity="1" />
                </g>
                <clipPath id="avatar">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)"
                        clip-rule="evenodd" />
                </clippath>
                <image :xlink:href="trans_bgc" width="22" height="22" x="0" y="0" clip-path="url(#avatar)"
                    preserveAspectRatio="none meet"></image>
                <g
                    transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        :fill="to_rgba(stop.color)" />
                </g>
            </g>
        </g>
    </svg>
</template>
<style scoped lang="scss">
.bgc {
    background-image: linear-gradient(45deg, var(--mg-color-bg-surface) 25%, transparent 0, transparent 75%, var(--mg-color-bg-surface) 0), linear-gradient(45deg, var(--mg-color-bg-surface) 25%, transparent 0, transparent 75%, var(--mg-color-bg-surface) 0);
}
</style>