<script setup lang='ts'>
import { Context } from '@/context';
import {
    ColVector3D,
    CtrlElementType,
    ShapeView,
    Transform, XYsBounding
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { SelectionTheme, XY } from '@/context/selection';
import { forbidden_to_modify_frame } from '@/utils/common';
import { Point } from "../../SelectionView.vue";
import { ScaleHandler } from "@/transform/scale";
import { WorkSpace } from "@/context/workspace";
import { RotateHandler } from "@/transform/rotate";
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/path/pathEdit";
import { CursorType } from "@/utils/cursor2";
import { cursorAngle } from "@/components/Document/Selection/common";
import { Action } from "@/context/tool";

interface Props {
    context: Context;
    shape: ShapeView;
    axle: { x: number, y: number };
    cFrame: Point[];
    theme: SelectionTheme;
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
let isDragging = false;

const dragActiveDis = 4;
const assist = ref<boolean>(false);

let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;

let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;
let rotator: RotateHandler | undefined = undefined;

let downXY: XY = { x: 0, y: 0 };


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
} = {
    mlt: new Transform(),
    mrt: new Transform(),
    mrb: new Transform(),
    mlb: new Transform()
}

function updateDotLayout() {
    dots.length = 0;
    const shape = props.shape;
    const { x, y, width, height } = shape.frame;

    const clientMatrix = (props.context.workspace.matrix);
    const fromRoot = (shape.matrix2Root());

    const fromClient = fromRoot.addTransform(clientMatrix);

    const ltTransform = new Transform()
        .rotate(Math.PI)
        .setTranslate(ColVector3D.FromXY(x, y))
        .addTransform(fromClient)
        ltTransform.clearScaleSize();

    const rtTransform = new Transform()
        .rotate(-0.5 * Math.PI)
        .setTranslate(ColVector3D.FromXY(x + width, y))
        .addTransform(fromClient)
        rtTransform.clearScaleSize();

    const rbTransform = new Transform()
        .setTranslate(ColVector3D.FromXY(x + width, y + height))
        .addTransform(fromClient)
        rbTransform.clearScaleSize();

    const lbTransform = new Transform()
        .rotate(0.5 * Math.PI)
        .setTranslate(ColVector3D.FromXY(x, y + height))
        .addTransform(fromClient)
        lbTransform.clearScaleSize();

        ltTransform.clearSkew()
        rtTransform.clearSkew()
        rbTransform.clearSkew()
        lbTransform.clearSkew()
    dots.push(
        {
            type: CtrlElementType.RectLT,
            transform: (ltTransform).toString(), // 随时准备换回去
        },
        {
            type: CtrlElementType.RectRT,
            transform: (rtTransform).toString(),
        },
        {
            type: CtrlElementType.RectRB,
            transform: (rbTransform).toString(),
        },
        {
            type: CtrlElementType.RectLB,
            transform: (lbTransform).toString(),
        }
    )

    subDots.length = 0;
    const _from = fromClient.clone()
    _from.clearTranslate()
    _from.clearScaleSize()
    const { [0]: vecLT, [1]: vecRT, [2]: vecRB, [3]: vecLB } = _from.transform([
            ColVector3D.FromXY(-1, -1),
            ColVector3D.FromXY(1, -1),
            ColVector3D.FromXY(1, 1),
            ColVector3D.FromXY(-1, 1)
        ]);

    const xVector = ColVector3D.FromXY(1, 0);

    const theta1 = cursorAngle(xVector, ColVector3D.FromXY(vecLT));
    const theta2 = cursorAngle(xVector, ColVector3D.FromXY(vecRT));
    const theta3 = cursorAngle(xVector, ColVector3D.FromXY(vecRB));
    const theta4 = cursorAngle(xVector, ColVector3D.FromXY(vecLB));

    const cols = fromClient.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height),
        ColVector3D.FromXY(x + width / 2, y + height / 2),
    ]);

    const { [0]:col0, [1]:col1, [2]:col2, [3]:col3 } = cols;


    const box = XYsBounding([{ x: col0.x, y: col0.y }, { x: col1.x, y: col1.y }, { x: col2.x, y: col2.y }, {
        x: col3.x,
        y: col3.y
    }]);
    assist.value = !((box.right - box.left < 24) || (box.bottom - box.top < 24));

    const assistLT = new Transform()
        .setRotateZ(theta1)
        .setTranslate(col0);
    rotateCtx.mlt = assistLT;

    const assistRT = new Transform()
        .setRotateZ(theta2)
        .setTranslate(col1);
    rotateCtx.mrt = assistRT;

    const assistRB = new Transform()
        .setRotateZ(theta3)
        .setTranslate(col2);
    rotateCtx.mrb = assistRB;

    const assistLB = new Transform()
        .setRotateZ(theta4)
        .setTranslate(col3);
    rotateCtx.mlb = assistLB;

    subDots.push(
        {
            type: CtrlElementType.RectLT,
            type2: CtrlElementType.RectLTR,
            transform: (assistLT).toString()
        },
        {
            type: CtrlElementType.RectRT,
            type2: CtrlElementType.RectRTR,
            transform: (assistRT).toString()
        },
        {
            type: CtrlElementType.RectRB,
            type2: CtrlElementType.RectRBR,
            transform: (assistRB).toString()
        },
        {
            type: CtrlElementType.RectLB,
            type2: CtrlElementType.RectLBR,
            transform: (assistLB).toString()
        }
    )
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler || rotator) return;

    event.stopPropagation();

    if (dbl_action()) {
        emits('dblclick', event);
        return startEdit(props.context);
    }

    if (forbidden_to_modify_frame(props.shape)) return;

    cur_ctrl_type = ele;

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
    if (isDragging) {
        if (cur_ctrl_type.endsWith('rotate')) {
            setCursor(cur_ctrl_type, true);
            rotator?.execute(event);
        } else {
            scaler?.execute(event);
        }

    } else if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
        isDragging = true;
        cur_ctrl_type.endsWith('rotate') ? rotator?.createApiCaller() : scaler?.createApiCaller();
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    clear_status();
}


function setCursor(t: CtrlElementType, active = false) {
    const cursor = props.context.cursor;
    const action = props.context.tool.action;
    // type
    const type = t.endsWith('rotate') ? CursorType.Rotate : action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;

    // rotate
    let deg = 0;
    if (t === CtrlElementType.RectLT || t === CtrlElementType.RectLTR) {
        deg = rotateCtx.mlt.decomposeRotate() * 180 / Math.PI;
    } else if (t === CtrlElementType.RectRT || t === CtrlElementType.RectRTR) {
        deg = rotateCtx.mrt.decomposeRotate() * 180 / Math.PI;
    } else if (t === CtrlElementType.RectRB || t === CtrlElementType.RectRBR) {
        deg = rotateCtx.mrb.decomposeRotate() * 180 / Math.PI;
    } else if (t === CtrlElementType.RectLB || t === CtrlElementType.RectLBR) {
        deg = rotateCtx.mlb.decomposeRotate() * 180 / Math.PI;
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

    if (need_reset_cursor_after_transform) props.context.cursor.reset();

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

function window_blur() {
    clear_status();
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.SELECTION_VIEW_UPDATE) update();
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
        v-if="assist"
        class="assist-rect"
        cx="0"
        cy="0"
        r="7"
        @mousedown.stop="(e) => point_mousedown(e, p.type)"
        @mouseenter="() => point_mouseenter(p.type)"
        @mouseleave="point_mouseleave"
    />
    <path
        v-else
        class="assist-rect"
        d="M-3 0 l7.88 -7.88 a12.5 12.5 0 0 1 0 15.76 z"
        @mousedown.stop="(e) => point_mousedown(e, p.type2)"
        @mouseenter="() => point_mouseenter(p.type2)"
        @mouseleave="point_mouseleave"
    />
</g>
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
</template>
<style lang='scss' scoped>
.r-path {
    fill: transparent;
    //fill: rgba(255, 0, 0, 0.6);
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
    fill: transparent;
    //fill: rgba(0, 255, 0, 0.6);
}
</style>