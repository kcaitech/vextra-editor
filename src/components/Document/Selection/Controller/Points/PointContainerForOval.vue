/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { Matrix, PolygonShapeView } from '@kcaitech/vextra-core';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { ArcFreeModifier, ArcKey } from "@/components/Document/Selection/Controller/Points/arc";
import { useI18n } from "vue-i18n";
import { format_value } from "@/utils/common";

interface Props {
    context: Context
    shape: PolygonShapeView
}

const props = defineProps<Props>();

const t = useI18n().t;

const start = reactive<{ visible: boolean, x: number, y: number }>({ visible: true, x: 0, y: 0 });
const end = reactive<{ visible: boolean, x: number, y: number }>({ visible: true, x: 0, y: 0 });

const radius = reactive<{ visible: boolean, x: number, y: number }>({ visible: true, x: 0, y: 0 });

const active = reactive<{ key: string, value: string }>({ key: '', value: '0°' });

function update() {
    const context = props.context;

    if (!context.workspace.shouldSelectionViewUpdate) return;

    const oval = props.shape;
    const round = Math.PI * 2;
    const r = oval.innerRadius ?? 0;
    const s = oval.startingAngle ?? 0;
    const e = oval.endingAngle ?? round;

    const mid = (0.5 + 0.5 * r + 1) / 2;

    const M = new Matrix();
    M.scale(oval.frame.width, oval.frame.height);
    M.multiAtLeft(oval.matrix2Root().toMatrix());
    M.multiAtLeft(context.workspace.matrix);

    const sweep = (e - s) / round;

    if (sweep === 0) {
        start.visible = false;

        const matrix = new Matrix();
        matrix.rotate(e, 0.5, 0.5);
        matrix.multiAtLeft(M);
        const __end = matrix.computeCoord2(mid, 0.5);

        end.visible = true;
        end.x = __end.x;
        end.y = __end.y;
    } else if (sweep === 1) {
        start.visible = false;

        const matrix = new Matrix();
        matrix.rotate(e, 0.5, 0.5);
        matrix.multiAtLeft(M);

        const inverse = new Matrix(matrix.inverse);
        const unit1 = inverse.computeCoord2(1, 0);
        const unit2 = inverse.computeCoord2(2, 0);

        const padding = Math.hypot(unit2.x - unit1.x, unit2.y - unit1.y) * 10;
        const __end = matrix.computeCoord2(1 - padding, 0.5);

        end.visible = true;
        end.x = __end.x;
        end.y = __end.y;
    } else {
        const matrix = new Matrix();
        matrix.rotate(e, 0.5, 0.5);
        matrix.multiAtLeft(M);
        const __end = matrix.computeCoord2(mid, 0.5);

        end.visible = true;
        end.x = __end.x;
        end.y = __end.y;

        const matrix2 = new Matrix();
        matrix2.rotate(s, 0.5, 0.5);
        matrix2.multiAtLeft(M);
        const __start = matrix2.computeCoord2(mid, 0.5);

        start.visible = true;
        start.x = __start.x;
        start.y = __start.y;
    }

    radius.visible = true;
    const matrix3 = new Matrix();
    matrix3.rotate((e + s) / 2, 0.5, 0.5);
    matrix3.multiAtLeft(M);
    const __radius = matrix3.computeCoord2(r / 2 + 0.5, 0.5);
    radius.x = __radius.x;
    radius.y = __radius.y;
}

let arcModifier: ArcFreeModifier | undefined;
let __down_xy = { x: 0, y: 0 };
let __drag = false;
let __down = false;

function __start() {
    let __value = (props.shape.startingAngle ?? 0) / (Math.PI * 2) * 360;
    if (__value > 180) __value -= 360;
    return format_value(__value) + '°';
}

function __sweep() {
    const round = Math.PI * 2;
    const start = props.shape.startingAngle ?? 0;
    const end = props.shape.endingAngle ?? round;
    return format_value((end - start) / round * 100) + '%';
}

function __ratio() {
    const innerRadius = props.shape.innerRadius ?? 0;
    return format_value(innerRadius * 100) + '%';
}

function startDown(e: MouseEvent) {
    e.stopPropagation();

    __down_xy = e;
    __down = true;

    arcModifier = new ArcFreeModifier(props.context, props.shape, ArcKey.Start, start, end, radius, active);

    document.addEventListener('mousemove', startMove);
    document.addEventListener('mouseup', startUp);
}

function startMove(e: MouseEvent) {
    if (__drag) {
        arcModifier?.modifyStart(e);
        if (!tips.value) return;
        props.context.nextTick(props.context.selection.selectedPage!, () => {
            tipsPosition.x = start.x;
            tipsPosition.y = start.y;

            active.value = __start();
        });
    } else if (Math.hypot(e.x - __down_xy.x, e.y - __down_xy.y)) {
        __drag = true;
        arcModifier?.createApiCaller();
    }
}

function startUp(e: MouseEvent) {
    arcModifier?.fulfil();
    arcModifier = undefined;
    __down = false;
    __drag = false;
    document.removeEventListener('mousemove', startMove);
    document.removeEventListener('mouseup', startUp);
    if (leave) tips.value = false;
}

function endDown(e: MouseEvent) {
    e.stopPropagation();
    __down_xy = e;
    __down = true;
    arcModifier = new ArcFreeModifier(props.context, props.shape, ArcKey.Start, start, end, radius, active);
    document.addEventListener('mousemove', endMove);
    document.addEventListener('mouseup', endUp);
}

function endMove(e: MouseEvent) {
    if (__drag) {
        arcModifier?.modifyEnd(e);
        if (!tips.value) return;
        props.context.nextTick(props.context.selection.selectedPage!, () => {
            tipsPosition.x = end.x;
            tipsPosition.y = end.y;
            active.value = __sweep();
        });
    } else if (Math.hypot(e.x - __down_xy.x, e.y - __down_xy.y)) {
        __drag = true;
        arcModifier?.createApiCaller();
    }
}

function endUp(e: MouseEvent) {
    arcModifier?.fulfil();
    arcModifier = undefined;
    __down = false;
    __drag = false;
    document.removeEventListener('mousemove', endMove);
    document.removeEventListener('mouseup', endUp);
    if (leave) tips.value = false;
}

function radiusDown(e: MouseEvent) {
    e.stopPropagation();

    __down_xy = e;
    __down = true;

    arcModifier = new ArcFreeModifier(props.context, props.shape, ArcKey.Start, start, end, radius, active);

    document.addEventListener('mousemove', radiusMove);
    document.addEventListener('mouseup', radiusUp);
}

function radiusMove(e: MouseEvent) {
    if (__drag) {
        arcModifier?.modifyRadius(e);
        if (!tips.value) return;
        props.context.nextTick(props.context.selection.selectedPage!, () => {
            tipsPosition.x = radius.x;
            tipsPosition.y = radius.y;
            active.value = __ratio();
        });
    } else if (Math.hypot(e.x - __down_xy.x, e.y - __down_xy.y)) {
        __drag = true;
        arcModifier?.createApiCaller();
    }
}

function radiusUp(e: MouseEvent) {
    arcModifier?.fulfil();
    arcModifier = undefined;
    __down = false;
    __drag = false;
    document.removeEventListener('mousemove', radiusMove);
    document.removeEventListener('mouseup', radiusUp);
    if (leave) tips.value = false;
}

const tips = ref<boolean>(false);
const tipsPosition = reactive<{ x: number, y: number }>({ x: 0, y: 0 });
let leave = true;

function startEnter() {
    leave = false;
    if (__down) return;
    tips.value = true;
    active.key = t('attr.startingAngle');
    active.value = __start();
    tipsPosition.x = start.x;
    tipsPosition.y = start.y;
}

function sweepEnter() {
    leave = false;
    if (__down) return;
    tips.value = true;
    active.key = t('attr.sweep');
    active.value = __sweep();
    tipsPosition.x = end.x;
    tipsPosition.y = end.y;
}

function ratioEnter() {
    leave = false;
    if (__down) return;
    tips.value = true;
    active.key = t('attr.ratio');
    active.value = __ratio();
    tipsPosition.x = radius.x;
    tipsPosition.y = radius.y;
}

function __leave() {
    leave = true;
    if (__down) return;
    tips.value = false;
}

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) update();
    else if (t === WorkSpace.SELECTION_VIEW_UPDATE) update();
}
onMounted(() => {
    props.shape.watch(update);
    props.context.workspace.watch(workspaceWatcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
<g v-if="start.visible" :style="`transform: translate(${start.x - 4}px, ${start.y - 4}px);`"
   @mousedown="startDown" @mouseenter="startEnter" @mouseleave="__leave">
    <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
             stroke-width="1"/>
    <ellipse cx="4" cy="4" rx="1.5" ry="1.5" fill="#1878F5" fill-opacity="1"/>
</g>
<g v-if="end.visible" :style="`transform: translate(${end.x - 4}px, ${end.y - 4}px);`"
   @mousedown="endDown" @mouseenter="sweepEnter" @mouseleave="__leave">
    <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
             stroke-width="1"/>
</g>
<g v-if="radius.visible" :style="`transform: translate(${radius.x - 4}px, ${radius.y - 4}px);`"
   @mousedown="radiusDown" @mouseenter="ratioEnter" @mouseleave="__leave">
    <ellipse cx="4" cy="4" rx="5" ry="5" fill="transparent" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill="#FFFFFF" fill-opacity="1"/>
    <ellipse cx="4" cy="4" rx="4" ry="4" fill-opacity="0" stroke-opacity="1" stroke="#1878F5" fill="none"
             stroke-width="1"/>
</g>
<foreignObject v-if="tips" :x="tipsPosition.x + 15" :y="tipsPosition.y- 15" width="120px" height="28px">
    <div class="percent_container">
        <span>{{ `${active.key} ${active.value}` }}</span>
    </div>
</foreignObject>
</template>

<style scoped lang="scss">
.percent_container {
    position: absolute;
    display: flex;
    max-width: 100px;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;

    span {
        padding: 6px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>