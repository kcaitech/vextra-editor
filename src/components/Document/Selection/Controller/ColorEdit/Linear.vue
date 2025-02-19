<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY, Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import {
    getTextIndexAndLen,
    get_add_gradient_color,
    get_gradient,
    get_temporary_stop,
    isSelectText,
    to_rgba
} from './gradient_utils';
import {
    BasicArray,
    Color,
    Fill,
    FillMask,
    GradientEditor,
    GradientType,
    Matrix,
    ShapeType,
    Stop,
    TextShapeView,
    TransformRaw,
    cloneGradient
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import trans_bgc from '@/assets/trans_bgc3.png';
import { getHorizontalAngle } from '@/utils/common';
import { v4 } from 'uuid';
import TemporaryStop from './TemporaryStop.vue';
import Percent from './Percent.vue';
import { getShapesForStyle } from '@/utils/style';

interface Props {
    context: Context
    matrix: Matrix
}

const props = defineProps<Props>();
const matrix = new Matrix();

interface Dot {
    x: number,
    y: number,
    type: 'from' | 'to'
}

interface Stops {
    x: number,
    y: number,
    color: Color,
    id?: string
}

const dot1 = ref<Dot>({ x: 0, y: 0, type: 'from' });
const dot2 = ref<Dot>({ x: 0, y: 0, type: 'to' });
const dot = ref(false);
const stops = ref<Stops[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let dot_type: 'from' | 'to' = 'to';
let isDragging = false;
let gradientEditor: GradientEditor | undefined;
const dragActiveDis = 3;
const active = ref();
const rotate = ref(0);
const line_length = ref<number>(1);
const temporary_stop = ref<Stops>();
const temporary = ref(false);
const enter_stop = ref(false);
const percent_posi = ref({ x: 0, y: 0 });
const percent = ref(0);
const percent_show = ref(false);
const is_dot_down = ref(false);
const get_linear_points = () => {
    dot.value = false;
    stops.value = [];
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient || gradient.gradientType !== GradientType.Linear) return;
    let id = props.context.color.selected_stop ?? gradient.stops[0].id;
    const index = (gradient.stops as any[]).findIndex(i => i.id === id);
    if (index === -1) id = gradient.stops[0].id;
    active.value = id;
    let frame = shape.frame;
    let d1;
    let d2;
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix);
    d1 = m.computeCoord3({ x: frame.width * gradient.from.x, y: frame.height * gradient.from.y });
    d2 = m.computeCoord3({ x: frame.width * gradient.to.x, y: frame.height * gradient.to.y });
    dot1.value = { x: d1.x, y: d1.y, type: 'from' }
    dot2.value = { x: d2.x, y: d2.y, type: 'to' }
    line_length.value = Math.sqrt(Math.pow(d2.x - d1.x, 2) + Math.pow(d2.y - d1.y, 2));
    rotate.value = getHorizontalAngle({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y });
    for (let i = 0; i < gradient.stops.length; i++) {
        const stop = gradient.stops[i];
        const x1 = d1.x + ((d2.x - d1.x) * stop.position);
        const y1 = d1.y + ((d2.y - d1.y) * stop.position);
        stops.value.push({ x: x1, y: y1, color: stop.color as Color, id: stop.id });
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
    is_dot_down.value = true;
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
            let maskId = locate.type === 'fills' ? shape.style.fillsMask : shape.style.borders.fillsMask;
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
    document.removeEventListener('mousemove', dot_mousemove);
    document.removeEventListener('mouseup', dot_mouseup);
}

const rect_enter = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    const posi = get_stop_position(e);
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    temporary_stop.value = get_temporary_stop(posi, dot1.value, dot2.value, shape, props.context);
    temporary.value = true;
    get_percent_posi(e);
    percent_show.value = true;
}
const rect_leave = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    if (!enter_stop.value) {
        temporary.value = false;
    }
    percent_show.value = false;
}

const rect_mousemove = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    const posi = get_stop_position(e);
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
    percent.value = +(posi * 100).toFixed(0);
    temporary_stop.value = get_temporary_stop(posi, dot1.value, dot2.value, shape, props.context);
}
const stop_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    temporary.value = false;
    const shape = getShapesForStyle(props.context.selection.selectedShapes)[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    get_percent_posi(e);
    enter_stop.value = true;
}
const update_percent = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    get_percent_posi(e);
}
const down_stop_id = ref<string>('');
const add_stop = (e: MouseEvent) => {
    const posi = get_stop_position(e);
    const locate = props.context.color.locate;
    startPosition = props.context.workspace.getContentXY(e);
    if (!locate) return;
    const selected = props.context.selection.selectedShapes;
    const shape = getShapesForStyle(selected)[0];
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
        let maskId = locate.type === 'fills' ? shape.style.fillsMask : shape.style.borders.fillsMask;
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
    })
}

const get_stop_position = (e: MouseEvent) => {
    const m_p = props.context.workspace.getContentXY(e);
    const m = new Matrix();
    m.trans(-dot1.value.x, -dot1.value.y);
    m.rotate(-rotate.value * Math.PI / 180);
    const p = m.computeCoord3(m_p).x / line_length.value
    return Math.min(Math.max(p, 0), 1);
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

const get_percent_posi = (e: MouseEvent) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_posi.value.x = r_p.x + 20;
    percent_posi.value.y = r_p.y + 20;
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
        const posi = get_stop_position(e);
        get_percent_posi(e);
        percent.value = +(posi * 100).toFixed(0);
        let fill: Fill[] = [];
        if (locate.type !== 'text') {
            let maskId = locate.type === 'fills' ? shape.style.fillsMask : shape.style.borders.fillsMask;
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

const stop_content_enter = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    get_percent_posi(e);
    temporary.value = false;
    percent_show.value = true;
}
const stop_content_leave = (e: MouseEvent) => {
    percent_show.value = false;
}

const stop_leave = (e: MouseEvent) => {
    enter_stop.value = false;
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
    if (t === Selection.CHANGE_SHAPE) watcher();
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
    props.context.selection.unwatch(selected_watcher);
    props.context.color.unwatch(color_watcher);
})
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g v-if="dot">
            <TemporaryStop v-if="temporary" :stop="temporary_stop!" :rotate="rotate - 90" />
            <rect width="20" :height="line_length" ref="stop_container"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg)` }"
                fill="transparent" @mousemove="(e) => rect_mousemove(e)" @mousedown.stop="(e) => add_stop(e)"
                @mouseenter="rect_enter" @mouseleave="rect_leave" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="black" stroke-width="3" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="white" stroke-width="2" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot1.type)" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot2.type)" />
            <g v-for="(stop, index) in stops" :key="index" @mouseenter="stop_content_enter"
                @mouseleave="stop_content_leave"
                :style="{ transform: `translate(${stop.x + 3.5}px, ${stop.y}px) rotate(${rotate - 90}deg) translate(0px, -11px)` }">
                <g
                    transform="matrix(0.70710688829422,0.7071067094802856,-0.7071066498756409,0.70710688829422,3.2218211561925614,-7.778166386438556)">
                    <path
                        d="M10.99998950958252 7.77817440032959C10.99998950958252 3.48240729750328 14.4823968070858 0 18.77816390991211 0L18.77816390991211 0C23.07393101273842 0 26.5563383102417 3.482407297503281 26.5563383102417 7.77817440032959L26.5563383102417 7.77817440032959C26.5563383102417 12.073941503155899 23.07393101273842 15.55634880065918 18.77816390991211 15.55634880065918L10.99998950958252 15.55634880065918C10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918Z"
                        :fill="active === stop.id ? '#1878f5' : '#fff'" />
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
</template>
