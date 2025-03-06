/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { CutoutShape, CutoutShapeView, Matrix, ShapeType, adapt2Shape } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { genRectPath } from '../Selection/common';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { Selection } from '@/context/selection';
import { throttle } from 'lodash';

const props = defineProps<{
    context: Context
    matrix: Matrix
    data: CutoutShapeView
    reflush: number
}>();

const cutoutPath = ref<string>();
const matrix = new Matrix();
const isSelected = ref(false);
const getCutoutPath = (args?: any) => {
    cutoutPath.value = '';
    const points: { x: number, y: number }[] = [];
    if (!props.data.isVisible) return;
    const shape = adapt2Shape(props.data);
    matrix.reset(props.matrix);
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix);
    const f = shape.frame;
    const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
    points.push(...ps);
    const path = shape.getPath().clone();
    path.transform(m);
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    const borPath = genRectPath(framePoint);
    cutoutPath.value = borPath;
}
const _getCutoutPath = throttle(getCutoutPath, 20);

const workspaceUpdate = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getCutoutPath();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getCutoutPath();
    }
}
const selectedWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        const shapes = props.context.selection.selectedShapes;
        isSelected.value = shapes.some(v => v.id === props.data.id);
    }
}

const stop = watch(() => props.reflush, _getCutoutPath);
onMounted(() => {
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    stop();
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectedWatcher);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <path :d="cutoutPath" fill="none" :stroke="isSelected ? '#865dff' : 'rgba(0,0, 0, 0.2)'" stroke-dasharray="5,3">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>