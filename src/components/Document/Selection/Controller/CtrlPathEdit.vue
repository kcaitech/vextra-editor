/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import PointsPathEditContainer from "@/components/Document/Selection/Controller/Points/PointsPathEditContainer.vue";
import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { Matrix } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";

interface Props {
    context: Context
}

const props = defineProps<Props>();
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
});
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
});
const matrix = ref<Matrix>(new Matrix());

function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}

function modify_matrix() {
    const path_shape = props.context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    matrix.value = path_shape.matrix2Root().toMatrix();
    matrix.value.multiAtLeft(props.context.workspace.matrix);
}

function update() {
    const path_shape = props.context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    modify_matrix();
    const f = path_shape.frame;
    const __points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
    for (let i = 0; i < __points.length; i++) {
        const p = __points[i];
        __points[i] = matrix.value.computeCoord3(p);
    }
    bounds.left = Math.min(__points[0].x, __points[1].x, __points[2].x, __points[3].x);
    bounds.top = Math.min(__points[0].y, __points[1].y, __points[2].y, __points[3].y);
    bounds.right = Math.max(__points[0].x, __points[1].x, __points[2].x, __points[3].x);
    bounds.bottom = Math.max(__points[0].y, __points[1].y, __points[2].y, __points[3].y);
}

function matrix_watcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);
    const path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.watch(update);
    }
    update();
});
onUnmounted(() => {
    props.context.workspace.unwatch(matrix_watcher);
    const path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.unwatch(update);
    }
})
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" data-area="controller" preserveAspectRatio="xMinYMin meet"
         :width="width" :height="height" overflow="visible" :viewBox="genViewBox(bounds)"
         :style="{transform: `translate(${bounds.left}px,${bounds.top}px)`}"
    >
        <PointsPathEditContainer :context="props.context"/>
    </svg>
</template>
<style lang="scss" scoped>
svg {
    position: absolute;
    top: 0;
    left: 0;
}
</style>