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
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { ArtboardView, ColVector3D, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

type Box = {
    lt: Point,
    rt: Point,
    rb: Point,
    lb: Point
}

interface Props {
    context: Context
    paddingIndex: number
}

interface Point {
    x: number,
    y: number
}

const props = defineProps<Props>();
const paddingBox = ref<Box[]>([]);
const matrix = reactive(new Matrix());
const paddingRect = ref<SVGPathElement[]>([]);

function update() {
    update_padding_position();
}

const update_padding_position = () => {
    getPaddingPosition();
}

function getPaddingPosition() {
    paddingBox.value = [];
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length || shapes.length > 1) return;
    const shape = shapes[0] as ArtboardView;
    const { x, y, width, height } = shape.frame;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = shape.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    // 上边距
    const topPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + autoLayout.stackVerticalPadding),
        ColVector3D.FromXY(x, y + autoLayout.stackVerticalPadding)
    ]);
    const top: Box = { lt: topPadding[0], rt: topPadding[1], rb: topPadding[2], lb: topPadding[3] };
    // 右边距
    const rightPadding = m.transform([
        ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, y + height)
    ]);
    const right: Box = { lt: rightPadding[0], rt: rightPadding[1], rb: rightPadding[2], lb: rightPadding[3] };
    // 下边距
    const bottomPadding = m.transform([
        ColVector3D.FromXY(x, y + height - autoLayout.stackPaddingBottom),
        ColVector3D.FromXY(x + width, y + height - autoLayout.stackPaddingBottom),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height)
    ]);
    const bottom: Box = { lt: bottomPadding[0], rt: bottomPadding[1], rb: bottomPadding[2], lb: bottomPadding[3] };
    // 左边距
    const leftPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + autoLayout.stackHorizontalPadding, y),
        ColVector3D.FromXY(x + autoLayout.stackHorizontalPadding, y + height),
        ColVector3D.FromXY(x, y + height)
    ]);
    const left: Box = { lt: leftPadding[0], rt: leftPadding[1], rb: leftPadding[2], lb: leftPadding[3] };
    paddingBox.value.push(top, right, bottom, left);
}

const mouseenter = (e: MouseEvent, index: number) => {
    const el = paddingRect.value[index];
    if (props.context.workspace.transforming) {
        return;
    }
    if (el) el.style.fill = 'pink';
}

const mouseleave = (e: MouseEvent, index: number) => {
    const el = paddingRect.value[index];
    if (el && index !== props.paddingIndex) {
        el.style.fill = 'transparent';
    }
}

watch(() => props.paddingIndex, (v) => {
    if (props.context.workspace.transforming) {
        return;
    }
    if (props.paddingIndex > -1) {
        const el = paddingRect.value[props.paddingIndex];
        if (el) {
            el.style.fill = 'pink';
        }
    }
})

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes;
    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(update);
        watchedShapes.set(k, v);
    })
}

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}
const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        update();
        watchShapes();
    }
}
onMounted(() => {
    update();
    watchShapes();
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
})
</script>

<template>
    <g v-if="paddingBox.length">
        <path v-for="(box, index) in paddingBox" :key="index" class="padding-rect" ref="paddingRect"
            @mouseenter="(e) => mouseenter(e, index)" @mouseleave="(e) => mouseleave(e, index)"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
    </g>
</template>

<style scoped lang="scss">
.padding-rect {
    fill: transparent;
    opacity: 0.5;
}
</style>