/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import {
    ColVector3D,
    CtrlElementType,
    ShapeView,
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { XY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { WorkSpace } from "@/context/workspace";
import { ScaleHandler } from "@/transform/scale";
import { cursorAngle } from "@/components/Document/Selection/common";
import { CursorType } from "@/utils/cursor2";
import { Action } from "@/context/tool";

interface Props {
    context: Context
    shape: ShapeView
    cFrame: Point[]
}

interface Bar {
    path: string
    type: CtrlElementType
}

const props = defineProps<Props>();
const data: { paths: Bar[] } = reactive({ paths: [] });
const { paths } = data;
let isDragging = false;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectRight;

const dragActiveDis = 3;
let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;
let downXY: XY = { x: 0, y: 0 };

function update() {
    update_dot_path();
}

function update_dot_path() {
    paths.length = 0;
    const shape = props.shape;
    const { x, y, width, height } = shape.frame;
    const m = (shape.matrix2Root());
    m.addTransform((props.context.workspace.matrix));

    const { [0]: rt, [1]: rb, [2]: lb } = m.transform([
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height)
    ])

    paths.push(
        { path: get_bar_path(rt, rb), type: CtrlElementType.RectRight },
        { path: get_bar_path(rb, lb), type: CtrlElementType.RectBottom }
    );
}

function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
}

// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0 || scaler) {
        return;
    }
    event.stopPropagation();

    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();

    cur_ctrl_type = ele;

    scaler = new ScaleHandler(props.context, event, props.context.selection.selectedShapes, cur_ctrl_type);
    downXY = event;

    document.addEventListener('mousemove', bar_mousemove);
    document.addEventListener('mouseup', bar_mouseup);
}

function bar_mousemove(event: MouseEvent) {
    if (isDragging) {
        scaler?.execute(event);
    } else {
        if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
            isDragging = true;
            scaler?.createApiCaller();
        }
    }
}

function bar_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clear_status();
}

function setCursor(t: CtrlElementType) {
    const shape = props.shape;
    const clientMatrix = (props.context.workspace.matrix);
    const fromRoot = (shape.matrix2Root());

    const fromClient = fromRoot.addTransform(clientMatrix);
    const { x, y, width, height } = shape.frame;

    const _from = fromClient.clone()
    _from.clearTranslate()
    _from.clearScaleSize()

    const { [0]: vecR, [1]: vecB } = _from.transform([
            ColVector3D.FromXY(1, 0),
            ColVector3D.FromXY(0, 1),
        ]);

    const xVector = ColVector3D.FromXY(1, 0);

    const thetaR = cursorAngle(xVector, ColVector3D.FromXY(vecR));
    const thetaB = cursorAngle(xVector, ColVector3D.FromXY(vecB));

    const cols = fromClient.transform([
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x, y + height)
    ]);

    const { [0]:col0, [1]:col1 } = cols;
    const action = props.context.tool.action;
    const type = action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;
    if (t === CtrlElementType.RectRight) {
        const assistR = new Transform()
            .setRotateZ(thetaR)
            .setTranslate(col0);

        props.context.cursor.setType(type, assistR.decomposeRotate() * 180 / Math.PI);
    } else {
        const assistB = new Transform()
            .setRotateZ(thetaB)
            .setTranslate(col1);
        props.context.cursor.setType(type, assistB.decomposeRotate() * 180 / Math.PI);
    }
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

function bar_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}

function bar_mouseleave() {
    props.context.cursor.reset();
    need_reset_cursor_after_transform = true;
}

function window_blur() {
    clear_status();
}

function workspaceWatcher(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
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
<path v-for="(b, i) in paths" :key="i" :d="b.path" class="main-path" @mousedown.stop="(e) => bar_mousedown(e, b.type)"
      @mouseenter="() => bar_mouseenter(b.type)" @mouseleave="bar_mouseleave"/>
</template>
<style lang='scss' scoped>
.main-path {
    fill: none;
    stroke: transparent;
    stroke-width: 10px;
}
</style>