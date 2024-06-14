<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, XY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { forbidden_to_modify_frame } from '@/utils/common';
import { get_transform, modify_rotate_before_set } from '../Points/common';
import { ScaleHandler } from "@/transform/scale";
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    cFrame: Point[]
}
interface Bar {
    path: string
    type: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { paths: Bar[] } = reactive({ paths: [] });
const { paths } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;

const dragActiveDis = 4;
const types = [
    CtrlElementType.RectTop,
    CtrlElementType.RectRight,
    CtrlElementType.RectBottom,
    CtrlElementType.RectLeft
];
let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;
let downXY: XY = { x: 0, y: 0 };

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    paths.length = 0;
    const frame = props.shape.frame;

    let apex = [
        { x: 0, y: 0 },
        { x: frame.width, y: 0 },
        { x: frame.width, y: frame.height },
        { x: 0, y: frame.height }
    ];
    apex = apex.map(p => matrix.computeCoord(p.x, p.y));

    apex.push(apex[0]);

    for (let i = 0; i < apex.length - 1; i++) {
        const path = get_bar_path(apex[i], apex[i + 1]);
        paths.push({ path, type: types[i] });
    }
}
function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y} z`;
}
// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler) {
        return;
    }

    event.stopPropagation();

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    cur_ctrl_type = ele;

    scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, cur_ctrl_type);

    downXY = event;

    document.addEventListener('mousemove', bar_mousemove);
    document.addEventListener('mouseup', bar_mouseup);
}
function bar_mousemove(event: MouseEvent) {
    if (isDragging) {
        scaler?.execute(event);
    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
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



function setCursor(t: CtrlElementType) {
    const cursor = props.context.cursor;
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);
    let deg = rotate;

    if (t === CtrlElementType.RectTop) {
        deg = modify_rotate_before_set(deg + 90, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectRight) {
        deg = modify_rotate_before_set(deg, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectBottom) {
        deg = modify_rotate_before_set(deg + 90, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectLeft) {
        deg = modify_rotate_before_set(deg, isFlippedHorizontal, isFlippedVertical);
    }

    cursor.setType(CursorType.Scale, deg);
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
watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g v-for="(b, i) in paths" :key="i" @mousedown.stop="(e) => bar_mousedown(e, b.type)"
        @mouseenter="() => bar_mouseenter(b.type)" @mouseleave="bar_mouseleave">
        <path :d="b.path" class="main-path">
        </path>
        <path :d="b.path" class="assist-path">
        </path>
    </g>
</template>
<style lang='scss' scoped>
.main-path {
    fill: none;
    stroke: var(--component-color);
}

.assist-path {
    fill: none;
    stroke: transparent;
    stroke-width: 10px;
}
</style>