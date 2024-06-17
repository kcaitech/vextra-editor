<script setup lang='ts'>
import { Context } from '@/context';
import { ColVector3D, CtrlElementType, makeShapeTransform2By1, Matrix, ShapeView, Transform } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, SelectionTheme, XY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { forbidden_to_modify_frame } from '@/utils/common';
import { ScaleHandler } from "@/transform/scale";
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/transform/pathEdit";
import { CursorType } from "@/utils/cursor2";
import { cursorAngle } from "@/components/Document/Selection/common";

interface Props {
    matrix: number[]
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

const matrix = new Matrix();
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
    apex = apex.map(p => matrix.computeCoord3(p));

    apex.push(apex[0]);

    for (let i = 0; i < apex.length - 1; i++) {
        const path = get_bar_path(apex[i], apex[i + 1]);
        paths.push({ path, type: types[i] });
    }

    updateRotateCtx();
}

const rotateCtx: {
    mTop: Transform;
    mRight: Transform;
    mBottom: Transform;
    mLeft: Transform;

    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
} = {
    mTop: new Transform(),
    mRight: new Transform(),
    mBottom: new Transform(),
    mLeft: new Transform()
}

function updateRotateCtx() {
    const shape = props.shape;
    const { width, height } = shape.size;

    const clientMatrix = makeShapeTransform2By1(props.context.workspace.matrix);
    const fromRoot = shape.transform2FromRoot;

    const fromClient = fromRoot.addTransform(clientMatrix);

    const cols = fromClient.transform([
        ColVector3D.FromXY(0, 0),
        ColVector3D.FromXY(width, 0),
        ColVector3D.FromXY(width, height),
        ColVector3D.FromXY(0, height),
        ColVector3D.FromXY(width / 2, height / 2),
    ]);

    const { col0, col1, col2, col3 } = cols;

    const t = fromClient.clearTranslate();
    t.updateMatrix();
    t.matrix.normalize();
    t.isSubMatrixLatest = false;

    const { col0: vecLT, col1: vecRT, col2: vecRB, col3: vecLB } = t.transform([
        ColVector3D.FromXY(0, -1),
        ColVector3D.FromXY(1, 0),
        ColVector3D.FromXY(0, 1),
        ColVector3D.FromXY(-1, 0)
    ]);

    const xVector = ColVector3D.FromXY(1, 0);

    const theta1 = cursorAngle(xVector, vecLT);
    const theta2 = cursorAngle(xVector, vecRT);
    const theta3 = cursorAngle(xVector, vecRB);
    const theta4 = cursorAngle(xVector, vecLB);

    rotateCtx.mTop = new Transform()
        .setRotateZ(theta1)
        .setTranslate(ColVector3D.FromXY(col0.x, col0.y));

    rotateCtx.mRight = new Transform()
        .setRotateZ(theta2)
        .setTranslate(ColVector3D.FromXY(col1.x, col1.y));

    rotateCtx.mBottom = new Transform()
        .setRotateZ(theta3)
        .setTranslate(ColVector3D.FromXY(col2.x, col2.y));

    rotateCtx.mLeft = new Transform()
        .setRotateZ(theta4)
        .setTranslate(ColVector3D.FromXY(col3.x, col3.y));
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
    let deg = 0;

    if (t === CtrlElementType.RectTop) {
        if (rotateCtx.top === undefined) {
            rotateCtx.top = rotateCtx.mTop.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.top;
    } else if (t === CtrlElementType.RectRight) {
        if (rotateCtx.right === undefined) {
            rotateCtx.right = rotateCtx.mRight.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.right;
    } else if (t === CtrlElementType.RectBottom) {
        if (rotateCtx.bottom === undefined) {
            rotateCtx.bottom = rotateCtx.mBottom.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.bottom;
    } else if (t === CtrlElementType.RectLeft) {
        if (rotateCtx.left === undefined) {
            rotateCtx.left = rotateCtx.mLeft.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.left;
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