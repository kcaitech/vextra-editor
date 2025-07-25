/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Segment, get_segments } from '@/utils/pathedit';
import { Matrix, PathShapeView, ShapeView } from '@kcaitech/vextra-core';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { get_path_by_point } from '../Points/common';
import { PathClipper } from "@/path/clipper";

type Dot = {
    point: { x: number, y: number }
    index: number
    selected: boolean
}

const props = defineProps<{ context: Context }>(); // m1155
const data: { segments: Segment[][], dots: Dot[] } = reactive({ segments: [], dots: [] });
const { segments, dots } = data;
const new_high_light = ref<number>(-1);
let shape: ShapeView;

const matrix = new Matrix();

function update() {
    segments.length = 0;
    dots.length = 0;

    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }

    init_matrix();

    dots.push(...get_path_by_point(shape, matrix, props.context.path.selectedPoints));
    segments.push(...get_segments(shape, matrix, props.context.path.selectedSides));
}

function confirm_shape() {
    if (!shape) {
        console.log('!shape');
        return false;
    }
    return true;
}

function init_matrix() {
    matrix.reset(shape.matrix2Root().toMatrix());
    matrix.multiAtLeft(props.context.workspace.matrix);
}

function down_background_path(segment: number, index: number) {
    const context = props.context;
    context.path.select_side(segment, index);
    const result = new PathClipper(context, shape as PathShapeView).clip();
    if (result === 0) {
        context.workspace.setPathEditMode(false);
        context.path._reset();
        context.selection.resetSelectShapes();
    } else if (result > 0) {
        context.path.reset();
    }
}

function enter(index: number) {
    new_high_light.value = index;
}

function leave() {
    new_high_light.value = -1;
}

function watch_at_once() {
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    shape.watch(update);
}

function break_watch() {
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    shape.unwatch(update);
}

function matrix_watcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

function init_shape() {
    shape = props.context.selection.selectedShapes[0];
    if (!shape) {
        console.log('!shape');
        return false;
    }
    return true;
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);
    init_shape();
    update();
    watch_at_once();
    props.context.path.setContactStatus(false);
})
onUnmounted(() => {
    break_watch();
    props.context.workspace.unwatch(matrix_watcher);
})
</script>
<template>
    <g v-for="(segment, idx) in segments" :key="idx">
        <g v-for="(seg, i) in segment" :key="i" data-area="controller-element" @mouseenter="() => enter(i)"
           @mouseleave="leave">
            <g @mousedown.stop="() => down_background_path(seg.segment, seg.index)">
                <path class="background-path" :d="seg.path"></path>
                <path :class="{ path: true, 'path-high-light': new_high_light === i }" :d="seg.path">
                </path>
            </g>
        </g>
    </g>
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
          class="point" rx="4" ry="4">
    </rect>
    <!--点序 for Dev-->
<!--    <text v-for="(p, i) in dots"-->
<!--          :key="i"-->
<!--          :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)`, 'pointer-events': 'none'}">-->
<!--        {{ `${p.index}` }}-->
<!--    </text>-->
</template>
<style scoped lang="scss">
.background-path {
    stroke: transparent;
    stroke-width: 14px;
    fill: none;
}

.path {
    stroke: gray;
    fill: none;
}

.path-high-light {
    stroke: var(--active-color);
}

.point {
    fill: #ffffff;
    stroke: var(--active-color);
    height: 8px;
    width: 8px;
}
</style>