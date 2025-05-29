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
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { Matrix } from "@kcdesign/data";
import { User } from "@/context/user";

interface Props {
    context: Context,
    params: any
}

const props = defineProps<Props>();

const rows = ref<number[]>([]);
const cols = ref<number[]>([]);
const view = ref<boolean>(false);
const mWidth = ref<number>(0);
const mHeight = ref<number>(0);

const EMIT_VAL = 5.34;

function render() {
    if (!props.context.user.isPixelGrid) {
        view.value = false;
        return;
    }
    const root = props.context.workspace.root;
    const matrix = props.context.workspace.matrix;

    const scale = matrix.m00;
    if (scale < EMIT_VAL) {
        view.value = false;
        return;
    }

    view.value = true;
    rows.value.length = 0;
    cols.value.length = 0;

    const { width, height } = root;

    const step = scale;

    mWidth.value = width;
    mHeight.value = height;

    const rowsCount = Math.round(height / scale);
    const colsCount = Math.round(width / scale);

    const inverseMatrix = new Matrix(matrix.inverse);

    const xyOnPage = inverseMatrix.computeCoord2(0, 0);

    const { x: fx, y: fy } = matrix.computeCoord2(Math.ceil(xyOnPage.x), Math.ceil(xyOnPage.y));

    rows.value.push(fy);
    for (let i = 1; i < rowsCount; i++) {
        rows.value.push(fy + i * step);
    }
    cols.value.push(fx);
    for (let i = 1; i < colsCount; i++) {
        cols.value.push(fx + i * step);
    }
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        render();
    }
}

function userWatcher(t: number) {
    if (t === User.GRID_STATUS_CHANGE) {
        render();
    }
}

onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
    props.context.user.watch(userWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.user.unwatch(userWatcher);
})
</script>

<template>
    <svg v-if="view" :width="mWidth" :height="mHeight">
        <g>
            <line class="white-line" v-for="(y, idx) in rows" :key="idx" :x1="0" :y1="y" :x2="mWidth" :y2="y"></line>
        </g>
        <g>
            <line class="white-line" v-for="(x, idx) in cols" :key="idx" :x1="x" :y1="0" :x2="x" :y2="mHeight"></line>
        </g>
        <g>
            <line class="black-line" v-for="(y, idx) in rows" :key="idx" :x1="0" :y1="y" :x2="mWidth" :y2="y"></line>
        </g>
        <g>
            <line class="black-line" v-for="(x, idx) in cols" :key="idx" :x1="x" :y1="0" :x2="x" :y2="mHeight"></line>
        </g>
    </svg>
</template>
<style scoped lang="scss">
svg {
    overflow: visible;
    position: fixed;
    pointer-events: none;

    .white-line {
        stroke: rgba(255, 255, 255, 1);
        stroke-width: 0.1px;
    }

    .black-line {
        stroke: rgba(0, 0, 0, 0.5);
        stroke-width: 0.1px;
    }
}
</style>