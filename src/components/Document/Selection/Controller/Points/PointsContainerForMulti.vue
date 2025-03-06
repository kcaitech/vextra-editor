<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { update_dots } from './common';
import { getHorizontalAngle } from '@/utils/common';
import { WorkSpace } from '@/context/workspace';
import { ScaleHandler } from '@/transform/scale';
import { RotateHandler } from '@/transform/rotate';
import { CursorType } from "@/utils/cursor2";
import { Action } from "@/context/tool";

interface Props {
    context: Context;
    frame: Point[];
    axle: { x: number, y: number };
}

interface Dot {
    point: { x: number, y: number };
    extra: { x: number, y: number };
    r: { p: string, transform: string };
    type: CtrlElementType;
    type2: CtrlElementType;
}

const props = defineProps<Props>();
const dots = reactive<{ dots: Dot[] }>({ dots: [] }).dots;
const dragActiveDis = 3;
const assist = ref<boolean>(false);

let isDragging = false;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
let isRotateElement = false;
let scaler: ScaleHandler | undefined = undefined;
let rotator: RotateHandler | undefined = undefined;
let startPosition: ClientXY = { x: 0, y: 0 };
let need_reset_cursor_after_transform = true;

function update() {
    props.context.workspace.shouldSelectionViewUpdate && render();
}

function render() {
    dots.length = 0;
    dots.push(...update_dots(props.frame));

    const [v1, v2, v3] = props.frame;
    const width = Math.hypot(v2.x - v1.x, v2.y - v1.y);
    const height = Math.hypot(v3.x - v1.x, v3.y - v1.y);
    assist.value = !(width < 24 || height < 24);
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }
    event.stopPropagation();

    if (rotator || scaler) return;

    cur_ctrl_type = ele;

    if (cur_ctrl_type.endsWith('rotate')) {
        rotator = new RotateHandler(props.context, event, props.context.selection.selectedShapes);
        isRotateElement = true;

    } else {
        scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, cur_ctrl_type);
        isRotateElement = false;
    }

    startPosition = props.context.workspace.getContentXY(event);

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = workspace.getContentXY(event);

    if (isDragging) {
        if (isRotateElement) {
            rotator?.execute(event);
            props.context.cursor.setTypeForce(CursorType.Rotate, getHorizontalAngle(props.axle, { x: mx, y: my }));
        } else {
            scaler?.execute(event);
        }

        startPosition = { x: mx, y: my };

        props.context.nextTick(props.context.selection.selectedPage!, () => {
            workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        });
    } else if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
        isRotateElement
            ? rotator?.createApiCaller()
            : scaler?.createApiCaller();

        isDragging = true;
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button === 0) clear_status();
}

function setCursor(t: CtrlElementType) {
    const cursor = props.context.cursor;
    let deg = 0;
    if (t === CtrlElementType.RectLT) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectLTR) {
        deg = deg + 225;
    } else if (t === CtrlElementType.RectRT) {
        deg = deg + 135;
    } else if (t === CtrlElementType.RectRTR) {
        deg = deg + 315;
    } else if (t === CtrlElementType.RectRB) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectRBR) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectLB) {
        deg = deg + 135;
    } else if (t === CtrlElementType.RectLBR) {
        deg = deg + 135;
    }
    const action = props.context.tool.action;
    const type = t.endsWith('rotate') ? CursorType.Rotate : action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;

    cursor.setType(type, deg);
}

function point_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}

function point_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}

function clear_status() {
    isDragging = false;

    scaler?.fulfil();
    rotator?.fulfil();

    scaler = undefined;
    rotator = undefined;

    if (need_reset_cursor_after_transform) props.context.cursor.reset();

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

function window_blur() {
    clear_status();
}

watch(() => props.frame, render);

onMounted(() => {
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
<g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
    <path
        class="r-path"
        :d="p.r.p"
        @mousedown.stop="(e) => point_mousedown(e, p.type2)"
        @mouseenter="() => point_mouseenter(p.type2)"
        @mouseleave="point_mouseleave"
    />
    <g
        @mousedown.stop="(e) => point_mousedown(e, p.type)"
        @mouseenter="() => point_mouseenter(p.type)"
        @mouseleave="point_mouseleave"
    >
        <rect v-if="assist" class="assist-rect" :x="p.extra.x" :y="p.extra.y"/>
        <rect class="main-rect" :x="p.point.x" :y="p.point.y" rx="2px"/>
    </g>
</g>
</template>
<style lang="scss" scoped>
.r-path {
    stroke: none;
    fill: transparent;
}

.assist-rect {
    width: 14px;
    height: 14px;
    fill: transparent;
    //fill: blue;
    stroke: none;
}

.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
    stroke: var(--active-color);
}
</style>