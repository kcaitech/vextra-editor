/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType } from '@kcaitech/vextra-core';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { ScaleHandler } from '@/transform/scale';
import { CursorType } from "@/utils/cursor";
import { Action } from "@/context/tool";

interface Props {
    context: Context;
    frame: Point[];
}

interface Bar {
    path: string;
    type: CtrlElementType;
}

const props = defineProps<Props>();
const { bars, assistPaths } = reactive<{ bars: Bar[], assistPaths: Bar[] }>({ bars: [], assistPaths: [] });
const assist = ref<boolean>(false);

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
    props.context.workspace.shouldSelectionViewUpdate && render();
}

function render() {
    bars.length = 0;
    assistPaths.length = 0;

    const apex = props.frame.map(p => ({ x: p.x, y: p.y }));
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) bars.push({
        path: get_bar_path(apex[i], apex[i + 1]),
        type: types[i]
    });
    const height = Math.hypot(apex[0].x - apex[3].x, apex[0].y - apex[3].y);
    const width = Math.hypot(apex[0].x - apex[1].x, apex[0].y - apex[1].y);
    assist.value = !(width < 24 || height < 24);
    if (!assist.value) {
        const [lt, rt, rb, lb] = props.frame;
        const apexMini = [
            { x: lt.x - 2.5, y: lt.y - 2.5 },
            { x: rt.x + 2.5, y: rt.y - 2.5 },
            { x: rb.x + 2.5, y: rb.y + 2.5 },
            { x: lb.x - 2.5, y: lb.y + 2.5 }
        ]
        apexMini.push(apexMini[0]);
        for (let i = 0; i < apexMini.length - 1; i++) assistPaths.push({
            path: get_bar_path(apexMini[i], apexMini[i + 1]),
            type: types[i]
        });
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
    const action = props.context.tool.action;
    const type = action === Action.AutoK ? CursorType.ScaleK : CursorType.Scale;
    if (t === CtrlElementType.RectTop) {
        props.context.cursor.setType(type, 90);
    } else if (t === CtrlElementType.RectRight) {
        props.context.cursor.setType(type, 0);
    } else if (t === CtrlElementType.RectBottom) {
        props.context.cursor.setType(type, 90);
    } else if (t === CtrlElementType.RectLeft) {
        props.context.cursor.setType(type, 0);
    }
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

watch(() => props.frame, render);

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
    <path v-if="assist" :d="b.path" class="assist-path"/>
    <path :d="b.path" class="main-path"/>
</g>
<g v-if="!assist">
    <path v-for="(b, i) in assistPaths"
          class="assist-path-2"
          :key="i"
          @mousedown.stop="(e) => bar_mousedown(e, b.type)"
          @mouseenter="() => bar_mouseenter(b.type)"
          @mouseleave="bar_mouseleave" :d="b.path"/>
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
    //stroke: blue;
    stroke-width: 10px;
}

.assist-path-2 {
    fill: none;
    stroke-width: 5px;
    stroke: transparent;
    //stroke: rgba(255, 0, 0, 0.3);
}
</style>