<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, XY } from '@/context/selection';
import { forbidden_to_modify_frame, getHorizontalAngle } from '@/utils/common';
import { get_transform, modify_rotate_before_set, update_dot } from './common';
import { Point } from "../../SelectionView.vue";
import { ScaleHandler } from "@/transform/scale";
import { RotateHandler } from "@/transform/rotate";
import { WorkSpace } from "@/context/workspace";
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    axle: { x: number, y: number }
    cFrame: Point[]
}

interface Dot {
    point: { x: number, y: number }
    extra: { x: number, y: number }
    r: { p: string, transform: string }
    type: CtrlElementType
    type2: CtrlElementType
}

const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;

const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;

let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;
let rotator: RotateHandler | undefined = undefined;

let downXY: XY = { x: 0, y: 0 };
let initDeg: number = 0;

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}

function update_dot_path() {
    dots.length = 0;
    const frame = props.shape.frame;
    let lt = matrix.computeCoord2(0, 0);
    let rt = matrix.computeCoord2(frame.width, 0);
    let rb = matrix.computeCoord2(frame.width, frame.height);
    let lb = matrix.computeCoord2(0, frame.height);

    dots.push(...update_dot([lt, rt, rb, lb], props.shape));
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler || rotator) {
        return;
    }

    event.stopPropagation();

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    startPosition = props.context.workspace.getContentXY(event);
    cur_ctrl_type = ele;

    initDeg = getHorizontalAngle(props.axle, startPosition);

    if (cur_ctrl_type.endsWith('rotate')) {
        rotator = new RotateHandler(props.context, event, props.context.selection.selectedShapes);
    } else {
        scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, cur_ctrl_type);
    }

    downXY = event;

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;

    if (isDragging) {
        if (cur_ctrl_type.endsWith('rotate')) {
            setCursor(cur_ctrl_type, true);
            rotator?.execute(event);
        } else {
            scaler?.execute(event);
        }

        props.context.nextTick(props.context.selection.selectedPage!, () => {
            workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        });
    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        isDragging = true;
        if (cur_ctrl_type.endsWith('rotate')) {
            rotator?.createApiCaller();
        } else {
            scaler?.createApiCaller();
        }
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clear_status();
}

function setCursor(t: CtrlElementType, active = false) {
    const cursor = props.context.cursor;
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);

    // type
    const type = t.endsWith('rotate') ? CursorType.Rotate : CursorType.Scale;

    // rotate
    let deg = rotate;
    if (t === CtrlElementType.RectLT) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectRT) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectRB) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectLB) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectLTR) {
        deg = modify_rotate_before_set(deg + 225, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectRTR) {
        deg = modify_rotate_before_set(deg + 315, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectRBR) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
    } else if (t === CtrlElementType.RectLBR) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
    }

    active
        ? cursor.setTypeForce(type, deg)
        : cursor.setType(type, deg);
}

function point_mouseenter(t: CtrlElementType) {
    setCursor(t);
    need_reset_cursor_after_transform = false;
}

function point_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}
function clear_status() {
    isDragging = false;

    scaler?.fulfil();
    scaler = undefined;

    rotator?.fulfil();
    rotator = undefined;

    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

function window_blur() {
    clear_status();
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
    <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
        <path :d="p.r.p" class="r-path" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
            @mouseenter="() => point_mouseenter(p.type2)" @mouseleave="point_mouseleave">
        </path>

        <g @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
            @mouseleave="point_mouseleave">
            <rect :x="p.extra.x" :y="p.extra.y" class="assist-rect"></rect>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px"></rect>
        </g>
    </g>
</template>
<style lang='scss' scoped>
.r-path {
    fill: transparent;
    stroke: none;
}

.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
    stroke: var(--component-color);
    stroke-width: 1px;
}

.assist-rect {
    width: 14px;
    height: 14px;
    stroke: transparent;
    fill: transparent;
}
</style>