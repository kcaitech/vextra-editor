/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType, Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { SelectionTheme, XY } from '@/context/selection';
import { forbidden_to_modify_frame } from '@/utils/common';
import { update_dot3 } from './common';
import { Point } from "../../SelectionView.vue";
import { get_rotate_for_straight } from '@/utils/attri_setting';
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/path/pathEdit";
import { LineHandler } from "@/transform/line";
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    axle: { x: number, y: number }
    cFrame: Point[]
    rotation: number
    theme: SelectionTheme
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
const data: { dots: Dot[] } = reactive({ dots: [] });
let { dots } = data;
let isDragging = false;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.LineStart;
let need_reset_cursor_after_transform = true;

let lineHandle: LineHandler | undefined;
let downXY: XY = { x: 0, y: 0 }

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}

function update_dot_path() {
    dots.length = 0;

    const f = props.shape.frame;
    const m = new Matrix(matrix);
    m.preScale(f.width, f.height);

    const points = (props.shape as PathShapeView)?.segments[0]?.points;
    if (!points?.[0] || !points?.[1]) return;

    const p1 = m.computeCoord3(points[0]);
    const p2 = m.computeCoord3(points[1]);

    dots.push(...update_dot3([p1, p2]));
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) return;

    event.stopPropagation();

    if (dbl_action()) return startEdit(props.context);

    if (forbidden_to_modify_frame(props.shape)) return;

    lineHandle = new LineHandler(props.context, event, ele);
    downXY = event;

    cur_ctrl_type = ele;

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(event: MouseEvent) {
    if (isDragging) {
        lineHandle?.execute(event);
        if (cur_ctrl_type.endsWith('rotate')) {
            setCursor(cur_ctrl_type, true);
        }
    } else if (Math.hypot(downXY.x - event.x, downXY.y - event.y) > dragActiveDis) {
        lineHandle?.createApiCaller();
        isDragging = true;

    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    clear_status();
}

function setCursor(t: CtrlElementType, active = false) {
    const cursor = props.context.cursor;

    let deg = get_rotate_for_straight(props.shape as PathShapeView);

    if (t === CtrlElementType.LineStart) {
        deg = 0;
    } else if (t === CtrlElementType.LineEnd) {
        deg = 0;
    } else if (t === CtrlElementType.LineStartR) {
        deg = deg - 180;
    }

    const type = t.endsWith('rotate') ? CursorType.Rotate : CursorType.Scale;

    active
        ? cursor.setTypeForce(type, deg)
        : cursor.setType(type, deg);
}

function point_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}

function point_mouseleave() {
    props.context.cursor.reset();
    need_reset_cursor_after_transform = true;
}

function window_blur() {
    clear_status();
}

function clear_status() {
    isDragging = false

    lineHandle?.fulfil();
    lineHandle = undefined;

    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
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
            <rect :x="p.extra.x" :y="p.extra.y" class="assist-rect"/>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px" :stroke="theme"/>
        </g>
    </g>
</template>
<style lang='scss' scoped>
.r-path {
    fill: transparent;
    stroke: transparent;
}

.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
}

.assist-rect {
    width: 14px;
    height: 14px;
    fill: transparent;
    stroke: transparent;
}
</style>