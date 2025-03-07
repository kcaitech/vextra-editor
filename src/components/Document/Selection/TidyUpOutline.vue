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
import { onMounted, onUnmounted, ref, } from "vue";
import { Context } from "@/context";
import { Point } from "./SelectionView.vue";
import { ColVector3D, Matrix } from "@kcdesign/data";
import { Selection } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";

interface Props {
    context: Context;
    controllerFrame: Point[];
}

const props = defineProps<Props>();
const outline = ref<Point[]>([]);
let cur_frame: { x: number, y: number, height: number, width: number };

const getOutlines = (f?: { x: number, y: number, height: number, width: number }) => {
    outline.value = [];
    const shapes = props.context.selection.selectedTidyUpShapes;
    if (!shapes.length) return;
    if (f) cur_frame = f;
    const parent = shapes[0]?.parent;
    let frame = f || cur_frame;
    if (!parent || !frame) return;
    const matrix = new Matrix();
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    const { [0]:col0, [1]:col1, [2]:col2, [3]:col3 } = m.transform([
        ColVector3D.FromXY(frame.x, frame.y),
        ColVector3D.FromXY(frame.x + frame.width, frame.y),
        ColVector3D.FromXY(frame.x + frame.width, frame.y + frame.height),
        ColVector3D.FromXY(frame.x, frame.y + frame.height)
    ]);
    const lt = { x: col0.x, y: col0.y }
    const rt = { x: col1.x, y: col1.y }
    const rb = { x: col2.x, y: col2.y }
    const lb = { x: col3.x, y: col3.y }
    outline.value.push(lt, rt, rb, lb);
}
function selection_watcher(t: number | string, params?: any) {
    if (t === Selection.CHANGE_TIDY_UP_SHAPE) {
        getOutlines(params);
    }
}
function workspace_watcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getOutlines();
    }
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <svg v-if="outline.length" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" data-area="controller" preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 100 100" width="100" height="100" overflow="visible">
        <path
            :d="`M ${outline[0].x} ${outline[0].y} L ${outline[1].x} ${outline[1].y} L ${outline[2].x} ${outline[2].y} L ${outline[3].x} ${outline[3].y} Z`"
            fill="transparent" stroke="#1878F5" stroke-width="1"></path>
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}

svg {
    position: absolute;
}
</style>