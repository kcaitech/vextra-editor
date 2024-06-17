<script setup lang='ts'>
import { Context } from '@/context';
import {
    ColVector3D,
    CtrlElementType,
    makeMatrixByTransform2,
    makeShapeTransform2By1,
    ShapeView,
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, SelectionTheme, XY } from '@/context/selection';
import { forbidden_to_modify_frame, getHorizontalAngle } from '@/utils/common';
import { Point } from "../../SelectionView.vue";
import { ScaleHandler } from "@/transform/scale";
import { WorkSpace } from "@/context/workspace";
import { RotateHandler } from "@/transform/rotate";
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/transform/pathEdit";
import { CursorType } from "@/utils/cursor2";
import { cursorAngle } from "@/components/Document/Selection/common";

interface Props {
    context: Context
    shape: ShapeView
    axle: { x: number, y: number }
    cFrame: Point[]
    theme: SelectionTheme
}

interface Emits {
    (e: 'dblclick', event: MouseEvent): void;
}

interface MainDot {
    transform: string;
    type: CtrlElementType;
}

interface AssistDot {
    transform: string;
    type: CtrlElementType;
    type2: CtrlElementType;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const data: {
    dots: MainDot[],
    subDots: AssistDot[]
} = reactive({
    dots: [],
    subDots: []
});

const { dots, subDots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;

const dragActiveDis = 4;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;

let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;
let rotator: RotateHandler | undefined = undefined;

let downXY: XY = { x: 0, y: 0 };
let initDeg: number = 0;

function update() {
    updateDotLayout();
}

function updateByShape(...args: any[]) {
    if (!args.includes('layout')) return;
    updateDotLayout();
}

const rotateCtx: {
    mlt: Transform;
    mrt: Transform;
    mrb: Transform;
    mlb: Transform;
    lt?: number;
    rt?: number;
    rb?: number;
    lb?: number;
} = {
    mlt: new Transform(),
    mrt: new Transform(),
    mrb: new Transform(),
    mlb: new Transform()
}

function updateDotLayout() {
    dots.length = 0;
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

    const ltTransform = new Transform()
        .rotateZ({ angle: Math.PI })
        .addTransform(fromClient)
        .clearScaleSize();

    const rtTransform = new Transform()
        .rotateZ({ angle: -0.5 * Math.PI })
        .setTranslate(ColVector3D.FromXY(width, 0))
        .addTransform(fromClient)
        .clearScaleSize();

    const rbTransform = new Transform()
        .setTranslate(ColVector3D.FromXY(width, height))
        .addTransform(fromClient)
        .clearScaleSize();

    const lbTransform = new Transform()
        .rotateZ({ angle: 0.5 * Math.PI })
        .setTranslate(ColVector3D.FromXY(0, height))
        .addTransform(fromClient)
        .clearScaleSize();


    dots.push(
        {
            type: CtrlElementType.RectLT,
            transform: makeMatrixByTransform2(ltTransform).toString(),
        },
        {
            type: CtrlElementType.RectRT,
            transform: makeMatrixByTransform2(rtTransform).toString(),
        },
        {
            type: CtrlElementType.RectRB,
            transform: makeMatrixByTransform2(rbTransform).toString(),
        },
        {
            type: CtrlElementType.RectLB,
            transform: makeMatrixByTransform2(lbTransform).toString(),
        }
    )

    subDots.length = 0;

    const t = fromClient.clearTranslate();
    t.updateMatrix();
    t.matrix.normalize();
    t.isSubMatrixLatest = false;
    const { col0: vecLT, col1: vecRT, col2: vecRB, col3: vecLB } = t.transform([
        ColVector3D.FromXY(-1, -1),
        ColVector3D.FromXY(1, -1),
        ColVector3D.FromXY(1, 1),
        ColVector3D.FromXY(-1, 1)
    ]);

    const xVector = ColVector3D.FromXY(1, 0);

    const theta1 = cursorAngle(xVector, vecLT);
    const theta2 = cursorAngle(xVector, vecRT);
    const theta3 = cursorAngle(xVector, vecRB);
    const theta4 = cursorAngle(xVector, vecLB);

    const assistLT = new Transform()
        .setRotateZ(theta1)
        .setTranslate(ColVector3D.FromXY(col0.x, col0.y));
    rotateCtx.mlt = assistLT;

    const assistRT = new Transform()
        .setRotateZ(theta2)
        .setTranslate(ColVector3D.FromXY(col1.x, col1.y));
    rotateCtx.mrt = assistRT;

    const assistRB = new Transform()
        .setRotateZ(theta3)
        .setTranslate(ColVector3D.FromXY(col2.x, col2.y));
    rotateCtx.mrb = assistRB;

    const assistLB = new Transform()
        .setRotateZ(theta4)
        .setTranslate(ColVector3D.FromXY(col3.x, col3.y));
    rotateCtx.mlb = assistLB;

    subDots.push(
        {
            type: CtrlElementType.RectLT,
            type2: CtrlElementType.RectLTR,
            transform: makeMatrixByTransform2(assistLT).toString()
        },
        {
            type: CtrlElementType.RectRT,
            type2: CtrlElementType.RectRTR,
            transform: makeMatrixByTransform2(assistRT).toString()
        },
        {
            type: CtrlElementType.RectRB,
            type2: CtrlElementType.RectRBR,
            transform: makeMatrixByTransform2(assistRB).toString()
        },
        {
            type: CtrlElementType.RectLB,
            type2: CtrlElementType.RectLBR,
            transform: makeMatrixByTransform2(assistLB).toString()
        }
    )
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler || rotator) {
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

    // type
    const type = t.endsWith('rotate') ? CursorType.Rotate : CursorType.Scale;

    // rotate
    let deg = 0;
    if (t === CtrlElementType.RectLT || t === CtrlElementType.RectLTR) {
        if (rotateCtx.lt === undefined) {
            rotateCtx.lt = rotateCtx.mlt.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.lt;
    } else if (t === CtrlElementType.RectRT || t === CtrlElementType.RectRTR) {
        if (rotateCtx.rt === undefined) {
            rotateCtx.rt = rotateCtx.mrt.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.rt;
    } else if (t === CtrlElementType.RectRB || t === CtrlElementType.RectRBR) {
        if (rotateCtx.rb === undefined) {
            rotateCtx.rb = rotateCtx.mrb.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.rb;
    } else if (t === CtrlElementType.RectLB || t === CtrlElementType.RectLBR) {
        if (rotateCtx.lb === undefined) {
            rotateCtx.lb = rotateCtx.mlb.decomposeEuler().z * 180 / Math.PI;
        }

        deg = rotateCtx.lb;
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

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

watch(() => props.shape, (value, old) => {
    old.unwatch(updateByShape);
    value.watch(updateByShape);
    update();
})
onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
    props.shape.watch(updateByShape);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.shape.unwatch(updateByShape);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <rect v-for="(p, i) in dots"
          class="main-rect"
          :key="i"
          :stroke="theme"
          :style="`transform: ${p.transform};`"
          x="-3.5"
          y="-3.5"
          rx="2"
          @mousedown.stop="(e) => point_mousedown(e, p.type)"
          @mouseenter="() => point_mouseenter(p.type)"
          @mouseleave="point_mouseleave"
    />
    <g
        v-for="(p, i) in subDots"
        :key="i"
        :style="`transform: ${p.transform};`"
    >
        <path
            class="r-path"
            d="M-3 0 l12.6 -12.6 a18 18 0 0 1 0 25.2 z"
            @mousedown.stop="(e) => point_mousedown(e, p.type2)"
            @mouseenter="() => point_mouseenter(p.type2)"
            @mouseleave="point_mouseleave"
        />
        <circle
            class="assist-rect"
            cx="0"
            cy="0"
            r="7"
            @mousedown.stop="(e) => point_mousedown(e, p.type)"
            @mouseenter="() => point_mouseenter(p.type)"
            @mouseleave="point_mouseleave"
        />
    </g>
</template>
<style lang='scss' scoped>
.r-path {
    //fill: transparent;
    fill: rgba(255, 0, 0, 0.6);
    stroke: none;
}

.main-rect {
    width: 7px;
    height: 7px;
    fill: #ffffff;
}

.assist-rect {
    width: 14px;
    height: 14px;
    stroke: transparent;
    //fill: transparent;
    fill: rgba(0, 255, 0, 0.6);
}
</style>