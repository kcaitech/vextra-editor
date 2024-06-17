<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { ScaleHandler } from '@/transform/scale';
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    frame: Point[]
}

interface Bar {
    path: string
    type: CtrlElementType
}

const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { bars: Bar[] } = reactive({ bars: [] });
const { bars } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
const dragActiveDis = 3;
const types = [
    CtrlElementType.RectTop,
    CtrlElementType.RectRight,
    CtrlElementType.RectBottom,
    CtrlElementType.RectLeft
];
let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}

function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    bars.length = 0;
    const apex = props.frame.map(p => {
        return { x: p.x, y: p.y }
    });
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        const p = get_bar_path(apex[i], apex[i + 1]);
        bars.push({ path: p, type: types[i] });
    }
}

function passive_update() {
    matrix.reset(props.matrix);
    bars.length = 0;
    const apex = props.frame.map(p => {
        return { x: p.x, y: p.y }
    });
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        const p = get_bar_path(apex[i], apex[i + 1]);
        bars.push({ path: p, type: types[i] });
    }
}

function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y} z`;
}

// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    if (scaler) {
        return;
    }

    cur_ctrl_type = ele;

    startPosition = { x: event.x, y: event.y };

    scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, cur_ctrl_type);

    document.addEventListener('mousemove', bar_mousemove);
    document.addEventListener('mouseup', bar_mouseup);
}

function bar_mousemove(event: MouseEvent) {
    if (isDragging) {
        scaler?.execute(event);
    } else if (Math.hypot(event.x - startPosition.x, event.y - startPosition.y) > dragActiveDis) {
        scaler?.createApiCaller();
        isDragging = true;
    }
}

function bar_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clear_status();
}

function clear_status() {
    isDragging = false;

    scaler?.fulfil();
    scaler = undefined;

    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    document.removeEventListener('mousemove', bar_mousemove);
    document.removeEventListener('mouseup', bar_mouseup);
}

function setCursor(t: CtrlElementType) {
    if (t === CtrlElementType.RectTop) props.context.cursor.setType(CursorType.Scale, 90);
    else if (t === CtrlElementType.RectRight) props.context.cursor.setType(CursorType.Scale, 0);
    else if (t === CtrlElementType.RectBottom) props.context.cursor.setType(CursorType.Scale, 90);
    else if (t === CtrlElementType.RectLeft) props.context.cursor.setType(CursorType.Scale, 0);
}

function bar_mouseenter(type: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(type);
}

function bar_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}

function window_blur() {
    clear_status();
}

function frame_watcher() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        passive_update();
    }
}

watch(() => props.frame, frame_watcher);
watch(() => props.matrix, update);
onMounted(() => {
    update();
    window.addEventListener('blur', window_blur);
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g v-for="(b, i) in bars" :key="i" @mousedown.stop="(e) => bar_mousedown(e, b.type)"
       @mouseenter="() => bar_mouseenter(b.type)" @mouseleave="bar_mouseleave">
        <path :d="b.path" class="main-path"/>
        <path :d="b.path" class="assist-path"/>
    </g>
</template>
<style lang='scss' scoped>
.main-path {
    fill: none;
    stroke: var(--active-color);
}

.assist-path {
    fill: none;
    stroke: transparent;
    stroke-width: 10px;
}
</style>