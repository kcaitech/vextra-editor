<script setup lang='ts'>
import { Context } from '@/context';
import {
    ColVector3D,
    CtrlElementType,
    makeMatrixByTransform2,
    makeShapeTransform2By1,
    ShapeView,
    Transform, TransformRaw
} from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { ClientXY, XY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
import { permIsEdit } from '@/utils/content';
import { forbidden_to_modify_frame } from '@/utils/common';
// import { TranslateHandler } from '@/transform/translate';
import { CursorType } from "@/utils/cursor2";
import { cursorAngle } from "@/components/Document/Selection/common";
import { ScaleHandler } from "@/transform/scale";
import { Translate2 } from "@/transform/translate/translate2";

interface Props {
    context: Context
    shape: ShapeView
    cFrame: Point[]
}

const props = defineProps<Props>();
let startPosition: ClientXY = {x: 0, y: 0};
let isDragging = false;

let move: any, up: any;
const ltTransform = ref<string>('');
const hidden = ref<boolean>(false);
const dragActiveDis = 5;
const RB = ref<XY>({x: -10, y: -10});

let scaler: ScaleHandler | undefined = undefined;
let downXY: XY = {x: 0, y: 0};

let translate2: Translate2 | undefined = undefined;


function update() {
    update_transform();
}

function update_transform() {
    const shape = props.shape;
    const m = shape.transform2FromRoot;
    const mClient = makeShapeTransform2By1(props.context.workspace.matrix as unknown as TransformRaw);
    m.addTransform(mClient);

    const transform = m.clone()
        .clearSkew()
        .clearScaleSize();

    ltTransform.value = makeMatrixByTransform2(transform.translateInLocal(ColVector3D.FromXY(-20, -20))).toString();

    const {x, y, width, height} = shape.frame;

    const {col0: lt, col1: rt, col2: rb, col3: lb} = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height)
    ]);

    RB.value = rb;

    const root = props.context.workspace.root;
    props.context.selection.setArea([
        {id: 'body', area: `M${lt.x} ${lt.y} L${rt.x} ${rt.y} L${rb.x} ${rb.y} L${lb.x} ${lb.y} z`},
        {id: 'content', area: `M0 0 h${root.width} v${root.height} h${-root.width} z`}
    ]);

    if (!props.context.workspace.shouldSelectionViewUpdate) hidden.value = true;
}

function point_mousedown(event: MouseEvent) {
    if (event.button !== 0 || scaler) {
        return;
    }
    event.stopPropagation();

    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();

    scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, CtrlElementType.RectRB);
    downXY = event;

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

    move = point_mousemove;
    up = point_mouseup;
}

function point_mousemove(event: MouseEvent) {
    if (isDragging) {
        scaler?.execute(event);
    } else {
        if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
            isDragging = true;
            scaler?.createApiCaller();
        }
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    clearStatus();
}

function clearStatus() {
    isDragging = false;

    scaler?.fulfil();
    scaler = undefined;

    // transporter?.fulfil();
    // transporter = undefined;
    translate2?.fulfil();
    translate2 = undefined;

    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

// let transporter: TranslateHandler | undefined = undefined;

function down(e: MouseEvent) {
    const context = props.context;
    const action = context.tool.action;
    if (!permIsEdit(context) || context.tool.isLable) {
        return;
    }
    if (e.button !== 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
        return;
    }
    if (!(action === Action.AutoV)) {
        return;
    }
    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();

    startPosition = {x: e.x, y: e.y};

    // transporter = new TranslateHandler(props.context, e, [props.shape]);
    translate2 = new Translate2(context, e, context.selection.selectedShapes);

    document.addEventListener('mousemove', mousemove4trans);
    document.addEventListener('mouseup', mouseup4trans);

    move = mousemove4trans;
    up = mouseup4trans;
}

function mousemove4trans(e: MouseEvent) {
    if (e.buttons !== 1) {
        return;
    }

    if (isDragging) {
        // transporter?.execute(e);
        translate2?.execute(e);
    } else if (Math.hypot(e.x - startPosition.x, e.y - startPosition.y) > dragActiveDis) {
        // transporter?.createApiCaller();
        translate2?.connect();
        isDragging = true;
    }
}

function mouseup4trans(e: MouseEvent) {
    if (e.button === 0) {
        isDragging = false;
        // transporter?.fulfil();
        // transporter = undefined;
        translate2?.fulfil();
        translate2 = undefined;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
}


function cornerMove(event: MouseEvent) {
    if (event.buttons === 0) {
        event.stopPropagation();
    }
}

function window_blur() {
    clearStatus();
}

function workspace_watcher(t: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        hidden.value = false;
        update();
    } else if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update()
    }
}

let need_reset_cursor_after_transform = true;

function point_mouseenter() {
    setCursor();
    need_reset_cursor_after_transform = false;
}

function point_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}

function setCursor() {
    const shape = props.shape;
    const clientMatrix = makeShapeTransform2By1(props.context.workspace.matrix as unknown as TransformRaw);
    const fromRoot = shape.transform2FromRoot;

    const fromClient = fromRoot.addTransform(clientMatrix);
    const {x, y, width, height} = shape.frame;

    const {col0: vecRB} = fromClient.clone()
        .clearTranslate()
        .clearScaleSize()
        .transform([
            ColVector3D.FromXY(1, 1),
        ]);

    const xVector = ColVector3D.FromXY(1, 0);

    const theta3 = cursorAngle(xVector, vecRB);

    const cols = fromClient.transform([
        ColVector3D.FromXY(x + width, y + height)
    ]);

    const {col0} = cols;

    const assistRB = new Transform()
        .setRotateZ(theta3)
        .setTranslate(col0);
    const action = props.context.tool.action;
    const type = action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;

    props.context.cursor.setType(type, assistRB.decomposeEuler().z * 180 / Math.PI);
}

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    props.context.workspace.watch(workspace_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <g :style="{ transform: ltTransform  }" @mousedown.stop="(e: MouseEvent) => down(e)">
        <rect x="0" y="0" width="18px" height="18px" rx="2" ry="2" fill="#1878f5" fill-opacity="0.45" stroke="none"/>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M2 0H16C17.1046 0 18 0.89543 18 2V16C18 17.1046 17.1046 18 16 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.89543 0 2 0Z"
                  fill="#99BDF6"/>
            <path
                d="M9 16C8.91684 15.999 8.83469 15.9817 8.75818 15.9491C8.68007 15.9188 8.6087 15.8734 8.54818 15.8155L6.63909 13.9064C6.38956 13.6568 6.38956 13.2523 6.63909 13.0027C6.88862 12.7532 7.2932 12.7532 7.54273 13.0027L8.36364 13.83V9.63636H4.17L4.99727 10.4573C5.2468 10.7068 5.2468 11.1114 4.99727 11.3609C4.74774 11.6104 4.34317 11.6104 4.09364 11.3609L2.18455 9.45182C2.12661 9.3913 2.0812 9.31993 2.05091 9.24182C2.0183 9.16531 2.00101 9.08316 2 9C2.00101 8.91684 2.0183 8.83469 2.05091 8.75818C2.0812 8.68007 2.12661 8.6087 2.18455 8.54818L4.09364 6.63909C4.34317 6.38956 4.74774 6.38956 4.99727 6.63909C5.2468 6.88862 5.2468 7.2932 4.99727 7.54273L4.17 8.36364H8.36364V4.17L7.54273 4.99727C7.2932 5.2468 6.88862 5.2468 6.63909 4.99727C6.38956 4.74774 6.38956 4.34317 6.63909 4.09364L8.54818 2.18455C8.6087 2.12661 8.68007 2.0812 8.75818 2.05091C8.83469 2.0183 8.91684 2.00101 9 2C9.08316 2.00101 9.16531 2.0183 9.24182 2.05091C9.31993 2.0812 9.3913 2.12661 9.45182 2.18455L11.3609 4.09364C11.6104 4.34317 11.6104 4.74774 11.3609 4.99727C11.1114 5.2468 10.7068 5.2468 10.4573 4.99727L9.63636 4.17V8.36364H13.83L13.0027 7.54273C12.7532 7.2932 12.7532 6.88862 13.0027 6.63909C13.2523 6.38956 13.6568 6.38956 13.9064 6.63909L15.8155 8.54818C15.8734 8.6087 15.9188 8.68007 15.9491 8.75818C15.9817 8.83469 15.999 8.91684 16 9C15.999 9.08316 15.9817 9.16531 15.9491 9.24182C15.9188 9.31993 15.8734 9.3913 15.8155 9.45182L13.9064 11.3609C13.6568 11.6104 13.2523 11.6104 13.0027 11.3609C12.7532 11.1114 12.7532 10.7068 13.0027 10.4573L13.83 9.63636H9.63636V13.83L10.4573 13.0027C10.7068 12.7532 11.1114 12.7532 11.3609 13.0027C11.6104 13.2523 11.6104 13.6568 11.3609 13.9064L9.45182 15.8155C9.3913 15.8734 9.31993 15.9188 9.24182 15.9491C9.16531 15.9817 9.08316 15.999 9 16Z"
                fill="#1778F6"/>
        </svg>
    </g>
    <circle :cx="RB.x" :cy="RB.y" r="6" fill="transparent" stroke="none"
            @mousedown.stop="(e: MouseEvent) => point_mousedown(e)"
            @mousemove="cornerMove"
            @mouseenter="point_mouseenter"
            @mouseleave="point_mouseleave"/>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>