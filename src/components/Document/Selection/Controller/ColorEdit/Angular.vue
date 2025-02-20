<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY, Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { getTextIndexAndLen, get_add_gradient_color, get_gradient, isSelectText, to_rgba } from './gradient_utils';
import {
    AsyncGradientEditor,
    BasicArray,
    Color,
    Fill,
    FillMask,
    GradientEditor,
    GradientType,
    Matrix,
    ShapeType,
    ShapeView,
    Stop,
    TableView,
    TextShapeView,
    TransformRaw,
    cloneGradient
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import trans_bgc from '@/assets/trans_bgc3.png';
import { getHorizontalAngle } from '@/utils/common';
import { get_action_gradient_stop } from '@/utils/shape_style';
import { v4 } from 'uuid';
import TemporaryStop from './TemporaryStop.vue';
import Percent from './Percent.vue';
import { computed } from 'vue';
import { flattenShapes } from '@/utils/cutout';
import { getShapesForStyle } from '@/utils/style';
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const matrix = new Matrix();
type DotType = 'from' | 'to';
interface Dot {
    x: number, y: number, type: DotType
}
interface Stops {
    x: number, y: number, color: Color, id?: string, r?: number
}

const dot1 = ref<Dot>({ x: 0, y: 0, type: 'from' });
const dot2 = ref<Dot>({ x: 0, y: 0, type: 'to' });
const dot = ref(false);
const stops = ref<Stops[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let dot_type: DotType = 'to';
let isDragging = false;
let gradientEditor: GradientEditor | undefined;
const dragActiveDis = 3;
const active = ref();
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
const ellipse_show = ref(false);
const is_dot_down = ref(false);
const slope_r = ref(0);
const get_linear_points = () => {
    dot.value = false;
    stops.value = [];
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient || gradient.gradientType !== GradientType.Angular) return;
    let id = props.context.color.selected_stop ?? gradient.stops[0].id;
    const index = (gradient.stops as any[]).findIndex(i => i.id === id);
    if (index === -1) id = gradient.stops[0].id;
    active.value = id;
    let frame = shape.frame;
    let d1;
    let d2;
    const m = shape.matrix2Root();
    m.preScale(frame.width, frame.height);
    m.multiAtLeft(matrix);
    d1 = m.computeCoord3({ x: gradient.from.x, y: gradient.from.y });
    d2 = m.computeCoord3({ x: gradient.to.x, y: gradient.to.y });
    dot1.value = { x: d1.x, y: d1.y, type: 'from' }
    dot2.value = { x: d2.x, y: d2.y, type: 'to' }
    line_length.value = Math.sqrt(Math.pow(d2.x - d1.x, 2) + Math.pow(d2.y - d1.y, 2));
    rotate.value = getHorizontalAngle({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y });

    for (let i = 0; i < gradient.stops.length; i++) {
        const stop = gradient.stops[i];
        const theta = stop.position * 360;
        const point = calculateEllipsePoint(line_length.value, -(270 - theta));
        const r_p = rotatePoint(point.x, point.y, dot1.value.x, dot1.value.y, rotate.value - 90);
        stops.value.push({ x: r_p.x, y: r_p.y, color: stop.color as Color, id: stop.id, r: rotate.value + theta });
    }
    dot.value = true;
}

function calculateEllipsePoint(a: number, angle: number) {
    const theta = angle * (Math.PI / 180); // 将角度转换为弧度
    const x = a * Math.cos(theta);
    const y = a * Math.sin(theta);
    return { x: x, y: y };
}
function rotatePoint(x: number, y: number, centerX: number, centerY: number, rotationAngle: number) {
    const theta = rotationAngle * (Math.PI / 180);
    const rotatedX = x * Math.cos(theta) - y * Math.sin(theta);
    const rotatedY = x * Math.sin(theta) + y * Math.cos(theta);
    const newX = rotatedX + centerX;
    const newY = rotatedY + centerY;
    return { x: newX, y: newY };
}
const down_ellipse = ref(false);
const dot_mousedown = (e: MouseEvent, type: DotType) => {
    if (e.button !== 0) return;
    percent_show.value = false;
    e.stopPropagation();
    const workspace = props.context.workspace;
    startPosition = workspace.getContentXY(e);
    is_dot_down.value = true;
    document.addEventListener('mousemove', dot_mousemove);
    document.addEventListener('mouseup', dot_mouseup);
    dot_type = type;
}

const dot_mousemove = (e: MouseEvent) => {
    if (!is_dot_down.value) return;
    const locate = props.context.color.locate;
    if (!locate) return;
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = startPosition;
    const dx = x - sx;
    const dy = y - sy;
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    if (isDragging && gradientEditor) {
        startPosition.x = x;
        startPosition.y = y;
        const matrix = new TransformRaw();
        let frame = shape.frame;
        matrix.preScale(frame.width, frame.height);
        matrix.multiAtLeft(shape.matrix2Root());
        matrix.multiAtLeft(props.context.workspace.matrix);
        const m = (matrix.inverse);
        const posi = m.computeCoord(x, y);
        let fill: Fill[] = [];
        if (locate.type !== 'text') {
            let maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
            if (maskId) {
                const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
                fill = [mask.fills[locate.index]];
            } else {
                fill = locate.type === 'fills' ? [shape.getFills()[locate.index]] : [shape.getBorders().strokePaints[locate.index]];
            }
        }
        if (dot_type === 'from') {
            gradientEditor.modifyFrom(fill, posi);
        } else if (dot_type === 'to') {
            gradientEditor.modifyTo(fill, posi);
        }
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            gradientEditor = new GradientEditor(props.context.coopRepo);
        }
    }
}

const dot_mouseup = (e: MouseEvent) => {
    is_dot_down.value = false;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.commit();
        gradientEditor = undefined;
    }
    down_ellipse.value = false;
    ellipse_show.value = false;
    document.removeEventListener('mousemove', dot_mousemove);
    document.removeEventListener('mouseup', dot_mouseup);
}

const stop_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    enter_stop.value = true;
}
const update_percent = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
}
const down_stop_id = ref<string>('');
const add_stop = (e: MouseEvent) => {
    const posi = get_stop_position(e);
    const locate = props.context.color.locate;
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    startPosition = props.context.workspace.getContentXY(e);
    if (!locate) return;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const _stop = get_add_gradient_color(gradient.stops, posi);
    if (!_stop) return;
    const page = props.context.selection.selectedPage!;
    const stop = new Stop(new BasicArray(), v4(), posi, _stop.color);
    if (locate.type !== 'text') {
        const idx = locate.index;
        const editor = props.context.editor4Page(page);
        let fills: Fill[] = [];
        let maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
        if (maskId) {
            const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
            fills = mask.fills;
        } else {
            fills = locate.type === 'fills' ? shape.getFills() : shape.getBorders().strokePaints;
        }
        editor.addShapesGradientStop([{ fill: fills[idx], stop }]);
    } else {
        const { textIndex, selectLength } = getTextIndexAndLen(props.context);
        const new_gradient = cloneGradient(gradient);
        new_gradient.stops.push(stop);
        const s = new_gradient.stops as BasicArray<Stop>;
        s.sort((a, b) => {
            if (a.position > b.position) {
                return 1;
            } else if (a.position < b.position) {
                return -1;
            } else {
                return 0;
            }
        })
        const shapes = getShapesForStyle(props.context.selection.selectedShapes);
        const text_shapes = shapes.filter((s) => s.type === ShapeType.Text);
        const editor = props.context.editor4TextShape(text_shapes[0] as TextShapeView);
        if (text_shapes.length === 1) {
            if (isSelectText(props.context)) {
                editor.setTextGradient(new_gradient, 0, Infinity);
            } else {
                editor.setTextGradient(new_gradient, textIndex, selectLength);
            }
        } else {
            editor.setTextGradientMulti(text_shapes as TextShapeView[], new_gradient);
        }
    }
    nextTick(() => {
        down_stop(e, stop.id);
        temporary.value = false;
    })
}

/**
 * 获取圆弧上的点的百分比
 * @param e 鼠标事件
 */
const get_stop_position = (e: MouseEvent) => {
    const m_p = props.context.workspace.getContentXY(e);
    const m = new Matrix();
    m.trans(-dot1.value.x, -dot1.value.y);
    m.rotate(-rotate_r.value);
    const r = getHorizontalAngle(m.computeCoord3({ x: dot1.value.x, y: dot1.value.y }), m.computeCoord3(m_p));
    return r / 360;
}

const stop_mousedown = (e: MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    down_stop(e, id);
}
const is_stop_down = ref(false);
const down_stop = (e: MouseEvent, id: string) => {
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    temporary.value = false;
    const workspace = props.context.workspace;
    props.context.color.select_stop(id);
    down_stop_id.value = id;
    startPosition = workspace.getContentXY(e);
    is_stop_down.value = true;
    document.addEventListener('mousemove', stop_mousemove);
    document.addEventListener('mouseup', stop_mouseup);
}

const stop_mousemove = (e: MouseEvent) => {
    if (!is_stop_down.value) return;
    const locate = props.context.color.locate;
    if (!locate) return;
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = startPosition;
    const dx = x - sx;
    const dy = y - sy;
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    if (isDragging && gradientEditor) {
        startPosition.x = x;
        startPosition.y = y;
        get_percent_posi(e);
        const posi = get_stop_position(e);
        percent.value = +(posi * 100).toFixed(0);
        let fill: Fill[] = [];
        if (locate.type !== 'text') {
            let maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
            if (maskId) {
                const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
                fill = [mask.fills[locate.index]];
            } else {
                fill = locate.type === 'fills' ? [shape.getFills()[locate.index]] : [shape.getBorders().strokePaints[locate.index]];
            }
        }
        gradientEditor.modifyStopPosition(fill, posi, down_stop_id.value);
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            gradientEditor = new GradientEditor(props.context.coopRepo);
        }
    }
}

const get_percent_posi = (e: MouseEvent) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
}

const stop_mouseup = (e: MouseEvent) => {
    is_stop_down.value = false;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.commit();
        gradientEditor = undefined;
    }
    percent_show.value = false;
    document.removeEventListener('mousemove', stop_mousemove);
    document.removeEventListener('mouseup', stop_mouseup);
}

const stop_content_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    get_percent_posi(e);
    temporary.value = false;
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    percent_show.value = true;
}

const hover_ellipse_move = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    if (enter_stop.value) enter_stop.value = false;
    e.stopPropagation();
    const posi = get_stop_position(e);
    percent.value = +(posi * 100).toFixed(0);
    get_temporary_stop(e);
}

const hover_ellipse_enter = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    get_temporary_stop(e);
    temporary.value = true;
    percent_show.value = true;
}

const get_temporary_stop = (e: MouseEvent) => {
    const posi = get_stop_position(e);
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    get_percent_posi(e);
    const theta = posi * 360;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const stop = get_add_gradient_color(gradient.stops, posi);
    if (!stop) return
    const point = calculateEllipsePoint(line_length.value + 1.5, -(270 - theta));
    const r_p = rotatePoint(point.x - 1.5, point.y, dot1.value.x, dot1.value.y, rotate.value - 90);
    slope_r.value = rotate.value + theta;
    temporary_stop.value = { x: r_p.x, y: r_p.y, color: stop.color };
}

const hover_ellipse_leave = (e: MouseEvent) => {
    e.stopPropagation();
    if (!enter_stop.value) {
        temporary.value = false;
    }
    percent_show.value = false;
}

const stop_leave = (e: MouseEvent) => {
    enter_stop.value = false;
}

const stop_content_leave = (e: MouseEvent) => {
    percent_show.value = false;
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

const workspace_watcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        watcher();
    }
}
const color_watcher = (t: number) => {
    if (t === ColorCtx.CHANGE_STOP) {
        active.value = props.context.color.selected_stop;
    } else if (t === ColorCtx.GRADIENT_UPDATE) {
        get_linear_points();
    }
}

const selected_watcher = (t: number | string) => {
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
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g v-if="dot">
            <TemporaryStop v-if="temporary" :stop="temporary_stop!" :rotate="slope_r" />
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="line_length + 10" :ry="line_length + 10" fill="none"
                stroke="transparent" stroke-width="20" @mousedown="add_stop" @mousemove="hover_ellipse_move"
                @mouseenter="hover_ellipse_enter" @mouseleave="hover_ellipse_leave"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px,${-dot1.y}px)` }" />
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="line_length" :ry="line_length" fill="none" stroke="#000000"
                stroke-width="3"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="line_length" :ry="line_length" fill="none" stroke="#ffffff"
                stroke-width="2"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="black" stroke-width="3" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="white" stroke-width="2" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot1.type)" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot2.type)" />
            <g v-for="(stop, index) in stops" :key="index" @mouseenter="(e) => stop_content_enter(e, index)"
                @mouseleave="stop_content_leave"
                :style="{ transform: `translate(${stop.x}px, ${stop.y}px) rotate(${stop.r}deg) translate(3px, -11px)` }">
                <g
                    transform="matrix(0.70710688829422,0.7071067094802856,-0.7071066498756409,0.70710688829422,3.2218211561925614,-7.778166386438556)">
                    <path
                        d="M10.99998950958252 7.77817440032959C10.99998950958252 3.48240729750328 14.4823968070858 0 18.77816390991211 0L18.77816390991211 0C23.07393101273842 0 26.5563383102417 3.482407297503281 26.5563383102417 7.77817440032959L26.5563383102417 7.77817440032959C26.5563383102417 12.073941503155899 23.07393101273842 15.55634880065918 18.77816390991211 15.55634880065918L10.99998950958252 15.55634880065918C10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918Z"
                        :fill="active === stop.id ? '#1878f5' : '#fff'" fill-opacity="1" />
                </g>
                <clipPath id="avatar">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)"
                        clip-rule="evenodd" />
                </clippath>
                <image :xlink:href="trans_bgc" width="22" height="22" x="0" y="0" clip-path="url(#avatar)"
                    preserveAspectRatio="none meet" />
                <g
                    transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        :fill="to_rgba(stop.color)" @mouseenter="(e) => stop_enter(e, index)" @mouseleave="stop_leave"
                        @mousedown.stop="(e) => stop_mousedown(e, stop.id!)" @mousemove="update_percent" />
                </g>
            </g>
        </g>
    </svg>
    <Percent v-if="percent_show" :x="percent_posi.x" :y="percent_posi.y" :size="percent" />
    <Percent v-if="ellipse_show" :x="percent_posi.x" :y="percent_posi.y" :size="percent" />
</template>