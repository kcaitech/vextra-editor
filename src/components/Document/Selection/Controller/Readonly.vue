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
import { watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, ShapeView } from '@kcdesign/data';
import { Point } from "../SelectionView.vue";
import { useController } from "./controller";
import { genRectPath } from "../common";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
import { SelectionTheme } from "@/context/selection";
interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: ShapeView
    theme: SelectionTheme
}
const props = defineProps<Props>();
useController(props.context);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
let viewBox = '';
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function updateControllerView() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p.toMatrix());
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    const framePoint = props.controllerFrame;
    boundrectPath.value = genRectPath(framePoint);
    props.context.workspace.setCtrlPath(boundrectPath.value);
    const p0 = framePoint[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    framePoint.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds);
    viewBox = genViewBox(bounds);
}

watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox"
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        overflow="visible">
        <path :d="boundrectPath" fill="none" stroke='#1878f5'></path>
        <ShapesStrokeContainer :context="props.context" :matrix="props.matrix" :shape="props.shape" color-hex="#1878f5">
        </ShapesStrokeContainer>
    </svg>
</template>
<style lang='scss' scoped></style>