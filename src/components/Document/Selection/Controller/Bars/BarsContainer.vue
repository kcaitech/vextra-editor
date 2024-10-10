<script setup lang='ts'>
import { Context } from '@/context';
import {
    ColVector3D,
    CtrlElementType, makeShapeTransform2By1,
    ShapeView,
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, SelectionTheme, XY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { forbidden_to_modify_frame, getHorizontalAngle } from '@/utils/common';
import { ScaleHandler } from "@/transform/scale";
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/transform/pathEdit";
import { CursorType } from "@/utils/cursor2";
import { WorkSpace } from "@/context/workspace";
import { Action } from "@/context/tool";

interface Props {
    context: Context
    shape: ShapeView
    cFrame: Point[]
    theme: SelectionTheme
}

interface Emits {
    (e: 'dblclick', event: MouseEvent): void;
}

interface Bar {
    path: string
    type: CtrlElementType
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const data: {
    paths: Bar[],
} = reactive({ paths: [] });
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
    update_dot_path();
}

function update_dot_path() {
    paths.length = 0;

    const apex = getVectors();
    apex.push(apex[0]);

    for (let i = 0; i < apex.length - 1; i++) {
        const path = get_bar_path(apex[i], apex[i + 1]);
        paths.push({ path, type: types[i] });
    }
}

function getVectors() {
    const shape = props.shape;

    const { x, y, width, height } = shape.frame;

    const clientMatrix = makeShapeTransform2By1(props.context.workspace.matrix);
    const fromRoot = shape.transform2FromRoot;

    const fromClient = fromRoot.addTransform(clientMatrix);

    const {
        col0: vecLT,
        col1: vecRT,
        col2: vecRB,
        col3: vecLB
    } = fromClient.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height),
        ColVector3D.FromXY(x + width / 2, y + height / 2),
    ]);

    return [vecLT, vecRT, vecRB, vecLB];
}

function get_bar_path(s: {
    x: number,
    y: number
}, e: {
    x: number,
    y: number
}): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
}

// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler) {
        return;
    }

    event.stopPropagation();

    if (dbl_action()) {
        emits('dblclick', event);
        return startEdit(props.context);
    }

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

    const apex = getVectors();
    let deg = 90;

    if (t === CtrlElementType.RectTop) {
        deg += getHorizontalAngle(apex[0], apex[1]);
    } else if (t === CtrlElementType.RectRight) {
        deg += getHorizontalAngle(apex[1], apex[2]);
    } else if (t === CtrlElementType.RectBottom) {
        deg += getHorizontalAngle(apex[2], apex[3]);
    } else if (t === CtrlElementType.RectLeft) {
        deg += getHorizontalAngle(apex[3], apex[0]);
    }
    const action = props.context.tool.action;
    const type = action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;
    cursor.setType(type, deg);
}

function bar_mouseenter(type: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(type);
}

function bar_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update();
    }
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

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);

    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);

    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
<g
    v-for="(b, i) in paths"
    :key="i"
    @mousedown.stop="(e) => bar_mousedown(e, b.type)"
    @mouseenter="() => bar_mouseenter(b.type)"
    @mouseleave="bar_mouseleave"
>
    <path :d="b.path" class="main-path" :stroke="theme"/>
    <path :d="b.path" class="assist-path"/>
</g>
</template>
<style lang='scss' scoped>
.main-path {
    fill: none;
}

.assist-path {
    fill: none;
    stroke: transparent;
    stroke-width: 10px;
}

.dash {
    stroke-dasharray: 2 2;
}
</style>