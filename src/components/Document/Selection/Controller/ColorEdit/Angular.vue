<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY, Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { get_add_gradient_color, get_gradient, get_temporary_stop, to_rgba } from './gradient_utils';
import { AsyncGradientEditor, Color, Matrix, ShapeView, Stop, adapt2Shape } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import trans_bgc from '@/assets/trans_bgc3.png';
import { getHorizontalAngle } from '@/utils/common';
import { get_aciton_gradient_stop } from '@/utils/shape_style';
import { v4 } from 'uuid';
import TemporaryStop from './TemporaryStop.vue';
import Percent from './Percent.vue';
import { computed } from 'vue';
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const matrix = new Matrix();
type DotType = 'from' | 'to' | 'ellipse';
interface Dot {
    x: number, y: number, type: DotType
}
interface Stops {
    x: number, y: number, color: Color
}

const dot1 = ref<Dot>({ x: 0, y: 0, type: 'from' });
const dot2 = ref<Dot>({ x: 0, y: 0, type: 'to' });
const dot3 = ref<Dot>({ x: 0, y: 0, type: 'ellipse' });
const dot = ref(false);
const stops = ref<Stops[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let dot_type: DotType = 'to';
let isDragging = false;
let gradientEditor: AsyncGradientEditor | undefined;
const dragActiveDis = 3;
const active = ref(0);
const shapes = ref<ShapeView[]>([]);
const rotate = ref(0);
const rotate_r = computed<number>(() => {
    return rotate.value * Math.PI / 180;
})
const line_length = ref<number>(1);
const temporary_stop = ref<Stops>();
const temporary = ref(false);
const enter_stop = ref(false);
const percent_posi = ref({ x: 0, y: 0 });
const percent = ref(0);
const percent_show = ref(false);
const ellipse_length = ref<number>(1);
const ellipseL = ref(1);
const ellipse_show = ref(false);
const get_linear_points = () => {
    dot.value = false;
    stops.value = [];
    shapes.value = props.context.selection.selectedShapes;
    const shape = shapes.value[0] as ShapeView;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    active.value = props.context.color.selected_stop;
    const frame = shape.frame;
    const m = shape.matrix2Root();
    m.preScale(frame.width, frame.height);
    m.multiAtLeft(matrix);
    const d1 = m.computeCoord3({ x: gradient.from.x, y: gradient.from.y });
    const d2 = m.computeCoord3({ x: gradient.to.x, y: gradient.to.y });
    dot1.value = { x: d1.x, y: d1.y, type: 'from' }
    dot2.value = { x: d2.x, y: d2.y, type: 'to' }
    line_length.value = Math.sqrt(Math.pow(d2.x - d1.x, 2) + Math.pow(d2.y - d1.y, 2));
    rotate.value = getHorizontalAngle({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y });
    dot3.value = { type: 'ellipse', ...get_elipse_point2(gradient.elipseLength || 0, line_length.value, d1) };

    ellipseL.value = gradient.elipseLength || 0;
    ellipse_length.value = Math.sqrt(Math.pow(dot3.value.x - dot1.value.x, 2) + Math.pow(dot3.value.y - dot1.value.y, 2));
    dot.value = true;
}

function get_elipse_point2(ellipseLength: number, main_apex_length:number, from: { x: number, y: number }) {
    const ellipse = { x: main_apex_length * ellipseLength, y: 0 };
    const m = new Matrix();
    m.rotate(Math.PI * 0.5 + rotate_r.value);
    m.trans(from.x, from.y);
    
    return m.computeCoord3(ellipse);
}
const down_ellipse = ref(false);
const dot_mousedown = (e: MouseEvent, type: DotType) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const workspace = props.context.workspace;
    startPosition = workspace.getContentXY(e);
    document.addEventListener('mousemove', dot_mousemove);
    document.addEventListener('mouseup', dot_mouseup);
    dot_type = type;
    if (type === 'ellipse') {
        down_ellipse.value = true;
    }
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
        const gradient = get_gradient(props.context, shape);
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
        } else if (dot_type === 'ellipse') {
            update_ellipse_dot(e);
            const m_p = props.context.workspace.getContentXY(e);
            const m = new Matrix();
            m.trans(-dot1.value.x, -dot1.value.y);
            m.rotate(-rotate_r.value);
            const p = m.computeCoord3(m_p).y;
            console.log(p, 'p');
            
            // gradientEditor.execute_elipselength(Math.abs(p));
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
    down_ellipse.value = false;
    ellipse_show.value = false;
    document.removeEventListener('mousemove', dot_mousemove);
    document.removeEventListener('mouseup', dot_mouseup);
}

const stop_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    const shape = shapes.value[0] as ShapeView;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    enter_stop.value = true;
}
const updata_percent = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
}
const down_stop_id = ref<string>('');
const add_stop = (e: MouseEvent) => {
    const posi = get_stop_position(e);
    const locat = props.context.color.locat;
    const shape = shapes.value[0] as ShapeView;
    startPosition = props.context.workspace.getContentXY(e);
    if (!locat) return;
    const gradient_type = shape.style[locat.type];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const _stop = get_add_gradient_color(gradient.stops, posi);
    if (!_stop) return;
    const idx = gradient_type.length - locat.index - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const stop = new Stop(posi, _stop.color, v4());
    const actions = get_aciton_gradient_stop(selected, idx, stop, locat.type);
    editor.addShapesGradientStop(actions);
    nextTick(() => {
        down_stop(e, _stop.index);
    })
}

const get_stop_position = (e: MouseEvent) => {
    const m_p = props.context.workspace.getContentXY(e);
    const m = new Matrix();
    m.trans(-dot1.value.x, -dot1.value.y);
    m.rotate(-rotate_r.value);
    const p = m.computeCoord3(m_p).x / line_length.value
    const posi = Math.min(Math.max(p, 0), 1);
    return posi;
}
const stop_mousedown = (e: MouseEvent, index: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    down_stop(e, index);
}

const down_stop = (e: MouseEvent, index: number) => {
    const shape = shapes.value[0] as ShapeView;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const workspace = props.context.workspace;
    props.context.color.select_stop(index);
    down_stop_id.value = gradient.stops[index].id;
    startPosition = workspace.getContentXY(e);
    document.addEventListener('mousemove', stop_mousemove);
    document.addEventListener('mouseup', stop_mouseup);
}

const stop_mousemove = (e: MouseEvent) => {
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
        const gradient = get_gradient(props.context, shape);
        if (!gradient) return;
        const index = gradient.stops.findIndex((s) => s.id === down_stop_id.value);
        props.context.color.select_stop(index);
        const posi = get_stop_position(e);
        percent.value = +(posi * 100).toFixed(0);
        gradientEditor.execute_stop_position(posi, down_stop_id.value);
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            const page = props.context.selection.selectedPage;
            gradientEditor = props.context.editor.controller().asyncGradientEditor(shapes.value.map((s) => adapt2Shape(s as ShapeView)), page!, locat.index, locat.type);
        }
    }
}

const get_percent_posi = (e: MouseEvent) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
}

const stop_mouseup = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.close();
        gradientEditor = undefined;
    }
    document.removeEventListener('mousemove', stop_mousemove);
    document.removeEventListener('mouseup', stop_mouseup);
}
const stop_content_enter = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    get_percent_posi(e);
    percent_show.value = true;
}

const ellipse_dot = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    update_ellipse_dot(e);
    ellipse_show.value = true;
}

const update_ellipse_dot = (e: MouseEvent) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
    const gradient = get_gradient(props.context, shapes.value[0] as ShapeView);
    if (!gradient) return;
    percent.value = +((gradient.elipseLength || 0) * 100).toFixed(0);
}
const leave_ellipse_dot = () => {
    if (down_ellipse.value) return;
    ellipse_show.value = false;
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

const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        watcher();
    }
}

onMounted(() => {
    watcher();
    watchShapes();
    props.context.workspace.watch(workspace_watcher);
    props.context.selection.watch(selected_watcher);
    props.context.color.watch(color_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.color.unwatch(color_watcher);
    props.context.selection.unwatch(selected_watcher);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g v-if="dot">
            <TemporaryStop v-if="temporary" :stop="temporary_stop!" :rotate="rotate"></TemporaryStop>
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="ellipse_length" :ry="line_length" fill="none" stroke="#000000"
                stroke-width="3"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="ellipse_length" :ry="line_length" fill="none" stroke="#ffffff"
                stroke-width="2"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="black" stroke-width="3" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="white" stroke-width="2" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot1.type)"></circle>
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot2.type)"></circle>
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot3.x" :cy="dot3.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot3.type)" @mouseenter="ellipse_dot"
                @mouseleave="leave_ellipse_dot"></circle>
            <g v-for="(stop, index) in stops" :key="index" @mouseenter="stop_content_enter"
                @mouseleave="percent_show = false"
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
                        :fill="to_rgba(stop.color)" @mouseenter.stop="(e) => stop_enter(e, index)"
                        @mouseleave.stop="enter_stop = false" @mousedown.stop="(e) => stop_mousedown(e, index)"
                        @mousemove="updata_percent" />
                </g>
            </g>
        </g>
    </svg>
    <Percent v-if="percent_show" :x="percent_posi.x" :y="percent_posi.y" :size="percent"></Percent>
    <Percent v-if="ellipse_show" :x="percent_posi.x" :y="percent_posi.y" :size="percent"></Percent>
</template>
<style scoped lang="scss"></style>